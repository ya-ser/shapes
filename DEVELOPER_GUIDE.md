# SHAPES Developer Guide

This guide provides detailed information for developers maintaining and extending the SHAPES React application after the performance refactoring.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [Data Management](#data-management)
4. [Performance Patterns](#performance-patterns)
5. [Styling Guidelines](#styling-guidelines)
6. [Testing Approach](#testing-approach)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

## Architecture Overview

### Design Principles

The refactored SHAPES application follows these key principles:

1. **Consolidation**: Related functionality is grouped together to reduce file count
2. **Performance First**: All patterns prioritize runtime and bundle performance
3. **Maintainability**: Clear separation of concerns with centralized data management
4. **Modern React**: Uses hooks, functional components, and current best practices

### Key Architectural Decisions

- **Single Terminal Component**: All UI functionality consolidated into one main component
- **Centralized Data**: File content and animations managed in dedicated data files
- **Custom Hooks**: Animation and performance logic extracted into reusable hooks
- **CSS Architecture**: Modular styles with custom properties for consistency

## Component Structure

### Terminal Component (`src/components/Terminal.js`)

The Terminal component is the heart of the application, containing:

```javascript
const Terminal = () => {
  // State management for all UI interactions
  const [modalState, setModalState] = useState({ isOpen: false, content: '', title: '' });
  const [morphingState, setMorphingState] = useState({ sequence: 'identity', frame: 0 });
  
  // Performance-optimized hooks
  const { startMorphing, stopMorphing, isAnimating } = useAnimations();
  
  // Internal components (consolidated from separate files)
  const FileSystemSection = React.memo(() => { /* ... */ });
  const StatusBarSection = React.memo(() => { /* ... */ });
  const ModalSection = React.memo(() => { /* ... */ });
  const MorphingDisplay = React.memo(() => { /* ... */ });
  
  return (
    <div className="terminal">
      <Header />
      <MorphingDisplay />
      <FileSystemSection />
      <StatusBarSection />
      <ModalSection />
    </div>
  );
};
```

#### Internal Component Guidelines

- Use `React.memo()` for all internal components to prevent unnecessary re-renders
- Pass only necessary props to minimize dependency arrays
- Implement proper event handler memoization with `useCallback`

### Hook Architecture (`src/hooks/useAnimations.js`)

The custom animation hook manages all morphing and visual effects:

```javascript
export const useAnimations = () => {
  const [currentSequence, setCurrentSequence] = useState('identity');
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef();
  
  const startMorphing = useCallback((sequence = 'identity', speed = 150) => {
    // RequestAnimationFrame-based animation logic
    // Includes performance monitoring and cleanup
  }, []);
  
  // Always include cleanup functions
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return { startMorphing, stopMorphing, currentSequence, currentFrame, isAnimating };
};
```

## Data Management

### File Content Structure (`src/data/fileContent.js`)

All application content is centralized in this file:

```javascript
export const fileData = {
  [fileKey]: {
    name: 'Display name with permissions',
    status: 'Loading status with progress bar',
    progress: 0-100,
    content: 'Full file content with ASCII art',
    encrypted: boolean,
    key: 'unique identifier'
  }
};

export const morphSequences = {
  [sequenceName]: [
    'ASCII art frame 1',
    'ASCII art frame 2',
    // ... more frames
  ]
};
```

#### Adding New Content

1. **New Files**: Add entries to `fileData` object with all required properties
2. **New Animations**: Add frame arrays to `morphSequences` object
3. **Content Updates**: Modify existing entries while maintaining the structure

### Performance Utilities (`src/utils/performance.js`)

Utility functions for performance optimization:

```javascript
// Debounce for user interactions
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name}: ${end - start}ms`);
  return result;
};
```

## Performance Patterns

### React Optimization Patterns

1. **Memoization**
   ```javascript
   // Memoize expensive calculations
   const expensiveValue = useMemo(() => {
     return heavyCalculation(data);
   }, [data]);
   
   // Memoize event handlers
   const handleClick = useCallback((id) => {
     setSelectedFile(id);
   }, []);
   ```

2. **Component Memoization**
   ```javascript
   const FileItem = React.memo(({ file, onSelect }) => {
     return (
       <div onClick={() => onSelect(file.key)}>
         {file.name}
       </div>
     );
   });
   ```

3. **State Structure**
   ```javascript
   // Good: Flat state structure
   const [modalState, setModalState] = useState({
     isOpen: false,
     content: '',
     title: ''
   });
   
   // Avoid: Nested state that causes unnecessary re-renders
   ```

### Animation Performance

1. **CSS-First Approach**
   - Use CSS animations for simple transitions
   - Reserve JavaScript animations for complex interactions
   - Always use `transform` and `opacity` for smooth animations

2. **RequestAnimationFrame Pattern**
   ```javascript
   const animateFrame = useCallback(() => {
     setCurrentFrame(prev => {
       const nextFrame = (prev + 1) % totalFrames;
       if (nextFrame !== 0) {
         animationRef.current = requestAnimationFrame(animateFrame);
       }
       return nextFrame;
     });
   }, [totalFrames]);
   ```

## Styling Guidelines

### CSS Architecture

The application uses a three-tier CSS architecture:

1. **Global Styles** (`src/styles/globals.css`)
   - CSS custom properties
   - Base element styles
   - Utility classes

2. **Animation Styles** (`src/styles/animations.css`)
   - Keyframe definitions
   - Animation utilities
   - Performance-optimized transitions

3. **Component Styles** (`src/styles/components.css`)
   - Component-specific styles
   - Layout and positioning
   - Interactive states

### CSS Custom Properties

Use custom properties for consistency and maintainability:

```css
:root {
  /* Colors */
  --primary-color: #ff6b35;
  --secondary-color: #ffb347;
  --background-dark: #2a1810;
  
  /* Transitions */
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.15s ease-out;
  
  /* Shadows */
  --shadow-glow: 0 0 20px rgba(255, 107, 53, 0.3);
  --shadow-subtle: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### Animation Best Practices

1. **Performance-First Animations**
   ```css
   .morphing-container {
     /* Use transform instead of changing layout properties */
     transform: translateX(0);
     transition: transform var(--transition-smooth);
     
     /* Use containment for animation isolation */
     contain: layout style paint;
   }
   
   .morphing-container.active {
     transform: translateX(100px);
   }
   ```

2. **Efficient Keyframes**
   ```css
   @keyframes glow-pulse {
     0%, 100% { 
       opacity: 0.8;
       transform: scale(1);
     }
     50% { 
       opacity: 1;
       transform: scale(1.05);
     }
   }
   ```

## Testing Approach

### Test Structure

The application includes comprehensive testing at multiple levels:

1. **Unit Tests**: Individual functions and hooks
2. **Component Tests**: React component rendering and interactions
3. **Integration Tests**: Full user workflows
4. **Performance Tests**: Bundle size and runtime performance

### Testing Patterns

1. **Component Testing**
   ```javascript
   import { render, screen, fireEvent } from '@testing-library/react';
   import Terminal from '../Terminal';
   
   test('opens modal when file is clicked', () => {
     render(<Terminal />);
     const fileItem = screen.getByText(/HOME.txt/);
     fireEvent.click(fileItem);
     expect(screen.getByRole('dialog')).toBeInTheDocument();
   });
   ```

2. **Hook Testing**
   ```javascript
   import { renderHook, act } from '@testing-library/react';
   import { useAnimations } from '../useAnimations';
   
   test('starts morphing animation', () => {
     const { result } = renderHook(() => useAnimations());
     
     act(() => {
       result.current.startMorphing('concepts');
     });
     
     expect(result.current.isAnimating).toBe(true);
   });
   ```

3. **Performance Testing**
   ```javascript
   test('bundle size stays under limit', () => {
     const bundleSize = getBundleSize();
     expect(bundleSize).toBeLessThan(500 * 1024); // 500KB limit
   });
   ```

## Common Tasks

### Adding a New File

1. Add file data to `src/data/fileContent.js`:
   ```javascript
   export const fileData = {
     // ... existing files
     newFile: {
       name: 'drwxr-xr-x  NEW_FILE.txt',
       status: '[████████░░] 80% loaded',
       progress: 80,
       content: `Your ASCII art content here`,
       encrypted: false,
       key: 'newFile'
     }
   };
   ```

2. The file will automatically appear in the Terminal component

### Adding a New Animation Sequence

1. Add sequence to `src/data/fileContent.js`:
   ```javascript
   export const morphSequences = {
     // ... existing sequences
     newSequence: [
       'Frame 1 ASCII art',
       'Frame 2 ASCII art',
       'Frame 3 ASCII art'
     ]
   };
   ```

2. Trigger the sequence in the Terminal component:
   ```javascript
   const handleSpecialAction = useCallback(() => {
     startMorphing('newSequence', 200); // 200ms per frame
   }, [startMorphing]);
   ```

### Modifying Styles

1. **Global Changes**: Edit `src/styles/globals.css`
2. **Animation Changes**: Edit `src/styles/animations.css`
3. **Component Changes**: Edit `src/styles/components.css`

Always use CSS custom properties for values that might be reused.

### Performance Optimization

1. **Identify Issues**: Use `npm run build:analyze` to check bundle size
2. **Profile Components**: Use React DevTools Profiler
3. **Monitor Animations**: Check frame rates in DevTools Performance tab
4. **Test Changes**: Run performance tests with `npm test`

## Troubleshooting

### Common Issues

1. **Animations Not Smooth**
   - Check if hardware acceleration is enabled
   - Verify animations use `transform` and `opacity`
   - Ensure proper cleanup in useEffect hooks

2. **Large Bundle Size**
   - Run bundle analyzer: `npm run build:analyze`
   - Check for duplicate dependencies
   - Verify tree shaking is working

3. **Memory Leaks**
   - Ensure all event listeners are cleaned up
   - Cancel animation frames in useEffect cleanup
   - Check for circular references in state

4. **CSS Issues**
   - Verify CSS custom properties are supported
   - Check for specificity conflicts
   - Ensure proper CSS containment

### Debugging Tools

1. **React DevTools**: Component profiling and state inspection
2. **Chrome DevTools**: Performance monitoring and memory analysis
3. **Bundle Analyzer**: Webpack bundle analysis
4. **Lighthouse**: Performance auditing

### Performance Monitoring

The application includes built-in performance monitoring:

```javascript
// Monitor component render times
const ComponentWithMonitoring = () => {
  useEffect(() => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`Component render time: ${end - start}ms`);
    };
  });
};

// Monitor animation frame rates
const monitorAnimationPerformance = () => {
  let frameCount = 0;
  let lastTime = performance.now();
  
  const countFrames = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      console.log(`FPS: ${frameCount}`);
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(countFrames);
  };
  
  requestAnimationFrame(countFrames);
};
```

## Best Practices Summary

1. **Always prioritize performance** in implementation decisions
2. **Use React.memo** for components that receive stable props
3. **Implement proper cleanup** in all useEffect hooks
4. **Prefer CSS animations** over JavaScript when possible
5. **Monitor bundle size** regularly with the analyzer
6. **Write tests** for all new functionality
7. **Use CSS custom properties** for maintainable styles
8. **Profile performance** before and after changes

This guide should be updated as the application evolves and new patterns emerge.