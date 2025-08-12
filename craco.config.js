const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Production optimizations
      if (env === 'production') {
        // Code splitting optimization
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
              },
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 5,
                reuseExistingChunk: true,
              },
              animations: {
                test: /[\\/]src[\\/]styles[\\/]animations\.css$/,
                name: 'animations',
                chunks: 'all',
                priority: 15,
              },
            },
          },
          // Tree shaking optimization
          usedExports: true,
          sideEffects: false,
        };

        // Asset optimization and compression
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8,
          })
        );

        // Bundle analyzer (only when ANALYZE=true)
        if (process.env.ANALYZE === 'true') {
          webpackConfig.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
              reportFilename: 'bundle-report.html',
            })
          );
        }

        // Optimize CSS
        webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.map(plugin => {
          if (plugin.constructor.name === 'CssMinimizerPlugin') {
            plugin.options.minimizerOptions = {
              ...plugin.options.minimizerOptions,
              preset: [
                'default',
                {
                  discardComments: { removeAll: true },
                  normalizeWhitespace: true,
                  colormin: true,
                  convertValues: true,
                  discardDuplicates: true,
                  discardEmpty: true,
                  discardOverridden: true,
                  discardUnused: true,
                  mergeIdents: true,
                  mergeLonghand: true,
                  mergeRules: true,
                  minifyFontValues: true,
                  minifyGradients: true,
                  minifyParams: true,
                  minifySelectors: true,
                  normalizeCharset: true,
                  normalizeDisplayValues: true,
                  normalizePositions: true,
                  normalizeRepeatStyle: true,
                  normalizeString: true,
                  normalizeTimingFunctions: true,
                  normalizeUnicode: true,
                  normalizeUrl: true,
                  orderedValues: true,
                  reduceIdents: true,
                  reduceInitial: true,
                  reduceTransforms: true,
                  svgo: true,
                  uniqueSelectors: true,
                },
              ],
            };
          }
          return plugin;
        });

        // Asset optimization
        webpackConfig.module.rules.push({
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            },
          },
          generator: {
            filename: 'static/media/[name].[hash:8][ext]',
          },
        });
      }

      // Development optimizations
      if (env === 'development') {
        // Faster source maps for development
        webpackConfig.devtool = 'eval-cheap-module-source-map';
      }

      return webpackConfig;
    },
  },
  // Babel optimizations
  babel: {
    plugins: [
      // Remove console.log in production
      ...(process.env.NODE_ENV === 'production' 
        ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] 
        : []),
    ],
  },
};