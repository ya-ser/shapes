import { useState, useRef, useCallback, useEffect } from 'react';
import { getMorphSequence, getSequenceNames } from '../data/fileContent.js';

/**
 * Custom hook for managing animations with performance optimization
 * Provides morphing sequence management with requestAnimationFrame
 * and performance monitoring capabilities
 */
export const useAnimations = () => {
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSequence, setCurrentSequence] = useState('identity');
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1000); // ms between frames
  
  // Performance monitoring state
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 0,
    frameTime: 0,
    droppedFrames: 0,
    totalFrames: 0
  });
  
  // Refs for animation management
  const animationRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const droppedFramesRef = useRef(0);
  const sequenceDataRef = useRef([]);
  const startTimeRef = useRef(0);
  
  // Performance monitoring refs
  const performanceStartRef = useRef(0);
  const frameTimesRef = useRef([]);
  
  /**
   * Calculate and update performance metrics
   */
  const updatePerformanceMetrics = useCallback((currentTime) => {
    const frameTime = currentTime - lastFrameTimeRef.current;
    frameTimesRef.current.push(frameTime);
    
    // Keep only last 60 frame times for rolling average
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }
    
    // Calculate average FPS from recent frame times
    const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
    
    // Detect dropped frames (frame time > 20ms indicates dropped frame at 60fps)
    if (frameTime > 20) {
      droppedFramesRef.current++;
    }
    
    setPerformanceMetrics({
      fps: Math.round(fps),
      frameTime: Math.round(avgFrameTime),
      droppedFrames: droppedFramesRef.current,
      totalFrames: frameCountRef.current
    });
  }, []);
  
  /**
   * Animation loop using requestAnimationFrame
   */
  const animationLoop = useCallback((currentTime) => {
    // Initialize timing on first frame
    if (performanceStartRef.current === 0) {
      performanceStartRef.current = currentTime;
      lastFrameTimeRef.current = currentTime;
      startTimeRef.current = currentTime;
    }
    
    // Check if enough time has passed for next frame
    const elapsed = currentTime - startTimeRef.current;
    const shouldAdvanceFrame = elapsed >= animationSpeed;
    
    if (shouldAdvanceFrame) {
      // Update performance metrics
      updatePerformanceMetrics(currentTime);
      
      // Advance to next frame
      const sequence = sequenceDataRef.current;
      if (sequence && sequence.length > 0) {
        setCurrentFrame(prevFrame => {
          const nextFrame = (prevFrame + 1) % sequence.length;
          frameCountRef.current++;
          return nextFrame;
        });
      }
      
      // Reset start time for next frame
      startTimeRef.current = currentTime;
    }
    
    // Update last frame time for performance monitoring
    lastFrameTimeRef.current = currentTime;
    
    // Continue animation loop
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animationLoop);
    }
  }, [isAnimating, animationSpeed, updatePerformanceMetrics]);
  
  /**
   * Start morphing animation with specified sequence
   */
  const startMorphing = useCallback((sequenceName = 'identity', speed = 1000) => {
    // Validate sequence exists
    const availableSequences = getSequenceNames();
    if (!availableSequences.includes(sequenceName)) {
      console.warn(`Animation sequence "${sequenceName}" not found. Using "identity" instead.`);
      sequenceName = 'identity';
    }
    
    // Get sequence data
    const sequence = getMorphSequence(sequenceName);
    if (!sequence || sequence.length === 0) {
      console.error('Invalid or empty animation sequence');
      return;
    }
    
    // Update state and refs
    setCurrentSequence(sequenceName);
    setAnimationSpeed(speed);
    setCurrentFrame(0);
    sequenceDataRef.current = sequence;
    
    // Reset performance counters
    frameCountRef.current = 0;
    droppedFramesRef.current = 0;
    frameTimesRef.current = [];
    performanceStartRef.current = 0;
    
    // Start animation if not already running
    if (!isAnimating) {
      setIsAnimating(true);
    }
  }, [isAnimating]);
  
  /**
   * Stop morphing animation and cleanup
   */
  const stopMorphing = useCallback(() => {
    setIsAnimating(false);
    
    // Cancel animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Reset timing refs
    lastFrameTimeRef.current = 0;
    startTimeRef.current = 0;
    performanceStartRef.current = 0;
  }, []);
  
  /**
   * Pause/resume animation
   */
  const toggleAnimation = useCallback(() => {
    if (isAnimating) {
      stopMorphing();
    } else if (sequenceDataRef.current.length > 0) {
      setIsAnimating(true);
    }
  }, [isAnimating, stopMorphing]);
  
  /**
   * Change animation speed
   */
  const changeSpeed = useCallback((newSpeed) => {
    if (newSpeed > 0) {
      setAnimationSpeed(newSpeed);
    }
  }, []);
  
  /**
   * Jump to specific frame
   */
  const jumpToFrame = useCallback((frameIndex) => {
    const sequence = sequenceDataRef.current;
    if (sequence && frameIndex >= 0 && frameIndex < sequence.length) {
      setCurrentFrame(frameIndex);
    }
  }, []);
  
  /**
   * Get current frame content
   */
  const getCurrentFrameContent = useCallback(() => {
    const sequence = sequenceDataRef.current;
    if (sequence && sequence.length > 0 && currentFrame < sequence.length) {
      return sequence[currentFrame];
    }
    return '';
  }, [currentFrame]);
  
  // Effect to start/stop animation loop
  useEffect(() => {
    if (isAnimating && sequenceDataRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animationLoop);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animationLoop]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMorphing();
    };
  }, [stopMorphing]);
  
  return {
    // Animation state
    isAnimating,
    currentSequence,
    currentFrame,
    animationSpeed,
    
    // Animation controls
    startMorphing,
    stopMorphing,
    toggleAnimation,
    changeSpeed,
    jumpToFrame,
    
    // Content access
    getCurrentFrameContent,
    
    // Performance metrics
    performanceMetrics,
    
    // Available sequences
    availableSequences: getSequenceNames()
  };
};

/**
 * Hook for managing simple CSS animations with performance optimization
 */
export const useCSSAnimation = (animationName, duration = 300) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef(null);
  
  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set timeout to end animation
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }, [duration]);
  
  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    isAnimating,
    startAnimation,
    stopAnimation,
    animationClass: isAnimating ? animationName : ''
  };
};

/**
 * Hook for managing hover animations with debouncing
 */
export const useHoverAnimation = (delay = 100) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);
  
  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(true);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, delay);
  }, [delay]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    isHovered,
    handleMouseEnter,
    handleMouseLeave
  };
};