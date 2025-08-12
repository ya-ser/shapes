/**
 * Performance and Visual Regression Tests
 * Tests for bundle size regression, animation performance, and UI consistency
 */

import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Terminal from '../components/Terminal';
import { BundleSizeTracker, animationUtils, performanceMonitor } from '../utils/performance';

// Mock the file content module
jest.mock('../data/fileContent', () => ({
  getFileByKey: jest.fn(() => ({ content: 'Mock content' })),
  getAllFiles: jest.fn(() => [
    { key: 'home', name: 'HOME.txt', status: '[████████░░] 100% loaded', progress: 100, encrypted: false },
    { key: 'projects', name: 'PROJECTS.txt', status: '[██████░░░░] 60% loaded', progress: 60, encrypted: false }
  ]),
  fileSystemHeader: { command: 'ls -la /home/user/projects/shapes', status: '[████████░░] 89% indexed' },
  statusBarContent: { terminal: 'Terminal v2.1.3', project: 'SHAPES', user: 'user@shapes:~$' },
  headerContent: { logo: 'SHAPES', subtitle: 'Digital Design Laboratory' }
}));

// Mock the animations hook
jest.mock('../hooks/useAnimations', () => ({
  useAnimations: () => ({
    currentSequence: 'identity',
    startMorphing: jest.fn(),
    stopMorphing: jest.fn(),
    getCurrentFrameContent: jest.fn(() => 'Mock ASCII Art'),
    availableSequences: ['identity', 'loading', 'concepts'],
    performanceMetrics: { fps: 60, totalFrames: 100, droppedFrames: 0 },
    isAnimating: true
  })
}));

// Mock performance APIs
global.performance = {
  now: jest.fn(() => Date.now()),
  timing: { loadEventEnd: 1000, navigationStart: 0 },
  memory: { usedJSHeapSize: 1000000, totalJSHeapSize: 2000000, jsHeapSizeLimit: 4000000 },
  getEntriesByType: jest.fn(() => [])
};

global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

