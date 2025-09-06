import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RealtimeMetrics } from './realtimeMetrics';

describe('RealtimeMetrics', () => {
  let metrics: RealtimeMetrics;

  beforeEach(() => {
    metrics = new RealtimeMetrics();
    metrics.clearMetrics();
  });

  describe('latency tracking', () => {
    it('should track operation latency', async () => {
      metrics.startLatencyTracking('op1', 'fetch-data');
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const duration = metrics.endLatencyTracking('op1', true);
      
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);
      
      const latencyMetrics = metrics.getMetricsByType('latency');
      expect(latencyMetrics).toHaveLength(1);
      expect(latencyMetrics[0].metadata?.operation).toBe('fetch-data');
    });

    it('should handle missing tracker gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const duration = metrics.endLatencyTracking('non-existent');
      
      expect(duration).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No latency tracker found')
      );
      
      consoleSpy.mockRestore();
    });

    it('should warn when latency exceeds target', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      metrics.startLatencyTracking('slow-op', 'slow-operation');
      
      // Simulate slow operation
      await new Promise(resolve => setTimeout(resolve, 150));
      
      metrics.endLatencyTracking('slow-op', true);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('exceeded target latency')
      );
      
      consoleSpy.mockRestore();
    });

    it('should track error in latency', () => {
      metrics.startLatencyTracking('op1', 'fetch-data');
      metrics.endLatencyTracking('op1', false, 'Network error');
      
      const latencyMetrics = metrics.getMetricsByType('latency');
      expect(latencyMetrics[0].metadata?.success).toBe(false);
      expect(latencyMetrics[0].metadata?.error).toBe('Network error');
    });
  });

  describe('update propagation tracking', () => {
    it('should track update propagation time', () => {
      const localTime = Date.now();
      const remoteTime = localTime + 50;
      
      const propagationTime = metrics.trackUpdatePropagation('doc1', localTime, remoteTime);
      
      expect(propagationTime).toBe(50);
      
      const latencyMetrics = metrics.getMetricsByType('latency');
      expect(latencyMetrics).toHaveLength(1);
      expect(latencyMetrics[0].metadata?.operation).toBe('update-propagation');
      expect(latencyMetrics[0].metadata?.documentId).toBe('doc1');
    });
  });

  describe('listener tracking', () => {
    it('should track listener count', () => {
      metrics.trackListenerCount(5, 10);
      
      const listenerMetrics = metrics.getMetricsByType('listener-count');
      expect(listenerMetrics).toHaveLength(1);
      expect(listenerMetrics[0].value).toBe(5);
      expect(listenerMetrics[0].metadata?.subscriptions).toBe(10);
    });

    it('should get current listener metrics', () => {
      metrics.trackListenerCount(3, 7);
      metrics.trackListenerCount(5, 10);
      
      const currentMetrics = metrics.getListenerMetrics();
      expect(currentMetrics.activeListeners).toBe(5);
      expect(currentMetrics.totalSubscriptions).toBe(10);
    });
  });

  describe('memory tracking', () => {
    it('should track memory usage if available', () => {
      // Mock performance.memory
      const originalPerformance = global.performance;
      (global as any).performance = {
        ...originalPerformance,
        memory: {
          usedJSHeapSize: 50 * 1048576, // 50MB
          totalJSHeapSize: 100 * 1048576,
          jsHeapSizeLimit: 2048 * 1048576
        }
      };
      
      metrics.trackMemoryUsage();
      
      const memoryMetrics = metrics.getMetricsByType('memory');
      expect(memoryMetrics).toHaveLength(1);
      expect(memoryMetrics[0].value).toBeCloseTo(50, 1);
      
      // Restore
      global.performance = originalPerformance;
    });
  });

  describe('update counting', () => {
    it('should increment update counts by collection', () => {
      metrics.incrementUpdateCount('users');
      metrics.incrementUpdateCount('users');
      metrics.incrementUpdateCount('posts');
      
      const updateStats = metrics.getUpdateStats();
      expect(updateStats.users).toBe(2);
      expect(updateStats.posts).toBe(1);
    });
  });

  describe('error tracking', () => {
    it('should track errors with context', () => {
      const error1 = new Error('Connection failed');
      const error2 = new Error('Connection failed');
      const error3 = new Error('Auth failed');
      
      metrics.trackError(error1, 'network');
      metrics.trackError(error2, 'network');
      metrics.trackError(error3, 'auth');
      
      const errorStats = metrics.getErrorStats();
      expect(errorStats['network-Connection failed']).toBe(2);
      expect(errorStats['auth-Auth failed']).toBe(1);
    });
  });

  describe('metrics aggregation', () => {
    it('should calculate average latency', () => {
      // Add some latency metrics
      metrics.startLatencyTracking('op1', 'test-op');
      metrics.endLatencyTracking('op1');
      
      metrics.startLatencyTracking('op2', 'test-op');
      metrics.endLatencyTracking('op2');
      
      metrics.startLatencyTracking('op3', 'other-op');
      metrics.endLatencyTracking('op3');
      
      // Average should be calculated for specified operation
      const avgLatency = metrics.getAverageLatency('test-op');
      expect(avgLatency).toBeGreaterThan(0);
      
      // Should include all operations if not specified
      const avgAllLatency = metrics.getAverageLatency();
      expect(avgAllLatency).toBeGreaterThan(0);
    });

    it('should calculate percentile latency', () => {
      // Create metrics with known values
      for (let i = 1; i <= 100; i++) {
        metrics.startLatencyTracking(`op${i}`, 'test-op');
        // Manually set the duration
        const tracker = (metrics as any).latencyTrackers.get(`op${i}`);
        if (tracker) {
          tracker.startTime = performance.now() - i;
        }
        metrics.endLatencyTracking(`op${i}`);
      }
      
      const p50 = metrics.getPercentileLatency(50, 'test-op');
      const p95 = metrics.getPercentileLatency(95, 'test-op');
      const p99 = metrics.getPercentileLatency(99, 'test-op');
      
      expect(p50).toBeLessThan(p95);
      expect(p95).toBeLessThan(p99);
    });

    it('should respect time window for metrics', () => {
      // Add old metric
      const oldMetric = {
        id: 'old',
        type: 'latency' as const,
        value: 100,
        timestamp: Date.now() - 120000, // 2 minutes ago
        metadata: { operation: 'test' }
      };
      (metrics as any).metrics.push(oldMetric);
      
      // Add recent metric
      metrics.startLatencyTracking('recent', 'test');
      metrics.endLatencyTracking('recent');
      
      // Should not include old metric with 1 minute window
      const avg = metrics.getAverageLatency('test', 60000);
      expect(avg).toBeGreaterThan(0);
      expect(avg).toBeLessThan(100); // Should be less than old metric value
    });
  });

  describe('metrics subscription', () => {
    it('should notify subscribers of new metrics', () => {
      const listener = vi.fn();
      const unsubscribe = metrics.subscribe(listener);
      
      metrics.incrementUpdateCount('test');
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'update-count',
          metadata: expect.objectContaining({ collection: 'test' })
        })
      );
      
      unsubscribe();
      metrics.incrementUpdateCount('test2');
      
      // Should not be called after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('metrics export and summary', () => {
    it('should export metrics summary', () => {
      metrics.trackListenerCount(5, 10);
      metrics.incrementUpdateCount('users');
      metrics.trackError(new Error('Test error'), 'test');
      
      metrics.startLatencyTracking('op1', 'test');
      metrics.endLatencyTracking('op1');
      
      const exported = metrics.exportMetrics();
      
      expect(exported.updateStats.users).toBe(1);
      expect(exported.errorStats['test-Test error']).toBe(1);
      expect(exported.listenerMetrics.activeListeners).toBe(5);
      expect(exported.averageLatency).toBeGreaterThan(0);
    });

    it('should log summary without errors', () => {
      const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
      
      metrics.trackListenerCount(5, 10);
      metrics.logSummary();
      
      expect(consoleSpy).toHaveBeenCalledWith('🎯 Realtime Performance Summary');
      expect(logSpy).toHaveBeenCalled();
      expect(groupEndSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      logSpy.mockRestore();
      groupEndSpy.mockRestore();
    });
  });

  describe('performance marks and measures', () => {
    it('should create performance marks', () => {
      const markSpy = vi.spyOn(performance, 'mark');
      
      metrics.mark('test-mark');
      
      expect(markSpy).toHaveBeenCalledWith('test-mark');
      
      markSpy.mockRestore();
    });

    it('should measure between marks', () => {
      const measureSpy = vi.spyOn(performance, 'measure');
      const getEntriesSpy = vi.spyOn(performance, 'getEntriesByName').mockReturnValue([
        { name: 'test-measure', duration: 50, startTime: 100 } as any
      ]);
      
      metrics.mark('start');
      metrics.mark('end');
      metrics.measure('test-measure', 'start', 'end');
      
      expect(measureSpy).toHaveBeenCalledWith('test-measure', 'start', 'end');
      
      const latencyMetrics = metrics.getMetricsByType('latency');
      expect(latencyMetrics).toHaveLength(1);
      expect(latencyMetrics[0].value).toBe(50);
      
      measureSpy.mockRestore();
      getEntriesSpy.mockRestore();
    });
  });

  describe('metrics cleanup', () => {
    it('should clear all metrics', () => {
      metrics.trackListenerCount(5, 10);
      metrics.incrementUpdateCount('users');
      metrics.trackError(new Error('Test'), 'test');
      
      metrics.clearMetrics();
      
      expect(metrics.getRecentMetrics()).toHaveLength(0);
      expect(metrics.getUpdateStats()).toEqual({});
      expect(metrics.getErrorStats()).toEqual({});
    });

    it('should limit metrics size', () => {
      // Add more than MAX_METRICS_SIZE
      for (let i = 0; i < 1100; i++) {
        metrics.incrementUpdateCount(`collection-${i}`);
      }
      
      const allMetrics = metrics.getRecentMetrics(2000);
      expect(allMetrics.length).toBeLessThanOrEqual(1000);
    });
  });
});