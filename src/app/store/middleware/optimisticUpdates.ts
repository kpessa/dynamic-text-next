import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../../store';

interface OptimisticUpdate {
  id: string;
  action: { type: string; payload?: unknown; meta?: Record<string, unknown> };
  rollbackData: unknown;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

interface OptimisticState {
  pendingUpdates: Map<string, OptimisticUpdate>;
  updateQueue: OptimisticUpdate[];
}

const optimisticState: OptimisticState = {
  pendingUpdates: new Map(),
  updateQueue: []
};

// Action types for optimistic updates
export const OPTIMISTIC_UPDATE = 'optimistic/update';
export const CONFIRM_UPDATE = 'optimistic/confirm';
export const ROLLBACK_UPDATE = 'optimistic/rollback';
export const BATCH_OPTIMISTIC_UPDATE = 'optimistic/batchUpdate';

// Action creators
export const optimisticUpdate = (
  id: string, 
  action: { type: string; payload?: unknown; meta?: Record<string, unknown> }, 
  rollbackData: unknown
) => ({
  type: OPTIMISTIC_UPDATE,
  payload: { id, action, rollbackData }
});

export const confirmUpdate = (id: string) => ({
  type: CONFIRM_UPDATE,
  payload: { id }
});

export const rollbackUpdate = (id: string, error?: Error) => ({
  type: ROLLBACK_UPDATE,
  payload: { id, errorMessage: error?.message }
});

export const batchOptimisticUpdate = (
  updates: Array<{ 
    id: string; 
    action: { type: string; payload?: unknown; meta?: Record<string, unknown> }; 
    rollbackData: unknown 
  }>
) => ({
  type: BATCH_OPTIMISTIC_UPDATE,
  payload: { updates }
});

/**
 * Middleware for handling optimistic updates
 */
export const optimisticUpdatesMiddleware: Middleware<object, RootState> = (store) => (next) => (action) => {
  // Handle optimistic update actions
  switch (action.type) {
    case OPTIMISTIC_UPDATE: {
      const { id, action: updateAction, rollbackData } = action.payload;
      
      // Store the pending update
      const update: OptimisticUpdate = {
        id,
        action: updateAction,
        rollbackData,
        timestamp: Date.now(),
        status: 'pending'
      };
      
      optimisticState.pendingUpdates.set(id, update);
      optimisticState.updateQueue.push(update);
      
      // Dispatch the actual update action
      store.dispatch(updateAction);
      
      // Mark action as optimistic for other middleware/reducers
      if (updateAction.meta) {
        updateAction.meta.optimistic = true;
        updateAction.meta.optimisticId = id;
      } else {
        updateAction.meta = { optimistic: true, optimisticId: id };
      }
      
      return next(action);
    }
    
    case BATCH_OPTIMISTIC_UPDATE: {
      const { updates } = action.payload;
      
      // Process all updates in the batch
      updates.forEach(({ id, action: updateAction, rollbackData }) => {
        const update: OptimisticUpdate = {
          id,
          action: updateAction,
          rollbackData,
          timestamp: Date.now(),
          status: 'pending'
        };
        
        optimisticState.pendingUpdates.set(id, update);
        optimisticState.updateQueue.push(update);
        
        // Mark as part of batch
        if (updateAction.meta) {
          updateAction.meta.optimistic = true;
          updateAction.meta.optimisticId = id;
          updateAction.meta.batch = true;
        } else {
          updateAction.meta = { 
            optimistic: true, 
            optimisticId: id,
            batch: true
          };
        }
        
        // Dispatch the update
        store.dispatch(updateAction);
      });
      
      return next(action);
    }
    
    case CONFIRM_UPDATE: {
      const { id } = action.payload;
      const update = optimisticState.pendingUpdates.get(id);
      
      if (update) {
        update.status = 'confirmed';
        optimisticState.pendingUpdates.delete(id);
        
        // Remove from queue
        const queueIndex = optimisticState.updateQueue.findIndex(u => u.id === id);
        if (queueIndex !== -1) {
          optimisticState.updateQueue.splice(queueIndex, 1);
        }
      }
      
      return next(action);
    }
    
    case ROLLBACK_UPDATE: {
      const { id, errorMessage } = action.payload;
      const update = optimisticState.pendingUpdates.get(id);
      
      if (update) {
        update.status = 'failed';
        
        // Dispatch rollback action with the saved data
        const rollbackAction = {
          type: `${update.action.type}_ROLLBACK`,
          payload: update.rollbackData,
          meta: {
            optimisticId: id,
            rollback: true,
            error: errorMessage
          }
        };
        
        store.dispatch(rollbackAction);
        
        // Clean up
        optimisticState.pendingUpdates.delete(id);
        
        // Remove from queue
        const queueIndex = optimisticState.updateQueue.findIndex(u => u.id === id);
        if (queueIndex !== -1) {
          optimisticState.updateQueue.splice(queueIndex, 1);
        }
      }
      
      return next(action);
    }
    
    default:
      return next(action);
  }
};

/**
 * Helper function to get pending updates
 */
export const getPendingUpdates = (): OptimisticUpdate[] => {
  return Array.from(optimisticState.pendingUpdates.values());
};

/**
 * Helper function to check if an update is pending
 */
export const isUpdatePending = (id: string): boolean => {
  return optimisticState.pendingUpdates.has(id);
};

/**
 * Helper function to clear all pending updates
 * Use with caution - this will not rollback the updates
 */
export const clearPendingUpdates = (): void => {
  optimisticState.pendingUpdates.clear();
  optimisticState.updateQueue = [];
};

/**
 * Helper function to get update queue size
 */
export const getUpdateQueueSize = (): number => {
  return optimisticState.updateQueue.length;
};

/**
 * Helper function to process queued updates
 * Useful for batching multiple updates to Firestore
 */
export const processUpdateQueue = async (
  processFn: (updates: OptimisticUpdate[]) => Promise<void>
): Promise<void> => {
  if (optimisticState.updateQueue.length === 0) {
    return;
  }
  
  const updates = [...optimisticState.updateQueue];
  
  try {
    await processFn(updates);
    
    // Confirm all processed updates
    updates.forEach(update => {
      optimisticState.pendingUpdates.delete(update.id);
    });
    
    // Clear processed updates from queue
    optimisticState.updateQueue = optimisticState.updateQueue.filter(
      update => !updates.includes(update)
    );
  } catch (error) {
    // Rollback all failed updates
    updates.forEach(update => {
      // Note: We can't dispatch here directly, caller should handle rollback
      console.error(`Failed to process update ${update.id}:`, error);
    });
    
    throw error;
  }
};

/**
 * Helper function to create optimistic update wrapper
 */
export const withOptimisticUpdate = async <T>(
  id: string,
  updateAction: { type: string; payload?: unknown; meta?: Record<string, unknown> },
  rollbackData: unknown,
  asyncOperation: () => Promise<T>,
  dispatch: (action: unknown) => void
): Promise<T> => {
  // Dispatch optimistic update
  dispatch(optimisticUpdate(id, updateAction, rollbackData));
  
  try {
    // Perform the async operation
    const result = await asyncOperation();
    
    // Confirm the update
    dispatch(confirmUpdate(id));
    
    return result;
  } catch (error) {
    // Rollback on failure
    dispatch(rollbackUpdate(id, error as Error));
    throw error;
  }
};