describe('Performance Regression Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Bundle Size Regression Testing', () => {
    let bundleTracker;

    beforeEach(() => {
      bundleTracker = new BundleSizeTracker();
      // Set realistic thresholds for the SHAPES application
      bundleTracker.setThresholds({
        warning: 300 * 1024, // 300KB warning threshold
        error: 500 * 1024    // 500KB error threshold
      });
    });

    test('tracks main bundle size within acceptable limits', () => {
      // Simulate main bundle size (should be under warning threshold)
      const mainBundleSize = 250 * 1024; // 250KB
      bundleTracker.trackChunkSize('main', mainBundleSize);

      const report = bundleTracker.getReport();
      const mainChunk = report.chunks.find(c => c.name === 'main');

      expect(mainChunk.status).toBe('ok');
      expect(mainChunk.size).toBe(mainBundleSize);
      expect(mainChunk.sizeFormatted).toBe('250.0 KB');
    });

    test('detects bundle size violations', () => {
      // Simulate oversized bundles
      bundleTracker.trackChunkSize('main', 350 * 1024); // Warning
      bundleTracker.trackChunkSize('vendor', 600 * 1024); // Error

      const violations = bundleTracker.getViolations();
      expect(violations).toHaveLength(2);

      const warningViolation = violations.find(v => v.name === 'main');
      const errorViolation = violations.find(v => v.name === 'vendor');

      expect(warningViolation.status).toBe('warning');
      expect(errorViolation.status).toBe('error');
    });

    test('tracks total bundle size regression', () => {
      // Simulate realistic bundle sizes for SHAPES app
      bundleTracker.trackChunkSize('main', 200 * 1024);
      bundleTracker.trackChunkSize('vendor', 150 * 1024);
      bundleTracker.trackChunkSize('runtime', 10 * 1024);

      const report = bundleTracker.getReport();
      const totalSize = report.totalSize;

      // Total should be 360KB, which is acceptable
      expect(totalSize).toBe(360 * 1024);
      expect(report.status).toBe('warning'); // Over 300KB but under 500KB
    });

    test('monitors bundle size trends over time', () => {
      const sizes = [
        { name: 'main', size: 200 * 1024, timestamp: Date.now() - 86400000 }, // 1 day ago
        { name: 'main', size: 220 * 1024, timestamp: Date.now() - 43200000 }, // 12 hours ago
        { name: 'main', size: 250 * 1024, timestamp: Date.now() }              // Now
      ];

      sizes.forEach(({ name, size }) => {
        bundleTracker.trackChunkSize(name, size);
      });

      const report = bundleTracker.getReport();
      const mainChunk = report.chunks.find(c => c.name === 'main');

      // Should track the latest size
      expect(mainChunk.size).toBe(250 * 1024);
      expect(mainChunk.status).toBe('ok');
    });

    test('formats bundle sizes correctly for reporting', () => {
      bundleTracker.trackChunkSize('small', 1024);           // 1KB
      bundleTracker.trackChunkSize('medium', 1024 * 1024);   // 1MB
      bundleTracker.trackChunkSize('large', 1024 * 1024 * 1024); // 1GB

      const report = bundleTracker.getReport();
      
      expect(report.chunks.find(c => c.name === 'small').sizeFormatted).toBe('1.0 KB');
      expect(report.chunks.find(c => c.name === 'medium').sizeFormatted).toBe('1.0 MB');
      expect(report.chunks.find(c => c.name === 'large').sizeFormatted).toBe('1.0 GB');
    });
  });

  describe('Animation Performance Benchmarking', () => {
    test('measures animation frame rate performance', async () => {
      const mockAnimation = jest.fn();
      
      // Mock performance.now to simulate time progression
      let currentTime = 0;
      const originalNow = global.performance.now;
      global.performance.now = jest.fn(() => {
        currentTime += 16.67; // ~60 FPS
        return currentTime;
      });

      const metrics = await animationUtils.measureAnimationPerformance(mockAnimation, 100);

      expect(metrics).toEqual(expect.objectContaining({
        totalTime: expect.any(Number),
        frameCount: expect.any(Number),
        droppedFrames: expect.any(Number),
        avgFPS: expect.any(Number),
        avgFrameTime: expect.any(Number),
        droppedFramePercentage: expect.any(Number)
      }));

      // Should achieve good performance (>30 FPS)
      expect(metrics.avgFPS).toBeGreaterThan(30);
      expect(metrics.droppedFramePercentage).toBeLessThan(10); // Less than 10% dropped frames
      
      // Restore original
      global.performance.now = originalNow;
    });

    test('detects animation performance degradation', async () => {
      const slowAnimation = jest.fn(() => {
        // Simulate slow animation by advancing time more
        jest.advanceTimersByTime(50); // Simulate 50ms per frame (20 FPS)
      });

      let currentTime = 0;
      const originalNow = global.performance.now;
      global.performance.now = jest.fn(() => {
        currentTime += 50; // Simulate slow performance
        return currentTime;
      });

      const metrics = await animationUtils.measureAnimationPerformance(slowAnimation, 200);

      // Should detect poor performance
      expect(metrics.avgFPS).toBeLessThan(30);
      expect(metrics.droppedFramePercentage).toBeGreaterThan(0);
      
      // Restore original
      global.performance.now = originalNow;
    });

    test('benchmarks Terminal component animation performance', async () => {
      const { container } = render(<Terminal />);
      
      // Measure render performance
      const startTime = performance.now();
      
      // Simulate animation updates
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(16); // 60 FPS
        // Force re-render to simulate animation frames
        container.querySelector('.morph-display');
      }
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly (under 100ms for 10 frames)
      expect(renderTime).toBeLessThan(100);
    });

    test('monitors memory usage during animations', () => {
      const initialMemory = global.performance.memory.usedJSHeapSize;
      
      render(<Terminal />);
      
      // Simulate animation running
      jest.advanceTimersByTime(1000);
      
      const currentMemory = global.performance.memory.usedJSHeapSize;
      
      // Memory usage should not increase dramatically
      const memoryIncrease = currentMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(1000000); // Less than 1MB increase
    });

    test('validates animation loop performance', () => {
      const mockCallback = jest.fn();
      const loop = animationUtils.createAnimationLoop(mockCallback, 60); // 60 FPS target

      expect(loop.isRunning()).toBe(false);

      loop.start();
      expect(loop.isRunning()).toBe(true);

      // Simulate animation frames
      jest.advanceTimersByTime(100);

      loop.stop();
      expect(loop.isRunning()).toBe(false);
    });
  });

  describe('Visual Regression Tests', () => {
    test('renders consistent Terminal layout structure', () => {
      const { container } = render(<Terminal />);

      // Check main structural elements
      expect(container.querySelector('.terminal')).toBeInTheDocument();
      expect(container.querySelector('.header')).toBeInTheDocument();
      expect(container.querySelector('.morphing-container')).toBeInTheDocument();
      expect(container.querySelector('.file-system')).toBeInTheDocument();
      expect(container.querySelector('.status-bar')).toBeInTheDocument();
    });

    test('maintains consistent file system layout', () => {
      render(<Terminal />);

      // Check file system structure
      expect(screen.getByText('ls -la /home/user/projects/shapes')).toBeInTheDocument();
      expect(screen.getByText('HOME.txt')).toBeInTheDocument();
      expect(screen.getByText('PROJECTS.txt')).toBeInTheDocument();

      // Check progress bars are rendered
      const progressBars = document.querySelectorAll('.progress-bar');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    test('preserves header visual consistency', () => {
      render(<Terminal />);

      // Check header elements
      const logo = screen.getByText('SHAPES');
      const subtitle = screen.getByText('Digital Design Laboratory');

      expect(logo).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();

      // Check CSS classes for styling consistency
      expect(logo.closest('.header')).toHaveClass('header--animated');
      expect(logo).toHaveClass('logo', 'animate-glow');
      expect(subtitle).toHaveClass('subtitle', 'animate-typewriter');
    });

    test('maintains morphing display visual structure', () => {
      const { container } = render(<Terminal />);

      const morphingContainer = container.querySelector('.morphing-container');
      expect(morphingContainer).toBeInTheDocument();

      // Check orbital rings
      const outerOrbit = container.querySelector('.morphing-container__orbit--outer');
      const innerOrbit = container.querySelector('.morphing-container__orbit--inner');
      
      expect(outerOrbit).toBeInTheDocument();
      expect(innerOrbit).toBeInTheDocument();

      // Check morph display
      const morphDisplay = container.querySelector('.morph-display');
      expect(morphDisplay).toBeInTheDocument();
    });

    test('ensures status bar visual consistency', () => {
      render(<Terminal />);

      // Check status bar content
      expect(screen.getByText('Terminal v2.1.3')).toBeInTheDocument();
      expect(screen.getAllByText('SHAPES')).toHaveLength(2); // Header and status bar
      expect(screen.getByText(/user@shapes:~\$/)).toBeInTheDocument();

      // Check cursor element
      const cursor = document.querySelector('.cursor');
      expect(cursor).toBeInTheDocument();
      expect(cursor).toHaveTextContent('|');
    });

    test('validates responsive design elements', () => {
      const { container } = render(<Terminal />);

      // Check that responsive classes are applied
      const fileSystem = container.querySelector('.file-system');
      expect(fileSystem).toHaveClass('file-system--dark');

      const fileItems = container.querySelectorAll('.file-item');
      fileItems.forEach(item => {
        expect(item).toHaveClass('file-item--dark');
      });
    });

    test('checks accessibility attributes consistency', () => {
      render(<Terminal />);

      // Click a file to open modal
      const homeFile = screen.getByText('HOME.txt');
      homeFile.click();

      waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toHaveAttribute('aria-modal', 'true');
        expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');

        const closeButton = screen.getByLabelText('Close modal');
        expect(closeButton).toHaveAttribute('type', 'button');
      });
    });

    test('validates CSS animation classes', () => {
      const { container } = render(<Terminal />);

      // Check animation classes are applied
      const logo = container.querySelector('.logo');
      expect(logo).toHaveClass('animate-glow');

      const subtitle = container.querySelector('.subtitle');
      expect(subtitle).toHaveClass('animate-typewriter');

      // Check progress bar animations
      const progressFills = container.querySelectorAll('.progress-fill');
      progressFills.forEach(fill => {
        const width = fill.style.width;
        if (parseInt(width) > 0) {
          expect(fill).toHaveClass('animate-shine');
        }
      });
    });

    test('ensures color scheme consistency', () => {
      const { container } = render(<Terminal />);

      // Check dark theme classes
      expect(container.querySelector('.file-system')).toHaveClass('file-system--dark');
      expect(container.querySelector('.file-header')).toHaveClass('file-system__header--dark');

      const fileItems = container.querySelectorAll('.file-item');
      fileItems.forEach(item => {
        expect(item).toHaveClass('file-item--dark');
      });

      const progressBars = container.querySelectorAll('.progress-bar');
      progressBars.forEach(bar => {
        expect(bar).toHaveClass('progress-bar--dark');
      });
    });
  });

  describe('Cross-browser Compatibility Tests', () => {
    test('handles missing performance API gracefully', () => {
      // Temporarily remove performance API
      const originalPerformance = global.performance;
      delete global.performance;

      expect(() => {
        render(<Terminal />);
      }).not.toThrow();

      // Restore performance API
      global.performance = originalPerformance;
    });

    test('handles missing requestAnimationFrame gracefully', () => {
      // Temporarily remove RAF
      const originalRAF = global.requestAnimationFrame;
      delete global.requestAnimationFrame;

      expect(() => {
        render(<Terminal />);
      }).not.toThrow();

      // Restore RAF
      global.requestAnimationFrame = originalRAF;
    });

    test('validates CSS feature detection', () => {
      const { container } = render(<Terminal />);

      // Check that CSS transforms are used (modern browser feature)
      const morphDisplay = container.querySelector('.morph-display');
      expect(morphDisplay).toHaveStyle('transform: scale(1)');

      // Check CSS custom properties usage (should be in stylesheets)
      const orbits = container.querySelectorAll('[class*="orbit"]');
      orbits.forEach(orbit => {
        expect(orbit.style.borderRadius).toBe('50%');
      });
    });
  });

  describe('Performance Monitoring Integration', () => {
    test('integrates with performance monitor', () => {
      const monitor = performanceMonitor;
      
      render(<Terminal />);

      // Should have performance metrics available
      const metrics = monitor.getMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics.loadTime).toBe('number');
      expect(typeof metrics.animationFPS).toBe('number');
    });

    test('tracks custom performance metrics', async () => {
      const monitor = performanceMonitor;
      
      const result = await monitor.measureRenderTime('terminal-render', async () => {
        render(<Terminal />);
        return 'rendered';
      });

      expect(result).toBe('rendered');
      
      const metrics = monitor.getMetrics();
      expect(metrics.customMetrics.has('terminal-render')).toBe(true);
      
      const renderMetrics = metrics.customMetrics.get('terminal-render');
      expect(renderMetrics.renderTime).toBeGreaterThan(0);
    });

    test('monitors network request performance', () => {
      const monitor = performanceMonitor;
      
      // Simulate network request tracking
      monitor.trackNetworkRequest('/api/files', 'GET', 150, 2048);
      
      const metrics = monitor.getMetrics();
      expect(metrics.networkRequests).toHaveLength(1);
      
      const request = metrics.networkRequests[0];
      expect(request.url).toBe('/api/files');
      expect(request.method).toBe('GET');
      expect(request.duration).toBe(150);
      expect(request.size).toBe(2048);
    });
  });
});