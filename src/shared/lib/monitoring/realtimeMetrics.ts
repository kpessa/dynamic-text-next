interface PerformanceMetric {
  id: string;
  type: 'latency' | 'listener-count' | 'memory' | 'update-count' | 'error';
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface LatencyMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
}

interface ListenerMetrics {
  activeListeners: number;
  totalSubscriptions: number;
  memoryUsage: number;
  lastUpdated: number;
}

class RealtimeMetrics {
  private metrics: PerformanceMetric[] = [];
  private latencyTrackers: Map<string, LatencyMetric> = new Map();
  private updateCounts: Map<string, number> = new Map();
  private errorCounts: Map<string, number> = new Map();
  private readonly MAX_METRICS_SIZE = 1000;
  private readonly TARGET_LATENCY = 100; // milliseconds
  private metricsListeners: Set<(metrics: PerformanceMetric) => void> = new Set();

  /**
   * Start tracking latency for an operation
   */
  startLatencyTracking(operationId: string, operation: string): void {
    this.latencyTrackers.set(operationId, {
      operation,
      startTime: performance.now(),
      success: false
    });
  }

  /**
   * End tracking latency for an operation
   */
  endLatencyTracking(operationId: string, success = true, error?: string): number | null {
    const tracker = this.latencyTrackers.get(operationId);
    
    if (!tracker) {
      console.warn(`No latency tracker found for operation: ${operationId}`);
      return null;
    }
    
    const endTime = performance.now();
    const duration = endTime - tracker.startTime;
    
    tracker.endTime = endTime;
    tracker.duration = duration;
    tracker.success = success;
    tracker.error = error;
    
    // Record the metric
    this.recordMetric({
      id: operationId,
      type: 'latency',
      value: duration,
      timestamp: Date.now(),
      metadata: {
        operation: tracker.operation,
        success,
        error,
        exceedsTarget: duration > this.TARGET_LATENCY
      }
    });
    
    // Clean up tracker
    this.latencyTrackers.delete(operationId);
    
    // Log if exceeds target
    if (duration > this.TARGET_LATENCY) {
      console.warn(
        `Operation ${tracker.operation} exceeded target latency: ${duration.toFixed(2)}ms > ${this.TARGET_LATENCY}ms`
      );
    }
    
    return duration;
  }

  /**
   * Track update propagation time
   */
  trackUpdatePropagation(
    documentId: string,
    localUpdateTime: number,
    remoteReceiveTime: number
  ): number {
    const propagationTime = remoteReceiveTime - localUpdateTime;
    
    this.recordMetric({
      id: `propagation-${documentId}-${Date.now()}`,
      type: 'latency',
      value: propagationTime,
      timestamp: Date.now(),
      metadata: {
        documentId,
        operation: 'update-propagation',
        exceedsTarget: propagationTime > this.TARGET_LATENCY
      }
    });
    
    return propagationTime;
  }

