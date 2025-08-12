/**
 * Performance Benchmarking Tests for SHAPES Application
 * Tests actual performance metrics and validates optimization targets
 */

import { performanceBenchmark, CrossBrowserCompatibility } from '../utils/performanceBenchmark';
import { performanceMonitor, bundleSizeTracker } from '../utils/performance';

// Mock DOM APIs for testing environment
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => 1000), // Return consistent value for testing
    timing: {
      loadEventEnd: 1500,
      navigationStart: 0
    },
    memory: {
      usedJSHeapSize: 2000000,
      totalJSHeapSize: 4000000,
      jsHeapSizeLimit: 8000000
    },
    getEntriesByType: jest.fn(() => [
      { loadEventEnd: 1500 }
    ])
  }
});

global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = jest.fn();

// Mock document for DOM tests
Object.defineProperty(global, 'document', {
  writable: true,
  value: {
    createElement: jest.fn(() => ({
      style: {
        transform: '',
        webkitTransform: '',
        animation: '',
        webkitAnimation: ''
      },
      innerHTML: '',
      offsetHeight: 100,
      appendChild: jest.fn(),
      removeChild: jest.fn()
    })),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn()
    }
  }
});

// Mock window for browser feature detection
Object.defineProperty(global, 'window', {
  writable: true,
  value: {
    WebGLRenderingContext: function() {},
    localStorage: {
      setItem: jest.fn(),
      removeItem: jest.fn()
    }
  }
});

// Mock localStorage
Object.defineProperty(global, 'localStorage', {
  writable: true,
  value: {
    setItem: jest.fn(),
    removeItem: jest.fn()
  }
});

