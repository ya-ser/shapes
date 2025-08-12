# SHAPES - Interactive Terminal Experience

SHAPES is a performance-optimized React application that provides an interactive terminal-style interface showcasing a design lab's portfolio. The application features morphing ASCII art, file system navigation, and advanced visual effects, all built with modern React patterns and optimized for performance.

**Live Site:** [https://shapesof.art](https://shapesof.art)

## 🚀 Performance Improvements

This application has been extensively refactored for optimal performance:

- **30%+ faster initial load times** through code splitting and bundle optimization
- **Smooth 60fps animations** using CSS transforms and requestAnimationFrame
- **Reduced bundle size** via tree shaking and unused code elimination
- **Optimized rendering** with React.memo and efficient state management
- **Edge-optimized deployment** on Cloudflare Workers

## 📁 Project Structure

```
src/
├── App.js                          # Main application entry point
├── components/
│   ├── Terminal.js                 # Consolidated terminal interface
│   └── __tests__/
│       └── Terminal.test.js        # Component tests
├── data/
│   └── fileContent.js              # Centralized content management
├── hooks/
│   ├── useAnimations.js            # Custom animation hooks
│   └── __tests__/
│       └── useAnimations.test.js   # Hook tests
├── styles/
│   ├── globals.css                 # Global styles and CSS variables
│   ├── animations.css              # Optimized keyframe animations
│   └── components.css              # Component-specific styles
├── utils/
│   ├── performance.js              # Performance utilities
│   ├── loadable.js                 # Code splitting utilities
│   ├── performanceBenchmark.js     # Benchmarking tools
│   └── __tests__/
│       └── performance.test.js     # Utility tests
├── __tests__/                      # Integration tests
│   ├── performance.benchmark.test.js
│   ├── performance.regression.test.js
│   └── crossBrowser.compatibility.test.js
└── worker.js                       # Service worker for caching
```

## 🛠 Available Scripts

### Development

```bash
npm start                    # Start development server (localhost:3000)
npm test                     # Run test suite in watch mode
npm run build               # Create production build
npm run build:analyze       # Build with bundle analyzer
```

### Deployment

```bash
npm run deploy              # Deploy to GitHub Pages
npm run deploy:cf           # Deploy to Cloudflare Workers (staging)
npm run deploy:cf:prod      # Deploy to Cloudflare Workers (production)
```

### Docker

```bash
npm run docker:dev          # Run development environment in Docker
npm run docker:prod         # Run production environment in Docker
npm run docker:build        # Build Docker image
npm run docker:run          # Run Docker container
```

## 🏗 Architecture Overview

### Consolidated Component Design

The application uses a consolidated architecture where related functionality is grouped together:

- **Terminal Component**: Main interface containing file system, modal, and status bar functionality
- **Centralized Data**: All content managed through `src/data/fileContent.js`
- **Custom Hooks**: Performance-optimized animation and state management
- **Modular Styles**: Organized CSS architecture with custom properties

### Performance Optimizations

1. **Bundle Optimization**
   - Code splitting for non-critical components
   - Tree shaking for unused CSS and JavaScript
   - Asset optimization and compression
   - Lazy loading for modal content

2. **Runtime Performance**
   - React.memo for preventing unnecessary re-renders
   - useCallback and useMemo for expensive operations
   - RequestAnimationFrame for smooth animations
   - Debounced interaction handlers

3. **CSS Performance**
   - CSS containment for animation isolation
   - Transform and opacity-based animations
   - Efficient selector specificity
   - Reduced paint and layout thrashing

## 🧪 Testing Strategy

The application includes comprehensive testing:

- **Unit Tests**: Component rendering and hook functionality
- **Integration Tests**: User interactions and state management
- **Performance Tests**: Bundle size regression and animation benchmarks
- **Visual Regression Tests**: UI consistency across browsers

Run tests with:
```bash
npm test                     # Interactive test runner
npm test -- --coverage      # Run with coverage report
npm test -- --watchAll=false # Run once without watch mode
```

## 🎨 Styling Architecture

### CSS Custom Properties

The application uses CSS custom properties for consistent theming:

```css
:root {
  --primary-color: #ff6b35;
  --secondary-color: #ffb347;
  --background-dark: #2a1810;
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --shadow-glow: 0 0 20px rgba(255, 107, 53, 0.3);
}
```

### Animation Performance

All animations are optimized for performance:
- Use `transform` and `opacity` properties
- Leverage CSS containment
- Implement proper cleanup in React hooks
- Use `will-change` property judiciously

## 📊 Performance Monitoring

The application includes built-in performance monitoring:

- Bundle size tracking and alerts
- Animation frame rate monitoring
- Load time measurement
- Memory usage tracking

Access performance metrics through the browser's DevTools or the built-in performance utilities.

## 🔧 Development Guide

### Adding New Content

1. **File Content**: Add new files to `src/data/fileContent.js`
2. **Animations**: Define new sequences in the morphSequences object
3. **Styles**: Add component styles to `src/styles/components.css`

### Performance Best Practices

1. **Components**
   - Use React.memo for components that receive stable props
   - Implement useCallback for event handlers
   - Use useMemo for expensive calculations

2. **Animations**
   - Prefer CSS animations over JavaScript
   - Use transform and opacity for smooth animations
   - Implement proper cleanup in useEffect

3. **Bundle Size**
   - Regularly check bundle size with `npm run build:analyze`
   - Use dynamic imports for large dependencies
   - Remove unused dependencies and code

### Code Style

The project uses:
- ESLint for code quality
- Consistent naming conventions
- Modern React patterns (hooks, functional components)
- TypeScript-style JSDoc comments

## 🚀 Deployment

### Cloudflare Workers

The application is optimized for Cloudflare Workers deployment:

1. **Configuration**: See `wrangler.jsonc` for deployment settings
2. **Edge Optimization**: Assets are optimized for edge delivery
3. **Caching Strategy**: Implements efficient caching headers

### Docker

Multi-stage Docker builds are available for both development and production:

- **Development**: Hot reloading with volume mounts
- **Production**: Optimized nginx-based serving

## 🐛 Troubleshooting

### Common Issues

1. **Slow Animations**: Check if hardware acceleration is enabled
2. **Large Bundle Size**: Run `npm run build:analyze` to identify large dependencies
3. **Memory Leaks**: Ensure proper cleanup in useEffect hooks
4. **CSS Issues**: Verify CSS custom properties are supported

### Performance Debugging

1. Use React DevTools Profiler to identify rendering issues
2. Check Network tab for asset loading performance
3. Use Performance tab to analyze animation frame rates
4. Monitor memory usage in DevTools Memory tab

## 📝 Contributing

When contributing to this project:

1. Follow the established architecture patterns
2. Write tests for new functionality
3. Ensure performance optimizations are maintained
4. Update documentation for significant changes

## 📄 License

This project is private and proprietary to the SHAPES design lab.
