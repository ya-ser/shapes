/**
 * Performance utility functions for SHAPES application
 * Provides debounce, throttle, performance monitoring, and bundle size tracking
 */

/**
 * Debounce function to limit the rate of function execution
 * Useful for animations and user input handling
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay, immediate = false) => {
  let timeoutId;
  let lastCallTime = 0;
  
  return function debounced(...args) {
    const context = this;
    const callTime = Date.now();
    
    const later = () => {
      timeoutId = null;
      if (!immediate) {
        lastCallTime = Date.now();
        func.apply(context, args);
      }
    };
    
    const callNow = immediate && !timeoutId;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, delay);
    
    if (callNow) {
      lastCallTime = callTime;
      func.apply(context, args);
    }
  };
};

/**
 * Throttle function to limit function execution to once per interval
 * Useful for scroll events and animation frame limiting
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @param {Object} options - Configuration options
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit, options = {}) => {
  const { leading = true, trailing = true } = options;
  let inThrottle;
  let lastFunc;
  let lastRan;
  
  return function throttled(...args) {
    const context = this;
    
    if (!inThrottle) {
      if (leading) {
        func.apply(context, args);
        lastRan = Date.now();
      }
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          if (trailing) {
            func.apply(context, args);
          }
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

/**
 * RequestAnimationFrame-based throttle for smooth animations
 * @param {Function} func - Function to throttle
 * @returns {Function} RAF-throttled function
 */
export const rafThrottle = (func) => {
  let rafId = null;
  let lastArgs = null;
  
  return function rafThrottled(...args) {
    lastArgs = args;
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(this, lastArgs);
        rafId = null;
      });
    }
  };
};

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      animationFPS: 0,
      memoryUsage: 0,
      bundleSize: 0,
      networkRequests: [],
      customMetrics: new Map()
    };
    
    this.observers = [];
    this.startTime = performance.now();
    this.frameCount = 0;
    this.lastFrameTime = 0;
    
    this.init();
  }
  
  /**
   * Initialize performance monitoring
   */
  init() {
    // Monitor page load performance
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.measureLoadTime();
      });
      
      // Monitor memory usage if available
      if ('memory' in performance) {
        this.measureMemoryUsage();
      }
      
      // Start FPS monitoring
      this.startFPSMonitoring();
    }
  }
  
  /**
   * Measure page load time
   */
  measureLoadTime() {
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.metrics.loadTime = loadTime;
    } else if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        this.metrics.loadTime = navigationEntries[0].loadEventEnd;
      }
    }
  }
  
  /**
   * Measure memory usage
   */
  measureMemoryUsage() {
    if (performance.memory) {
      this.metrics.memoryUsage = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
  }
  
  /**
   * Start FPS monitoring using requestAnimationFrame
   */
  startFPSMonitoring() {
    let frameCount = 0;
    let startTime = performance.now();
    
    const countFrame = (currentTime) => {
      frameCount++;
      
      // Calculate FPS every second
      if (currentTime - startTime >= 1000) {
        this.metrics.animationFPS = Math.round((frameCount * 1000) / (currentTime - startTime));
        frameCount = 0;
        startTime = currentTime;
      }
      
      requestAnimationFrame(countFrame);
    };
    
    requestAnimationFrame(countFrame);
  }
  
  /**
   * Measure render time for a specific operation
   * @param {string} name - Name of the operation
   * @param {Function} operation - Function to measure
   * @returns {*} Result of the operation
   */
  async measureRenderTime(name, operation) {
    const startTime = performance.now();
    const result = await operation();
    const endTime = performance.now();
    
    this.metrics.customMetrics.set(name, {
      renderTime: endTime - startTime,
      timestamp: Date.now()
    });
    
    return result;
  }
  
  /**
   * Track network requests
   * @param {string} url - Request URL
   * @param {string} method - HTTP method
   * @param {number} duration - Request duration
   * @param {number} size - Response size
   */
  trackNetworkRequest(url, method, duration, size) {
    this.metrics.networkRequests.push({
      url,
      method,
      duration,
      size,
      timestamp: Date.now()
    });
    
    // Keep only last 100 requests
    if (this.metrics.networkRequests.length > 100) {
      this.metrics.networkRequests.shift();
    }
  }
  
  /**
   * Get current performance metrics
   * @returns {Object} Current metrics
   */
  getMetrics() {
    this.measureMemoryUsage();
    return { ...this.metrics };
  }
  
  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      animationFPS: 0,
      memoryUsage: 0,
      bundleSize: 0,
      networkRequests: [],
      customMetrics: new Map()
    };
    this.startTime = performance.now();
  }
  
  /**
   * Add performance observer
   * @param {Function} callback - Callback function
   */
  addObserver(callback) {
    this.observers.push(callback);
  }
  
  /**
   * Remove performance observer
   * @param {Function} callback - Callback function to remove
   */
  removeObserver(callback) {
    const index = this.observers.indexOf(callback);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
  
  /**
   * Notify all observers of metric changes
   */
  notifyObservers() {
    const metrics = this.getMetrics();
    this.observers.forEach(callback => callback(metrics));
  }
}

