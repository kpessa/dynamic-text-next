# Performance Optimization

## Bundle Size Management (Target: <1MB)

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  webpack: (config) => {
    // Split bundles
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'mui',
          priority: 10,
        },
        firebase: {
          test: /[\\/]node_modules[\\/]firebase[\\/]/,
          name: 'firebase',
          priority: 10,
        },
        babel: {
          test: /[\\/]node_modules[\\/]@babel[\\/]/,
          name: 'babel',
          priority: 10,
        },
      },
    };
    return config;
  },
};
```

## Performance Targets (from Parent)
- **Initial Load:** <3s on 3G
- **Time to Interactive:** <5s
- **Bundle Size:** <1MB
- **Lighthouse Score:** >80
- **Core Web Vitals:**
  - LCP: <2.5s
  - FID: <100ms
  - CLS: <0.1

## Optimization Strategies
1. **Dynamic imports** for heavy components (CodeMirror, DiffViewer)
2. **Web Workers** for TPN calculations and code execution
3. **React.memo** and **useMemo** for expensive computations
4. **Virtual scrolling** for large lists
5. **Service Worker** for offline support and caching