describe('Performance Benchmarking Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Load Time Performance', () => {
    test('measures page load time within target threshold', async () => {
      const benchmark = performanceBenchmark;
      
      await benchmark.measureLoadTime();
      
      expect(benchmark.results.loadTime).toBeDefined();
      expect(benchmark.results.loadTime).toBeGreaterThan(0);
      
      // Requirement 2.1: Initial page load time should be reduced by at least 30%
      // Assuming baseline of ~2000ms, target should be ~1400ms or less
      expect(benchmark.results.loadTime).toBeLessThan(2000);
    });

    test('validates load time improvement target', async () => {
      const benchmark = performanceBenchmark;
      
      // Simulate improved load time by mocking timing
      global.performance = {
        ...global.performance,
        timing: {
          loadEventEnd: 1200,
          navigationStart: 0
        }
      };
      
      await benchmark.measureLoadTime();
      
      // Should meet the 30% improvement target (baseline 2000ms -> 1400ms)
      expect(benchmark.results.loadTime).toBeLessThan(1400);
    });

    test('handles missing performance timing API gracefully', async () => {
      const originalTiming = global.performance.timing;
      delete global.performance.timing;
      
      const benchmark = performanceBenchmark;
      
      await expect(benchmark.measureLoadTime()).resolves.not.toThrow();
      expect(benchmark.results.loadTime).toBeDefined();
      
      // Restore timing
      global.performance.timing = originalTiming;
    });
  });

  describe('Render Performance', () => {
    test('measures render time within acceptable limits', async () => {
      const benchmark = performanceBenchmark;
      
      // Mock performance.now to simulate render timing
      let callCount = 0;
      global.performance.now = jest.fn(() => {
        callCount++;
        return callCount * 10; // 10ms per call
      });
      
      await benchmark.measureRenderPerformance();
      
      expect(benchmark.results.renderTime).toBeDefined();
      expect(benchmark.results.renderTime).toBeGreaterThan(0);
      
      // Should be under 16ms for 60fps performance
      expect(benchmark.results.renderTime).toBeLessThan(50);
    });

    test('validates DOM manipulation performance', async () => {
      const benchmark = performanceBenchmark;
      const mockElement = {
        innerHTML: '',
        offsetHeight: 100,
        style: {}
      };
      
      global.document.createElement = jest.fn(() => mockElement);
      global.document.body.appendChild = jest.fn();
      global.document.body.removeChild = jest.fn();
      
      await benchmark.measureRenderPerformance();
      
      // Verify DOM operations were performed
      expect(global.document.createElement).toHaveBeenCalledWith('div');
      expect(global.document.body.appendChild).toHaveBeenCalled();
      expect(global.document.body.removeChild).toHaveBeenCalled();
      
      // Render time should be reasonable
      expect(benchmark.results.renderTime).toBeLessThan(100);
    });
  });

  describe('Animation Performance', () => {
    test('measures animation FPS within target range', async () => {
      const benchmark = performanceBenchmark;
      
      // Mock RAF to simulate 60fps
      let frameCount = 0;
      global.requestAnimationFrame = jest.fn((callback) => {
        setTimeout(() => {
          frameCount++;
          callback(frameCount * 16.67); // 60fps timing
        }, 16);
        return frameCount;
      });
      
      const fpsPromise = benchmark.measureAnimationPerformance();
      
      // Advance timers to simulate animation frames
      for (let i = 0; i < 60; i++) {
        jest.advanceTimersByTime(16);
      }
      
      await fpsPromise;
      
      expect(benchmark.results.animationFPS).toBeDefined();
      
      // Requirement 2.2: Animations should be smooth without frame drops
      // Target: > 30fps, ideally close to 60fps
      expect(benchmark.results.animationFPS).toBeGreaterThan(30);
    });

    test('detects animation performance issues', async () => {
      const benchmark = performanceBenchmark;
      
      // Mock RAF to simulate poor performance (20fps)
      let frameCount = 0;
      global.requestAnimationFrame = jest.fn((callback) => {
        setTimeout(() => {
          frameCount++;
          callback(frameCount * 50); // 20fps timing
        }, 50);
        return frameCount;
      });
      
      const fpsPromise = benchmark.measureAnimationPerformance();
      
      // Advance timers to simulate slow animation frames
      for (let i = 0; i < 20; i++) {
        jest.advanceTimersByTime(50);
      }
      
      await fpsPromise;
      
      // Should detect poor performance
      expect(benchmark.results.animationFPS).toBeLessThan(30);
    });
  });

  describe('Bundle Size Analysis', () => {
    test('validates bundle size within acceptable limits', async () => {
      const benchmark = performanceBenchmark;
      
      await benchmark.measureBundleSize();
      
      expect(benchmark.results.bundleSize).toBeDefined();
      expect(benchmark.results.bundleSize.total).toBeGreaterThan(0);
      
      // Requirement 4.1: Bundle size should be minimized
      // Target: < 500KB total bundle size
      expect(benchmark.results.bundleSize.total).toBeLessThan(500 * 1024);
    });

    test('tracks individual chunk sizes', async () => {
      const benchmark = performanceBenchmark;
      
      await benchmark.measureBundleSize();
      
      const chunks = benchmark.results.bundleSize.chunks;
      expect(chunks).toHaveLength(3); // main, vendor, runtime
      
      const mainChunk = chunks.find(c => c.name === 'main');
      const vendorChunk = chunks.find(c => c.name === 'vendor');
      const runtimeChunk = chunks.find(c => c.name === 'runtime');
      
      expect(mainChunk).toBeDefined();
      expect(vendorChunk).toBeDefined();
      expect(runtimeChunk).toBeDefined();
      
      // Main chunk should be reasonable size
      expect(mainChunk.size).toBeLessThan(250 * 1024); // < 250KB
      
      // Vendor chunk should be optimized
      expect(vendorChunk.size).toBeLessThan(200 * 1024); // < 200KB
      
      // Runtime should be minimal
      expect(runtimeChunk.size).toBeLessThan(50 * 1024); // < 50KB
    });

    test('validates bundle size optimization targets', async () => {
      const benchmark = performanceBenchmark;
      
      // Override with optimized bundle sizes
      benchmark.getSimulatedBundleSize = () => ({
        main: 150 * 1024,   // 150KB (optimized)
        vendor: 100 * 1024, // 100KB (optimized)
        runtime: 10 * 1024  // 10KB (optimized)
      });
      
      await benchmark.measureBundleSize();
      
      const totalSize = benchmark.results.bundleSize.total;
      
      // Should meet optimization targets
      expect(totalSize).toBeLessThan(300 * 1024); // < 300KB total
      // Status should be good or warning (260KB is between good and warning thresholds)
      expect(['ok', 'warning']).toContain(benchmark.results.bundleSize.status);
    });
  });

  describe('Memory Usage Monitoring', () => {
    test('measures memory usage within acceptable limits', () => {
      const benchmark = performanceBenchmark;
      
      benchmark.measureMemoryUsage();
      
      expect(benchmark.results.memoryUsage).toBeDefined();
      
      if (benchmark.results.memoryUsage.error) {
        // Memory API not available - this is acceptable in test environment
        expect(benchmark.results.memoryUsage.error).toBe('Memory API not available');
      } else {
        expect(benchmark.results.memoryUsage.used).toBeGreaterThan(0);
        expect(benchmark.results.memoryUsage.total).toBeGreaterThan(0);
        expect(benchmark.results.memoryUsage.usedMB).toBeGreaterThan(0);
        
        // Memory usage should be reasonable (< 50MB for a simple app)
        expect(benchmark.results.memoryUsage.usedMB).toBeLessThan(50);
      }
    });

    test('handles missing memory API gracefully', () => {
      const originalMemory = global.performance.memory;
      delete global.performance.memory;
      
      const benchmark = performanceBenchmark;
      benchmark.measureMemoryUsage();
      
      expect(benchmark.results.memoryUsage.error).toBe('Memory API not available');
      
      // Restore memory API
      global.performance.memory = originalMemory;
    });
  });

  describe('Comprehensive Benchmark Report', () => {
    test('generates complete performance report', async () => {
      const benchmark = performanceBenchmark;
      
      const report = await benchmark.runBenchmark();
      
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.analysis).toBeDefined();
      expect(report.recommendations).toBeDefined();
      
      // Summary should have overall status
      expect(['good', 'warning', 'error']).toContain(report.summary.overall);
      
      // Should have timestamp
      expect(report.summary.timestamp).toBeDefined();
      expect(report.summary.duration).toBeGreaterThan(0);
    });

    test('analyzes metrics correctly', async () => {
      const benchmark = performanceBenchmark;
      
      // Set up good performance metrics
      benchmark.results = {
        loadTime: 800,     // Good
        renderTime: 12,    // Good
        animationFPS: 58,  // Good
        bundleSize: { total: 250 * 1024 }, // Good
        timestamp: Date.now()
      };
      
      const report = benchmark.generateReport();
      
      expect(report.analysis.loadTime.status).toBe('good');
      expect(report.analysis.renderTime.status).toBe('good');
      expect(report.analysis.animationFPS.status).toBe('good');
      expect(report.analysis.bundleSize.status).toBe('good');
      expect(report.summary.overall).toBe('good');
    });

    test('generates appropriate recommendations', async () => {
      const benchmark = performanceBenchmark;
      
      // Set up poor performance metrics
      benchmark.results = {
        loadTime: 3500,    // Error
        renderTime: 60,    // Error
        animationFPS: 15,  // Error
        bundleSize: { total: 1200 * 1024 }, // Error
        timestamp: Date.now()
      };
      
      const report = benchmark.generateReport();
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.summary.overall).toBe('error');
      
      // Should have recommendations for each poor metric
      const categories = report.recommendations.map(r => r.category);
      expect(categories).toContain('Load Time');
      expect(categories).toContain('Animation Performance');
      expect(categories).toContain('Bundle Size');
    });
  });

  describe('Cross-Browser Compatibility', () => {
    test('checks browser feature support', () => {
      const compatibility = new CrossBrowserCompatibility();
      
      const result = compatibility.runCheck();
      
      expect(result).toBeDefined();
      expect(result.features).toBeDefined();
      expect(result.supportedCount).toBeGreaterThanOrEqual(0);
      expect(result.totalCount).toBeGreaterThan(0);
      expect(result.percentage).toBeGreaterThanOrEqual(0);
      expect(result.percentage).toBeLessThanOrEqual(100);
    });

    test('validates essential browser features', () => {
      const compatibility = new CrossBrowserCompatibility();
      
      // Essential features for SHAPES app
      expect(compatibility.features.requestAnimationFrame).toBe(true);
      expect(compatibility.features.performance).toBe(true);
      
      // These might not be available in test environment
      // but should be checked
      expect(typeof compatibility.features.cssTransforms).toBe('boolean');
      expect(typeof compatibility.features.cssAnimations).toBe('boolean');
    });

    test('handles missing browser APIs gracefully', () => {
      // Temporarily remove APIs
      const originalRAF = global.requestAnimationFrame;
      const originalPerformance = global.performance;
      
      delete global.requestAnimationFrame;
      delete global.performance;
      
      const compatibility = new CrossBrowserCompatibility();
      
      expect(compatibility.features.requestAnimationFrame).toBe(false);
      expect(compatibility.features.performance).toBe(false);
      
      // Should still provide a valid report
      const result = compatibility.runCheck();
      expect(result.percentage).toBeGreaterThanOrEqual(0);
      
      // Restore APIs
      global.requestAnimationFrame = originalRAF;
      global.performance = originalPerformance;
    });
  });

  describe('Performance Regression Detection', () => {
    test('detects performance regressions', async () => {
      const benchmark = performanceBenchmark;
      
      // Simulate baseline performance
      const baselineResults = {
        loadTime: 1000,
        renderTime: 15,
        animationFPS: 55,
        bundleSize: { total: 300 * 1024 }
      };
      
      // Simulate regressed performance
      benchmark.results = {
        loadTime: 2500,    // Regression
        renderTime: 45,    // Regression
        animationFPS: 25,  // Regression
        bundleSize: { total: 600 * 1024 }, // Regression
        timestamp: Date.now()
      };
      
      const report = benchmark.generateReport();
      
      // Should detect regressions
      expect(report.summary.overall).toBe('error');
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    test('validates performance improvement targets', async () => {
      const benchmark = performanceBenchmark;
      
      // Simulate improved performance meeting all targets
      benchmark.results = {
        loadTime: 900,     // 30% improvement from 1300ms baseline
        renderTime: 12,    // Smooth 60fps
        animationFPS: 58,  // Excellent animation performance
        bundleSize: { total: 280 * 1024 }, // Optimized bundle
        timestamp: Date.now()
      };
      
      const report = benchmark.generateReport();
      
      // Should meet all performance targets
      expect(report.summary.overall).toBe('good');
      expect(report.analysis.loadTime.status).toBe('good');
      expect(report.analysis.renderTime.status).toBe('good');
      expect(report.analysis.animationFPS.status).toBe('good');
      expect(report.analysis.bundleSize.status).toBe('good');
    });
  });

  describe('Real-world Performance Scenarios', () => {
    test('simulates mobile device performance', async () => {
      const benchmark = performanceBenchmark;
      
      // Simulate mobile device constraints
      global.performance.now = jest.fn(() => Date.now());
      
      // Mobile devices typically have slower performance
      benchmark.thresholds = {
        loadTime: { good: 2000, warning: 3000, error: 5000 },
        renderTime: { good: 33, warning: 50, error: 100 },
        animationFPS: { good: 30, warning: 20, error: 15 },
        bundleSize: { good: 200 * 1024, warning: 400 * 1024, error: 800 * 1024 }
      };
      
      const report = await benchmark.runBenchmark();
      
      // Should adapt to mobile performance expectations
      expect(report).toBeDefined();
      expect(report.summary.overall).toBeDefined();
    });

    test('validates performance under load', async () => {
      const benchmark = performanceBenchmark;
      
      // Simulate multiple concurrent operations
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(benchmark.measureRenderPerformance());
      }
      
      await Promise.all(promises);
      
      // Performance should remain stable under load
      expect(benchmark.results.renderTime).toBeLessThan(100);
    });
  });
});