import { renderHook, act } from '@testing-library/react';
import { useAnimations, useCSSAnimation, useHoverAnimation } from '../useAnimations';
import * as fileContentModule from '../../data/fileContent';

// Mock the file content module
jest.mock('../../data/fileContent', () => ({
  getMorphSequence: jest.fn(),
  getSequenceNames: jest.fn()
}));

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  const id = setTimeout(cb, 16);
  return id;
});
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

describe('useAnimations Hook', () => {
  const mockSequenceData = [
    'Frame 1 ASCII Art',
    'Frame 2 ASCII Art',
    'Frame 3 ASCII Art'
  ];

  const mockSequenceNames = ['identity', 'loading', 'concepts'];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    fileContentModule.getMorphSequence.mockReturnValue(mockSequenceData);
    fileContentModule.getSequenceNames.mockReturnValue(mockSequenceNames);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    test('initializes with correct default values', () => {
      const { result } = renderHook(() => useAnimations());

      expect(result.current.isAnimating).toBe(false);
      expect(result.current.currentSequence).toBe('identity');
      expect(result.current.currentFrame).toBe(0);
      expect(result.current.animationSpeed).toBe(1000);
      expect(result.current.availableSequences).toEqual(mockSequenceNames);
    });

    test('initializes performance metrics', () => {
      const { result } = renderHook(() => useAnimations());

      expect(result.current.performanceMetrics).toEqual({
        fps: 0,
        frameTime: 0,
        droppedFrames: 0,
        totalFrames: 0
      });
    });
  });

  describe('Animation Control', () => {
    test('startMorphing starts animation with valid sequence', () => {
      const { result } = renderHook(() => useAnimations());

      act(() => {
        result.current.startMorphing('loading', 500);
      });

      expect(fileContentModule.getMorphSequence).toHaveBeenCalledWith('loading');
      expect(result.current.isAnimating).toBe(true);
      expect(result.current.currentSequence).toBe('loading');
      expect(result.current.animationSpeed).toBe(500);
      expect(result.current.currentFrame).toBe(0);
    });

    test('startMorphing falls back to identity for invalid sequence', () => {
      const { result } = renderHook(() => useAnimations());

      act(() => {
        result.current.startMorphing('invalid-sequence');
      });

      expect(fileContentModule.getMorphSequence).toHaveBeenCalledWith('identity');
      expect(result.current.currentSequence).toBe('identity');
    });

    test('startMorphing handles empty sequence data', () => {
      fileContentModule.getMorphSequence.mockReturnValue([]);
      const { result } = renderHook(() => useAnimations());

      act(() => {
        result.current.startMorphing('identity');
      });

      expect(result.current.isAnimating).toBe(false);
    });

    test('stopMorphing stops animation and cleans up', () => {
      const { result } = renderHook(() => useAnimations());

      // Start animation first
      act(() => {
        result.current.startMorphing('identity');
      });

      expect(result.current.isAnimating).toBe(true);

      // Stop animation
      act(() => {
        result.current.stopMorphing();
      });

      expect(result.current.isAnimating).toBe(false);
    });

    test('toggleAnimation switches between play and pause', () => {
      const { result } = renderHook(() => useAnimations());

      // Initially not animating
      expect(result.current.isAnimating).toBe(false);

      // Start animation first to have sequence data
      act(() => {
        result.current.startMorphing('identity');
      });

      expect(result.current.isAnimating).toBe(true);

      // Toggle should stop
      act(() => {
        result.current.toggleAnimation();
      });

      expect(result.current.isAnimating).toBe(false);

      // Toggle should start again
      act(() => {
        result.current.toggleAnimation();
      });

      expect(result.current.isAnimating).toBe(true);
    });

    test('changeSpeed updates animation speed', () => {
      const { result } = renderHook(() => useAnimations());

      act(() => {
        result.current.changeSpeed(2000);
      });

      expect(result.current.animationSpeed).toBe(2000);
    });

    test('changeSpeed ignores invalid speeds', () => {
      const { result } = renderHook(() => useAnimations());

      const originalSpeed = result.current.animationSpeed;

      act(() => {
        result.current.changeSpeed(-100);
      });

      expect(result.current.animationSpeed).toBe(originalSpeed);

      act(() => {
        result.current.changeSpeed(0);
      });

      expect(result.current.animationSpeed).toBe(originalSpeed);
    });

    test('jumpToFrame sets specific frame', () => {
      const { result } = renderHook(() => useAnimations());

      // Start animation to load sequence data
      act(() => {
        result.current.startMorphing('identity');
      });

      act(() => {
        result.current.jumpToFrame(2);
      });

      expect(result.current.currentFrame).toBe(2);
    });

    test('jumpToFrame ignores invalid frame indices', () => {
      const { result } = renderHook(() => useAnimations());

      // Start animation to load sequence data
      act(() => {
        result.current.startMorphing('identity');
      });

      const originalFrame = result.current.currentFrame;

      // Test negative index
      act(() => {
        result.current.jumpToFrame(-1);
      });

      expect(result.current.currentFrame).toBe(originalFrame);

      // Test index beyond sequence length
      act(() => {
        result.current.jumpToFrame(100);
      });

      expect(result.current.currentFrame).toBe(originalFrame);
    });
  });

  describe('Frame Content', () => {
    test('getCurrentFrameContent returns correct frame content', () => {
      const { result } = renderHook(() => useAnimations());

      // Start animation to load sequence data
      act(() => {
        result.current.startMorphing('identity');
      });

      expect(result.current.getCurrentFrameContent()).toBe('Frame 1 ASCII Art');

      // Jump to different frame
      act(() => {
        result.current.jumpToFrame(1);
      });

      expect(result.current.getCurrentFrameContent()).toBe('Frame 2 ASCII Art');
    });

    test('getCurrentFrameContent returns empty string for invalid state', () => {
      const { result } = renderHook(() => useAnimations());

      // Without starting animation, should return empty string
      expect(result.current.getCurrentFrameContent()).toBe('');
    });
  });

  describe('Animation Loop', () => {
    test('animation loop starts when morphing begins', async () => {
      const { result } = renderHook(() => useAnimations());

      act(() => {
        result.current.startMorphing('identity', 100);
      });

      expect(result.current.isAnimating).toBe(true);
      expect(result.current.currentFrame).toBe(0);
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    test('animation loop can be controlled', async () => {
      const { result } = renderHook(() => useAnimations());

      act(() => {
        result.current.startMorphing('identity', 100);
      });

      expect(result.current.isAnimating).toBe(true);

      act(() => {
        result.current.stopMorphing();
      });

      expect(result.current.isAnimating).toBe(false);
    });
  });

  describe('Performance Monitoring', () => {
    test('initializes performance metrics', () => {
      const { result } = renderHook(() => useAnimations());

      expect(result.current.performanceMetrics).toEqual({
        fps: 0,
        frameTime: 0,
        droppedFrames: 0,
        totalFrames: 0
      });
    });

    test('tracks performance metrics during animation', () => {
      const { result } = renderHook(() => useAnimations());

      act(() => {
        result.current.startMorphing('identity', 100);
      });

      // Performance metrics should be available
      expect(result.current.performanceMetrics).toBeDefined();
      expect(typeof result.current.performanceMetrics.fps).toBe('number');
      expect(typeof result.current.performanceMetrics.frameTime).toBe('number');
      expect(typeof result.current.performanceMetrics.droppedFrames).toBe('number');
      expect(typeof result.current.performanceMetrics.totalFrames).toBe('number');
    });
  });

  describe('Cleanup', () => {
    test('cleans up animation on unmount', () => {
      const { result, unmount } = renderHook(() => useAnimations());

      act(() => {
        result.current.startMorphing('identity');
      });

      expect(result.current.isAnimating).toBe(true);

      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });

    test('cleans up timers and refs on unmount', () => {
      const { result, unmount } = renderHook(() => useAnimations());

      act(() => {
        result.current.startMorphing('identity');
      });

      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });
  });
});

