import {
  debounce,
  throttle,
  rafThrottle,
  PerformanceMonitor,
  BundleSizeTracker,
  animationUtils,
  createOptimizedHandler,
  memoryLeakDetector
} from '../performance';

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  timing: {
    loadEventEnd: 1000,
    navigationStart: 0
  },
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  },
  getEntriesByType: jest.fn(() => [])
};

describe('Debounce Function', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('delays function execution', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('cancels previous calls when called multiple times', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('executes immediately when immediate flag is true', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100, true);

    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(1); // Should not call again immediately
  });

  test('passes arguments correctly', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('arg1', 'arg2');
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  test('preserves context', () => {
    const mockFn = jest.fn();
    const context = { name: 'test' };
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn.call(context);
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith();
  });
});

describe('Throttle Function', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('limits function execution rate', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(2); // Leading + trailing
  });

  test('respects leading option', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100, { leading: false });

    throttledFn();
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    // With leading: false, the function should be called on trailing edge
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('respects trailing option', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100, { trailing: false });

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    throttledFn();
    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1); // No trailing call
  });

  test('passes arguments correctly', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn('arg1', 'arg2');
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('RAF Throttle Function', () => {
  test('throttles using requestAnimationFrame', () => {
    const mockFn = jest.fn();
    const rafThrottledFn = rafThrottle(mockFn);

    rafThrottledFn();
    rafThrottledFn();
    rafThrottledFn();

    expect(global.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(mockFn).not.toHaveBeenCalled();

    // Execute the RAF callback
    const rafCallback = global.requestAnimationFrame.mock.calls[0][0];
    rafCallback();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('uses latest arguments', () => {
    const mockFn = jest.fn();
    const rafThrottledFn = rafThrottle(mockFn);

    rafThrottledFn('first');
    rafThrottledFn('second');
    rafThrottledFn('third');

    const rafCallback = global.requestAnimationFrame.mock.calls[0][0];
    rafCallback();

    expect(mockFn).toHaveBeenCalledWith('third');
  });
});

describe('PerformanceMonitor Class', () => {
  let monitor;

  beforeEach(() => {
    jest.clearAllMocks();
    monitor = new PerformanceMonitor();
  });

  test('initializes with default metrics', () => {
    const metrics = monitor.getMetrics();

    expect(metrics).toEqual(expect.objectContaining({
      loadTime: expect.any(Number),
      renderTime: 0,
      animationFPS: expect.any(Number),
      bundleSize: 0,
      networkRequests: expect.any(Array),
      customMetrics: expect.any(Map)
    }));
    
    expect(typeof metrics.memoryUsage).toBe('object');
  });

  test('measures render time', async () => {
    const mockOperation = jest.fn().mockResolvedValue('result');
    
    const result = await monitor.measureRenderTime('test-operation', mockOperation);

    expect(result).toBe('result');
    expect(mockOperation).toHaveBeenCalled();
    
    const metrics = monitor.getMetrics();
    expect(metrics.customMetrics.has('test-operation')).toBe(true);
    
    const operationMetrics = metrics.customMetrics.get('test-operation');
    expect(operationMetrics).toEqual(expect.objectContaining({
      renderTime: expect.any(Number),
      timestamp: expect.any(Number)
    }));
  });

  test('tracks network requests', () => {
    monitor.trackNetworkRequest('/api/data', 'GET', 150, 1024);

    const metrics = monitor.getMetrics();
    expect(metrics.networkRequests).toHaveLength(1);
    expect(metrics.networkRequests[0]).toEqual({
      url: '/api/data',
      method: 'GET',
      duration: 150,
      size: 1024,
      timestamp: expect.any(Number)
    });
  });

  test('limits network request history', () => {
    // Add more than 100 requests
    for (let i = 0; i < 105; i++) {
      monitor.trackNetworkRequest(`/api/data${i}`, 'GET', 100, 1024);
    }

    const metrics = monitor.getMetrics();
    expect(metrics.networkRequests).toHaveLength(100);
  });

  test('adds and removes observers', () => {
    const observer1 = jest.fn();
    const observer2 = jest.fn();

    monitor.addObserver(observer1);
    monitor.addObserver(observer2);

    monitor.notifyObservers();

    expect(observer1).toHaveBeenCalled();
    expect(observer2).toHaveBeenCalled();

    monitor.removeObserver(observer1);
    jest.clearAllMocks();

    monitor.notifyObservers();

    expect(observer1).not.toHaveBeenCalled();
    expect(observer2).toHaveBeenCalled();
  });

  test('resets metrics', () => {
    monitor.trackNetworkRequest('/api/data', 'GET', 150, 1024);
    
    let metrics = monitor.getMetrics();
    expect(metrics.networkRequests).toHaveLength(1);

    monitor.reset();
    
    metrics = monitor.getMetrics();
    expect(metrics.networkRequests).toHaveLength(0);
    expect(metrics.customMetrics.size).toBe(0);
  });
});

describe('BundleSizeTracker Class', () => {
  let tracker;

  beforeEach(() => {
    tracker = new BundleSizeTracker();
  });

  test('tracks chunk sizes', () => {
    tracker.trackChunkSize('main', 100000);
    tracker.trackChunkSize('vendor', 200000);

    const report = tracker.getReport();
    expect(report.chunks).toHaveLength(2);
    expect(report.totalSize).toBe(300000);
  });

  test('determines status based on thresholds', () => {
    tracker.trackChunkSize('small', 100000); // OK
    tracker.trackChunkSize('medium', 300000); // Warning
    tracker.trackChunkSize('large', 600000); // Error

    const report = tracker.getReport();
    
    const smallChunk = report.chunks.find(c => c.name === 'small');
    const mediumChunk = report.chunks.find(c => c.name === 'medium');
    const largeChunk = report.chunks.find(c => c.name === 'large');

    expect(smallChunk.status).toBe('ok');
    expect(mediumChunk.status).toBe('warning');
    expect(largeChunk.status).toBe('error');
  });

  test('formats sizes correctly', () => {
    expect(tracker.formatSize(1024)).toBe('1.0 KB');
    expect(tracker.formatSize(1048576)).toBe('1.0 MB');
    expect(tracker.formatSize(1073741824)).toBe('1.0 GB');
  });

  test('gets violations', () => {
    tracker.trackChunkSize('ok-chunk', 100000);
    tracker.trackChunkSize('warning-chunk', 300000);
    tracker.trackChunkSize('error-chunk', 600000);

    const violations = tracker.getViolations();
    expect(violations).toHaveLength(2);
    
    const warningViolation = violations.find(v => v.name === 'warning-chunk');
    const errorViolation = violations.find(v => v.name === 'error-chunk');

    expect(warningViolation.status).toBe('warning');
    expect(errorViolation.status).toBe('error');
  });

  test('sets custom thresholds', () => {
    tracker.setThresholds({ warning: 100000, error: 200000 });
    
    tracker.trackChunkSize('test', 150000);
    const report = tracker.getReport();
    
    const chunk = report.chunks.find(c => c.name === 'test');
    expect(chunk.status).toBe('warning');
  });
});

describe('Animation Utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('measureAnimationPerformance measures animation metrics', async () => {
    const mockAnimation = jest.fn();
    
    const metricsPromise = animationUtils.measureAnimationPerformance(mockAnimation, 100);
    
    // Advance time and trigger RAF callbacks
    jest.advanceTimersByTime(100);
    
    const metrics = await metricsPromise;
    
    expect(metrics).toEqual(expect.objectContaining({
      totalTime: expect.any(Number),
      frameCount: expect.any(Number),
      droppedFrames: expect.any(Number),
      avgFPS: expect.any(Number),
      avgFrameTime: expect.any(Number),
      droppedFramePercentage: expect.any(Number)
    }));
  });

  test('createAnimationLoop creates controllable animation loop', () => {
    const mockCallback = jest.fn();
    const loop = animationUtils.createAnimationLoop(mockCallback, 30); // 30 FPS

    expect(loop.isRunning()).toBe(false);

    loop.start();
    expect(loop.isRunning()).toBe(true);

    loop.stop();
    expect(loop.isRunning()).toBe(false);
  });
});

describe('createOptimizedHandler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns original handler when no optimization specified', () => {
    const mockHandler = jest.fn();
    const optimizedHandler = createOptimizedHandler(mockHandler);

    expect(optimizedHandler).toBe(mockHandler);
  });

  test('applies debounce when debounceDelay is specified', () => {
    const mockHandler = jest.fn();
    const optimizedHandler = createOptimizedHandler(mockHandler, { debounceDelay: 100 });

    optimizedHandler();
    expect(mockHandler).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  test('applies throttle when throttleLimit is specified', () => {
    const mockHandler = jest.fn();
    const optimizedHandler = createOptimizedHandler(mockHandler, { throttleLimit: 100 });

    optimizedHandler();
    expect(mockHandler).toHaveBeenCalledTimes(1);

    optimizedHandler();
    expect(mockHandler).toHaveBeenCalledTimes(1); // Throttled
  });

  test('applies RAF throttle when useRAF is true', () => {
    const mockHandler = jest.fn();
    const optimizedHandler = createOptimizedHandler(mockHandler, { useRAF: true });

    // The handler should be different from the original (wrapped)
    expect(optimizedHandler).not.toBe(mockHandler);
    
    // Call the optimized handler
    optimizedHandler();
    
    // The original handler should not be called immediately
    expect(mockHandler).not.toHaveBeenCalled();
  });
});

describe('Memory Leak Detector', () => {
  let mockElement;

  beforeEach(() => {
    mockElement = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    
    jest.clearAllMocks();
    memoryLeakDetector.cleanup(); // Clean up any previous state
  });

  test('tracks event listeners', () => {
    const mockHandler = jest.fn();
    
    memoryLeakDetector.trackListener(mockElement, 'click', mockHandler);
    
    expect(mockElement.addEventListener).toHaveBeenCalledWith('click', mockHandler, undefined);
    expect(memoryLeakDetector.listeners.size).toBe(1);
  });

  test('tracks intervals', () => {
    const mockCallback = jest.fn();
    
    const intervalId = memoryLeakDetector.trackInterval(mockCallback, 1000);
    
    expect(typeof intervalId).toBe('number');
    expect(memoryLeakDetector.intervals.size).toBe(1);
  });

  test('tracks timeouts', () => {
    const mockCallback = jest.fn();
    
    const timeoutId = memoryLeakDetector.trackTimeout(mockCallback, 1000);
    
    expect(typeof timeoutId).toBe('number');
    expect(memoryLeakDetector.timeouts.size).toBe(1);
  });

  test('cleans up all tracked resources', () => {
    const mockHandler = jest.fn();
    const mockCallback = jest.fn();
    
    memoryLeakDetector.trackListener(mockElement, 'click', mockHandler);
    memoryLeakDetector.trackInterval(mockCallback, 1000);
    memoryLeakDetector.trackTimeout(mockCallback, 1000);
    
    expect(memoryLeakDetector.listeners.size).toBe(1);
    expect(memoryLeakDetector.intervals.size).toBe(1);
    expect(memoryLeakDetector.timeouts.size).toBe(1);
    
    memoryLeakDetector.cleanup();
    
    expect(mockElement.removeEventListener).toHaveBeenCalledWith('click', mockHandler, undefined);
    expect(memoryLeakDetector.listeners.size).toBe(0);
    expect(memoryLeakDetector.intervals.size).toBe(0);
    expect(memoryLeakDetector.timeouts.size).toBe(0);
  });
});