/**
 * Bundle size tracking utilities
 */
export class BundleSizeTracker {
  constructor() {
    this.sizes = new Map();
    this.thresholds = {
      warning: 250 * 1024, // 250KB
      error: 500 * 1024    // 500KB
    };
  }
  
  /**
   * Track bundle size for a specific chunk
   * @param {string} chunkName - Name of the chunk
   * @param {number} size - Size in bytes
   */
  trackChunkSize(chunkName, size) {
    this.sizes.set(chunkName, {
      size,
      timestamp: Date.now(),
      status: this.getStatus(size)
    });
  }
  
  /**
   * Get status based on size thresholds
   * @param {number} size - Size in bytes
   * @returns {string} Status (ok, warning, error)
   */
  getStatus(size) {
    if (size >= this.thresholds.error) return 'error';
    if (size >= this.thresholds.warning) return 'warning';
    return 'ok';
  }
  
  /**
   * Get total bundle size
   * @returns {number} Total size in bytes
   */
  getTotalSize() {
    let total = 0;
    for (const [, data] of this.sizes) {
      total += data.size;
    }
    return total;
  }
  
  /**
   * Get size report
   * @returns {Object} Size report with details
   */
  getReport() {
    const chunks = Array.from(this.sizes.entries()).map(([name, data]) => ({
      name,
      ...data,
      sizeFormatted: this.formatSize(data.size)
    }));
    
    const totalSize = this.getTotalSize();
    
    return {
      chunks,
      totalSize,
      totalSizeFormatted: this.formatSize(totalSize),
      status: this.getStatus(totalSize),
      timestamp: Date.now()
    };
  }
  
  /**
   * Format size in human-readable format
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
  
  /**
   * Set size thresholds
   * @param {Object} thresholds - Warning and error thresholds
   */
  setThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
  
  /**
   * Check if any chunks exceed thresholds
   * @returns {Array} Array of chunks that exceed thresholds
   */
  getViolations() {
    const violations = [];
    
    for (const [name, data] of this.sizes) {
      if (data.status !== 'ok') {
        violations.push({
          name,
          size: data.size,
          sizeFormatted: this.formatSize(data.size),
          status: data.status,
          threshold: data.status === 'error' ? this.thresholds.error : this.thresholds.warning
        });
      }
    }
    
    return violations;
  }
}

/**
 * Animation performance utilities
 */