describe('useCSSAnimation Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('initializes with correct default values', () => {
    const { result } = renderHook(() => useCSSAnimation('fade-in', 300));

    expect(result.current.isAnimating).toBe(false);
    expect(result.current.animationClass).toBe('');
  });

  test('starts animation and sets class name', () => {
    const { result } = renderHook(() => useCSSAnimation('fade-in', 300));

    act(() => {
      result.current.startAnimation();
    });

    expect(result.current.isAnimating).toBe(true);
    expect(result.current.animationClass).toBe('fade-in');
  });

  test('stops animation after duration', () => {
    const { result } = renderHook(() => useCSSAnimation('fade-in', 300));

    act(() => {
      result.current.startAnimation();
    });

    expect(result.current.isAnimating).toBe(true);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.isAnimating).toBe(false);
    expect(result.current.animationClass).toBe('');
  });

  test('can be stopped manually', () => {
    const { result } = renderHook(() => useCSSAnimation('fade-in', 300));

    act(() => {
      result.current.startAnimation();
    });

    expect(result.current.isAnimating).toBe(true);

    act(() => {
      result.current.stopAnimation();
    });

    expect(result.current.isAnimating).toBe(false);
    expect(result.current.animationClass).toBe('');
  });

  test('cleans up timeout on unmount', () => {
    const { result, unmount } = renderHook(() => useCSSAnimation('fade-in', 300));

    act(() => {
      result.current.startAnimation();
    });

    expect(() => unmount()).not.toThrow();
  });
});

describe('useHoverAnimation Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('initializes with correct default values', () => {
    const { result } = renderHook(() => useHoverAnimation(100));

    expect(result.current.isHovered).toBe(false);
  });

  test('sets hovered state on mouse enter', () => {
    const { result } = renderHook(() => useHoverAnimation(100));

    act(() => {
      result.current.handleMouseEnter();
    });

    expect(result.current.isHovered).toBe(true);
  });

  test('sets hovered state to false after delay on mouse leave', () => {
    const { result } = renderHook(() => useHoverAnimation(100));

    act(() => {
      result.current.handleMouseEnter();
    });

    expect(result.current.isHovered).toBe(true);

    act(() => {
      result.current.handleMouseLeave();
    });

    // Should still be hovered immediately
    expect(result.current.isHovered).toBe(true);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should be unhovered after delay
    expect(result.current.isHovered).toBe(false);
  });

  test('cancels leave timeout on re-enter', () => {
    const { result } = renderHook(() => useHoverAnimation(100));

    act(() => {
      result.current.handleMouseEnter();
    });

    act(() => {
      result.current.handleMouseLeave();
    });

    // Re-enter before timeout
    act(() => {
      result.current.handleMouseEnter();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should still be hovered
    expect(result.current.isHovered).toBe(true);
  });

  test('cleans up timeout on unmount', () => {
    const { result, unmount } = renderHook(() => useHoverAnimation(100));

    act(() => {
      result.current.handleMouseEnter();
      result.current.handleMouseLeave();
    });

    expect(() => unmount()).not.toThrow();
  });
});