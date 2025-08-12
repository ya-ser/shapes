/**
 * Cloudflare Workers script for edge-side optimizations
 * Handles caching, compression, and performance optimizations
 */

// Cache configuration
const CACHE_CONFIG = {
  static: 31536000, // 1 year for static assets
  html: 3600,       // 1 hour for HTML
  api: 300,         // 5 minutes for API responses
};

// Compression configuration
const COMPRESSION_TYPES = [
  'text/html',
  'text/css',
  'text/javascript',
  'application/javascript',
  'application/json',
  'text/plain',
  'image/svg+xml',
];

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cache = caches.default;
    
    // Create cache key
    const cacheKey = new Request(url.toString(), request);
    
    // Check cache first
    let response = await cache.match(cacheKey);
    
    if (!response) {
      // Fetch from origin
      response = await env.ASSETS.fetch(request);
      
      // Clone response for modification
      response = new Response(response.body, response);
      
      // Apply optimizations
      response = await applyOptimizations(response, url);
      
      // Cache the response
      if (shouldCache(response, url)) {
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }
    }
    
    return response;
  },
};

/**
 * Apply edge-side optimizations
 */
async function applyOptimizations(response, url) {
  const headers = new Headers(response.headers);
  
  // Set cache headers based on file type
  setCacheHeaders(headers, url);
  
  // Set security headers
  setSecurityHeaders(headers);
  
  // Set performance headers
  setPerformanceHeaders(headers);
  
  // Handle compression
  if (shouldCompress(response, headers)) {
    return await compressResponse(response, headers);
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Set cache headers based on file type
 */
function setCacheHeaders(headers, url) {
  const pathname = url.pathname;
  
  if (pathname.includes('/static/')) {
    // Static assets - long cache
    headers.set('Cache-Control', `public, max-age=${CACHE_CONFIG.static}, immutable`);
    headers.set('Expires', new Date(Date.now() + CACHE_CONFIG.static * 1000).toUTCString());
  } else if (pathname.endsWith('.html') || pathname === '/') {
    // HTML files - shorter cache
    headers.set('Cache-Control', `public, max-age=${CACHE_CONFIG.html}, must-revalidate`);
  } else if (pathname.endsWith('.js') || pathname.endsWith('.css')) {
    // JS/CSS files - long cache with hash
    headers.set('Cache-Control', `public, max-age=${CACHE_CONFIG.static}, immutable`);
  }
}

/**
 * Set security headers
 */
function setSecurityHeaders(headers) {
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self';"
  );
}

/**
 * Set performance headers
 */
function setPerformanceHeaders(headers) {
  headers.set('X-DNS-Prefetch-Control', 'on');
  headers.set('X-Powered-By', 'Cloudflare Workers');
  
  // Add timing headers for performance monitoring
  headers.set('Server-Timing', 'edge;dur=0');
}

/**
 * Check if response should be compressed
 */
function shouldCompress(response, headers) {
  const contentType = headers.get('content-type') || '';
  const contentEncoding = headers.get('content-encoding');
  
  // Don't compress if already compressed
  if (contentEncoding) {
    return false;
  }
  
  // Check if content type should be compressed
  return COMPRESSION_TYPES.some(type => contentType.includes(type));
}

/**
 * Compress response using gzip
 */
async function compressResponse(response, headers) {
  const stream = new CompressionStream('gzip');
  const compressedStream = response.body.pipeThrough(stream);
  
  headers.set('Content-Encoding', 'gzip');
  headers.delete('Content-Length'); // Let browser calculate
  
  return new Response(compressedStream, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Check if response should be cached
 */
function shouldCache(response, url) {
  // Don't cache error responses
  if (response.status >= 400) {
    return false;
  }
  
  // Don't cache POST requests
  if (url.searchParams.has('nocache')) {
    return false;
  }
  
  return true;
}