  /**
   * Track listener count
   */
  trackListenerCount(count: number, subscriptions: number): void {
    this.recordMetric({
      id: `listeners-${Date.now()}`,
      type: 'listener-count',
      value: count,
      timestamp: Date.now(),
      metadata: {
        subscriptions,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage(): void {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      const usedMemory = memory.usedJSHeapSize / 1048576; // Convert to MB
      
      this.recordMetric({
        id: `memory-${Date.now()}`,
        type: 'memory',
        value: usedMemory,
        timestamp: Date.now(),
        metadata: {
          totalHeapSize: memory.totalJSHeapSize / 1048576,
          heapSizeLimit: memory.jsHeapSizeLimit / 1048576
        }
      });
    }
  }

  /**
   * Increment update count for a collection
   */
  incrementUpdateCount(collection: string): void {
    const current = this.updateCounts.get(collection) || 0;
    this.updateCounts.set(collection, current + 1);
    
    this.recordMetric({
      id: `updates-${collection}-${Date.now()}`,
      type: 'update-count',
      value: current + 1,
      timestamp: Date.now(),
      metadata: {
        collection,
        total: current + 1
      }
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, context: string): void {
    const errorKey = `${context}-${error.message}`;
    const current = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, current + 1);
    
    this.recordMetric({
      id: `error-${Date.now()}`,
      type: 'error',
      value: current + 1,
      timestamp: Date.now(),
      metadata: {
        context,
        message: error.message,
        stack: error.stack,
        count: current + 1
      }
    });
  }

  /**
   * Record a metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Limit metrics size
    if (this.metrics.length > this.MAX_METRICS_SIZE) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS_SIZE);
    }
    
    // Notify listeners
    this.metricsListeners.forEach(listener => listener(metric));
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: PerformanceMetric['type'], limit = 100): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.type === type)
      .slice(-limit);
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(limit = 100): PerformanceMetric[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get average latency for an operation
   */
  getAverageLatency(operation?: string, timeWindow = 60000): number {
    const now = Date.now();
    const latencyMetrics = this.metrics.filter(m => {
      if (m.type !== 'latency') return false;
      if (m.timestamp < now - timeWindow) return false;
      if (operation && m.metadata?.operation !== operation) return false;
      return true;
    });
    
    if (latencyMetrics.length === 0) return 0;
    
    const sum = latencyMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / latencyMetrics.length;
  }

  /**
   * Get percentile latency
   */
  getPercentileLatency(percentile: number, operation?: string, timeWindow = 60000): number {
    const now = Date.now();
    const latencyMetrics = this.metrics
      .filter(m => {
        if (m.type !== 'latency') return false;
        if (m.timestamp < now - timeWindow) return false;
        if (operation && m.metadata?.operation !== operation) return false;
        return true;
      })
      .map(m => m.value)
      .sort((a, b) => a - b);
    
    if (latencyMetrics.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * latencyMetrics.length) - 1;
    return latencyMetrics[Math.max(0, index)];
  }

  /**
   * Get current listener metrics
   */
  getListenerMetrics(): ListenerMetrics {
    const latestListenerMetric = this.metrics
      .filter(m => m.type === 'listener-count')
      .pop();
    
    const latestMemoryMetric = this.metrics
      .filter(m => m.type === 'memory')
      .pop();
    
    return {
      activeListeners: latestListenerMetric?.value || 0,
      totalSubscriptions: latestListenerMetric?.metadata?.subscriptions || 0,
      memoryUsage: latestMemoryMetric?.value || 0,
      lastUpdated: latestListenerMetric?.timestamp || Date.now()
    };
  }

  /**
   * Get update statistics
   */
  getUpdateStats(): Record<string, number> {
    return Object.fromEntries(this.updateCounts);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  /**
   * Subscribe to metrics updates
   */
  subscribe(listener: (metric: PerformanceMetric) => void): () => void {
    this.metricsListeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.metricsListeners.delete(listener);
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.latencyTrackers.clear();
    this.updateCounts.clear();
    this.errorCounts.clear();
  }

  /**
   * Export metrics for debugging
   */
  exportMetrics(): {
    metrics: PerformanceMetric[];
    updateStats: Record<string, number>;
    errorStats: Record<string, number>;
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    listenerMetrics: ListenerMetrics;
  } {
    return {
      metrics: this.getRecentMetrics(100),
      updateStats: this.getUpdateStats(),
      errorStats: this.getErrorStats(),
      averageLatency: this.getAverageLatency(),
      p95Latency: this.getPercentileLatency(95),
      p99Latency: this.getPercentileLatency(99),
      listenerMetrics: this.getListenerMetrics()
    };
  }

  /**
   * Log performance summary
   */
  logSummary(): void {
    const summary = this.exportMetrics();
    
    console.group('🎯 Realtime Performance Summary');
    console.log(`Average Latency: ${summary.averageLatency.toFixed(2)}ms`);
    console.log(`P95 Latency: ${summary.p95Latency.toFixed(2)}ms`);
    console.log(`P99 Latency: ${summary.p99Latency.toFixed(2)}ms`);
    console.log(`Active Listeners: ${summary.listenerMetrics.activeListeners}`);
    console.log(`Memory Usage: ${summary.listenerMetrics.memoryUsage.toFixed(2)}MB`);
    console.log('Update Counts:', summary.updateStats);
    
    if (Object.keys(summary.errorStats).length > 0) {
      console.warn('Errors:', summary.errorStats);
    }
    
    console.groupEnd();
  }

  /**
   * Create performance marks for browser dev tools
   */
  mark(name: string): void {
    if (typeof performance !== 'undefined' && 'mark' in performance) {
      performance.mark(name);
    }
  }

  /**
   * Measure between two marks
   */
  measure(name: string, startMark: string, endMark: string): void {
    if (typeof performance !== 'undefined' && 'measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
        
        // Get the measure and record it
        const measures = performance.getEntriesByName(name, 'measure');
        if (measures.length > 0) {
          const measure = measures[measures.length - 1];
          this.recordMetric({
            id: `measure-${name}-${Date.now()}`,
            type: 'latency',
            value: measure.duration,
            timestamp: Date.now(),
            metadata: {
              operation: name,
              startTime: measure.startTime
            }
          });
        }
      } catch (error) {
        console.error(`Failed to measure ${name}:`, error);
      }
    }
  }
}

// Export singleton instance
export const realtimeMetrics = new RealtimeMetrics();

// Export types and class for testing
export type { PerformanceMetric, LatencyMetric, ListenerMetrics };
export { RealtimeMetrics };