export const animationUtils = {
  /**
   * Measure animation performance
   * @param {Function} animationFunction - Animation function to measure
   * @param {number} duration - Duration to measure (ms)
   * @returns {Promise<Object>} Performance metrics
   */
  measureAnimationPerformance: async (animationFunction, duration = 1000) => {
    const startTime = performance.now();
    let frameCount = 0;
    let droppedFrames = 0;
    const frameTimes = [];
    
    return new Promise((resolve) => {
      const measureFrame = (currentTime) => {
        const frameTime = currentTime - (frameTimes[frameTimes.length - 1] || startTime);
        frameTimes.push(currentTime);
        frameCount++;
        
        // Detect dropped frames (>16.67ms for 60fps)
        if (frameTime > 16.67) {
          droppedFrames++;
        }
        
        // Run animation function
        animationFunction(currentTime);
        
        // Continue measuring until duration is reached
        if (currentTime - startTime < duration) {
          requestAnimationFrame(measureFrame);
        } else {
          // Calculate metrics
          const totalTime = currentTime - startTime;
          const avgFPS = (frameCount / totalTime) * 1000;
          const avgFrameTime = frameTimes.reduce((a, b, i) => {
            if (i === 0) return 0;
            return a + (b - frameTimes[i - 1]);
          }, 0) / (frameTimes.length - 1);
          
          resolve({
            totalTime,
            frameCount,
            droppedFrames,
            avgFPS: Math.round(avgFPS),
            avgFrameTime: Math.round(avgFrameTime),
            droppedFramePercentage: Math.round((droppedFrames / frameCount) * 100)
          });
        }
      };
      
      requestAnimationFrame(measureFrame);
    });
  },
  
  /**
   * Create optimized animation loop
   * @param {Function} callback - Animation callback
   * @param {number} targetFPS - Target FPS (default: 60)
   * @returns {Object} Animation controller
   */
  createAnimationLoop: (callback, targetFPS = 60) => {
    const targetFrameTime = 1000 / targetFPS;
    let animationId = null;
    let lastFrameTime = 0;
    let isRunning = false;
    
    const loop = (currentTime) => {
      if (!isRunning) return;
      
      const deltaTime = currentTime - lastFrameTime;
      
      if (deltaTime >= targetFrameTime) {
        callback(currentTime, deltaTime);
        lastFrameTime = currentTime - (deltaTime % targetFrameTime);
      }
      
      animationId = requestAnimationFrame(loop);
    };
    
    return {
      start: () => {
        if (!isRunning) {
          isRunning = true;
          lastFrameTime = performance.now();
          animationId = requestAnimationFrame(loop);
        }
      },
      stop: () => {
        isRunning = false;
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      },
      isRunning: () => isRunning
    };
  }
};

// Create global instances
export const performanceMonitor = new PerformanceMonitor();
export const bundleSizeTracker = new BundleSizeTracker();

/**
 * Utility function to create performance-optimized event handlers
 * @param {Function} handler - Event handler function
 * @param {Object} options - Options for optimization
 * @returns {Function} Optimized event handler
 */
export const createOptimizedHandler = (handler, options = {}) => {
  const {
    debounceDelay = 0,
    throttleLimit = 0,
    useRAF = false
  } = options;
  
  if (useRAF) {
    return rafThrottle(handler);
  } else if (throttleLimit > 0) {
    return throttle(handler, throttleLimit);
  } else if (debounceDelay > 0) {
    return debounce(handler, debounceDelay);
  }
  
  return handler;
};

/**
 * Memory leak detection utility
 */
export const memoryLeakDetector = {
  listeners: new Set(),
  intervals: new Set(),
  timeouts: new Set(),
  
  /**
   * Track event listener for cleanup
   * @param {EventTarget} target - Event target
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  trackListener: (target, event, handler, options) => {
    const listener = { target, event, handler, options };
    memoryLeakDetector.listeners.add(listener);
    target.addEventListener(event, handler, options);
    return listener;
  },
  
  /**
   * Track interval for cleanup
   * @param {Function} callback - Interval callback
   * @param {number} delay - Interval delay
   */
  trackInterval: (callback, delay) => {
    const intervalId = setInterval(callback, delay);
    memoryLeakDetector.intervals.add(intervalId);
    return intervalId;
  },
  
  /**
   * Track timeout for cleanup
   * @param {Function} callback - Timeout callback
   * @param {number} delay - Timeout delay
   */
  trackTimeout: (callback, delay) => {
    const timeoutId = setTimeout(callback, delay);
    memoryLeakDetector.timeouts.add(timeoutId);
    return timeoutId;
  },
  
  /**
   * Clean up all tracked resources
   */
  cleanup: () => {
    // Remove event listeners
    memoryLeakDetector.listeners.forEach(({ target, event, handler, options }) => {
      target.removeEventListener(event, handler, options);
    });
    memoryLeakDetector.listeners.clear();
    
    // Clear intervals
    memoryLeakDetector.intervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    memoryLeakDetector.intervals.clear();
    
    // Clear timeouts
    memoryLeakDetector.timeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    memoryLeakDetector.timeouts.clear();
  }
};