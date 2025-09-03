# Monitoring and Observability

## Monitoring Stack
- **Performance:** Vercel Analytics (Web Vitals)
- **Error Tracking:** Sentry (optional)
- **Logging:** Vercel Functions Logs
- **Custom Metrics:** 
  - TPN calculation performance
  - Code execution timeouts
  - Test generation success rate
  - API response times

## Key Metrics to Track
```typescript
// Track custom events
export function trackEvent(event: string, properties?: any) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, properties);
  }
}

// Usage
trackEvent('tpn_calculation', {
  advisor_type: 'ADULT',
  execution_time: 125,
  warnings_count: 2
});

trackEvent('code_execution', {
  section_type: 'dynamic',
  success: true,
  execution_time: 87
});
```
