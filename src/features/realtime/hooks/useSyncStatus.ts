import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { listenerRegistry } from '@/shared/lib/firebase/listenerRegistry';
import { realtimeMetrics } from '@/shared/lib/monitoring/realtimeMetrics';
import { 
  getPendingUpdates, 
  getUpdateQueueSize 
} from '@/app/store/middleware/optimisticUpdates';

export interface SyncStatus {
  status: 'synced' | 'syncing' | 'offline' | 'error' | 'pending';
  pendingCount: number;
  activeListeners: number;
  lastSyncTime: Date | null;
  errorMessage?: string;
  metrics: {
    averageLatency: number;
    totalUpdates: number;
    errorCount: number;
  };
}

export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'synced',
    pendingCount: 0,
    activeListeners: 0,
    lastSyncTime: null,
    metrics: {
      averageLatency: 0,
      totalUpdates: 0,
      errorCount: 0
    }
  });

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Check for pending updates
  const updateSyncStatus = useCallback(() => {
    const pendingUpdates = getPendingUpdates();
    const queueSize = getUpdateQueueSize();
    const activeListeners = listenerRegistry.getListenerCount();
    
    // Get metrics
    const averageLatency = realtimeMetrics.getAverageLatency();
    const updateStats = realtimeMetrics.getUpdateStats();
    const errorStats = realtimeMetrics.getErrorStats();
    
    const totalUpdates = Object.values(updateStats).reduce((sum, count) => sum + count, 0);
    const errorCount = Object.values(errorStats).reduce((sum, count) => sum + count, 0);
    
    // Determine status
    let status: SyncStatus['status'] = 'synced';
    
    if (!isOnline) {
      status = 'offline';
    } else if (errorCount > 0) {
      status = 'error';
    } else if (pendingUpdates.length > 0 || queueSize > 0) {
      status = 'pending';
    } else if (activeListeners === 0) {
      status = 'offline';
    } else {
      status = 'synced';
    }
    
    setSyncStatus(prev => ({
      status,
      pendingCount: pendingUpdates.length + queueSize,
      activeListeners,
      lastSyncTime: status === 'synced' ? new Date() : prev.lastSyncTime,
      errorMessage: errorCount > 0 ? `${errorCount} sync errors` : undefined,
      metrics: {
        averageLatency,
        totalUpdates,
        errorCount
      }
    }));
  }, [isOnline]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('📡 Connection restored');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📵 Connection lost');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to metrics updates
  useEffect(() => {
    const unsubscribe = realtimeMetrics.subscribe(() => {
      updateSyncStatus();
    });
    
    // Update status every second
    const interval = setInterval(updateSyncStatus, 1000);
    
    // Initial update
    updateSyncStatus();
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [updateSyncStatus]);

  // Helper functions
  const clearErrors = useCallback(() => {
    // This would typically clear error states in Redux
    setSyncStatus(prev => ({
      ...prev,
      status: prev.status === 'error' ? 'synced' : prev.status,
      errorMessage: undefined
    }));
  }, []);

  const getDebugInfo = useCallback(() => {
    return {
      listenerDebug: listenerRegistry.getDebugInfo(),
      metricsExport: realtimeMetrics.exportMetrics(),
      pendingUpdates: getPendingUpdates()
    };
  }, []);

  const logPerformanceSummary = useCallback(() => {
    realtimeMetrics.logSummary();
  }, []);

  return {
    ...syncStatus,
    isOnline,
    clearErrors,
    getDebugInfo,
    logPerformanceSummary
  };
}