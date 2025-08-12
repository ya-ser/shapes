import { lazy, Suspense } from 'react';

/**
 * Higher-order component for lazy loading components with error boundaries
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} options - Configuration options
 * @returns {React.Component} Lazy-loaded component with suspense
 */
export const createLoadableComponent = (importFunc, options = {}) => {
  const {
    fallback = <div>Loading...</div>,
    errorFallback = <div>Error loading component</div>,
  } = options;

  const LazyComponent = lazy(importFunc);

  return function LoadableComponent(props) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

/**
 * Preload a component for better performance
 * @param {Function} importFunc - Dynamic import function
 */
export const preloadComponent = (importFunc) => {
  const componentImport = importFunc();
  return componentImport;
};

/**
 * Create a lazy-loaded route component
 * @param {Function} importFunc - Dynamic import function
 * @returns {React.Component} Lazy route component
 */
export const createLazyRoute = (importFunc) => {
  return createLoadableComponent(importFunc, {
    fallback: <div className="loading-spinner">Loading page...</div>,
  });
};