import { useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { 
  onSnapshot, 
  collection, 
  query, 
  where, 
  QueryConstraint,
  Firestore,
  DocumentData,
  QuerySnapshot,
  DocumentChange
} from 'firebase/firestore';
import { listenerRegistry } from '@/shared/lib/firebase/listenerRegistry';
import { realtimeMetrics } from '@/shared/lib/monitoring/realtimeMetrics';
import { conflictResolver } from '@/shared/lib/firebase/conflictResolver';
import { 
  optimisticUpdate, 
  confirmUpdate, 
  rollbackUpdate 
} from '@/app/store/middleware/optimisticUpdates';

interface RealtimeSyncOptions {
  collection: string;
  queryConstraints?: QueryConstraint[];
  onAdded?: (data: DocumentData) => void;
  onModified?: (data: DocumentData) => void;
  onRemoved?: (id: string) => void;
  conflictStrategy?: 'last-write-wins' | 'field-merge' | 'manual';
  enableOptimisticUpdates?: boolean;
  listenerId?: string;
}

export function useRealtimeSync(
  db: Firestore | null,
  options: RealtimeSyncOptions
) {
  const dispatch = useDispatch();
  const localStateRef = useRef<Map<string, DocumentData>>(new Map());
  const {
    collection: collectionName,
    queryConstraints = [],
    onAdded,
    onModified,
    onRemoved,
    conflictStrategy = 'last-write-wins',
    enableOptimisticUpdates = true,
    listenerId
  } = options;

  const handleDocumentChange = useCallback((change: DocumentChange<DocumentData>) => {
    const docId = change.doc.id;
    const data = { id: docId, ...change.doc.data() };
    const operationId = `${collectionName}-${docId}-${Date.now()}`;
    
    realtimeMetrics.startLatencyTracking(operationId, `realtime-${change.type}`);
    
    try {
      switch (change.type) {
        case 'added':
          localStateRef.current.set(docId, data);
          onAdded?.(data);
          realtimeMetrics.incrementUpdateCount(collectionName);
          break;
          
        case 'modified': {
          const localVersion = localStateRef.current.get(docId);
          
          if (localVersion && conflictResolver.detectConflict(localVersion, data)) {
            // Handle conflict
            const conflict = {
              id: docId,
              localVersion,
              remoteVersion: data,
              conflictType: 'update-update' as const,
              timestamp: Date.now()
            };
            
            const resolved = conflictResolver.resolveConflict(
              conflict,
              conflictStrategy
            );
            
            localStateRef.current.set(docId, resolved.resolvedData);
            onModified?.(resolved.resolvedData);
            
            console.log(`Conflict resolved for ${docId} using ${conflictStrategy}`);
          } else {
            localStateRef.current.set(docId, data);
            onModified?.(data);
          }
          
          realtimeMetrics.incrementUpdateCount(collectionName);
          break;
        }
          
        case 'removed':
          localStateRef.current.delete(docId);
          onRemoved?.(docId);
          realtimeMetrics.incrementUpdateCount(collectionName);
          break;
      }
      
      realtimeMetrics.endLatencyTracking(operationId, true);
    } catch (error) {
      realtimeMetrics.endLatencyTracking(operationId, false, (error as Error).message);
      realtimeMetrics.trackError(error as Error, `realtime-${collectionName}`);
      console.error(`Error handling ${change.type} for ${docId}:`, error);
    }
  }, [collectionName, onAdded, onModified, onRemoved, conflictStrategy]);

  const setupListener = useCallback(() => {
    if (!db) return null;
    
    const q = queryConstraints.length > 0
      ? query(collection(db, collectionName), ...queryConstraints)
      : collection(db, collectionName);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        snapshot.docChanges().forEach(handleDocumentChange);
        
        // Track listener metrics
        realtimeMetrics.trackListenerCount(
          listenerRegistry.getListenerCount(),
          listenerRegistry.getTotalRefCount()
        );
      },
      (error) => {
        console.error(`Error in realtime listener for ${collectionName}:`, error);
        realtimeMetrics.trackError(error as Error, `listener-${collectionName}`);
        
        // Attempt reconnection
        const reconnectFn = async () => {
          const newUnsubscribe = setupListener();
          return newUnsubscribe || (() => {});
        };
        
        listenerRegistry.setupReconnection(
          listenerId || `${collectionName}-default`,
          reconnectFn
        );
      }
    );
    
    return unsubscribe;
  }, [db, collectionName, queryConstraints, handleDocumentChange, listenerId]);

  useEffect(() => {
    if (!db) return;
    
    const listenerKey = listenerId || `${collectionName}-default`;
    
    // Setup listener with registry
    const unsubscribe = setupListener();
    
    if (unsubscribe) {
      listenerRegistry.register(
        listenerKey,
        unsubscribe,
        collectionName,
        'collection'
      );
    }
    
    // Cleanup on unmount
    return () => {
      listenerRegistry.unregister(listenerKey);
      localStateRef.current.clear();
    };
  }, [db, collectionName, listenerId, setupListener]);

  // Helper function for optimistic updates
  const performOptimisticUpdate = useCallback(
    async (
      updateAction: { type: string; payload?: unknown },
      asyncOperation: () => Promise<void>,
      rollbackData: unknown
    ) => {
      if (!enableOptimisticUpdates) {
        await asyncOperation();
        return;
      }
      
      const updateId = `${collectionName}-${Date.now()}`;
      
      // Dispatch optimistic update
      dispatch(optimisticUpdate(updateId, updateAction, rollbackData));
      
      try {
        await asyncOperation();
        dispatch(confirmUpdate(updateId));
      } catch (error) {
        dispatch(rollbackUpdate(updateId, error as Error));
        throw error;
      }
    },
    [dispatch, collectionName, enableOptimisticUpdates]
  );

  return {
    performOptimisticUpdate,
    getLocalState: () => localStateRef.current,
    isListening: () => listenerRegistry.has(listenerId || `${collectionName}-default`)
  };
}