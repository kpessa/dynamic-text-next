import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import {
  optimisticUpdatesMiddleware,
  optimisticUpdate,
  confirmUpdate,
  rollbackUpdate,
  batchOptimisticUpdate,
  getPendingUpdates,
  isUpdatePending,
  clearPendingUpdates,
  getUpdateQueueSize,
  withOptimisticUpdate
} from './optimisticUpdates';

// Simple test reducer
interface TestState {
  value: number;
  items: Array<{ id: number; name: string }>;
}

const testReducer = (
  state: TestState = { value: 0, items: [] },
  action: { type: string; payload?: { value?: number; items?: TestState['items'] } & Record<string, unknown> }
): TestState => {
  switch (action.type) {
    case 'TEST_UPDATE':
      return { ...state, value: action.payload?.value ?? state.value };
    case 'TEST_UPDATE_ROLLBACK':
      return { ...state, value: action.payload?.value ?? state.value };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload as { id: number; name: string }] };
    case 'ADD_ITEM_ROLLBACK':
      return { ...state, items: action.payload?.items ?? [] };
    default:
      return state;
  }
};

describe('optimisticUpdatesMiddleware', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    clearPendingUpdates();
    store = configureStore({
      reducer: {
        test: testReducer
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(optimisticUpdatesMiddleware)
    });
  });

  describe('optimistic update flow', () => {
    it('should handle optimistic update', () => {
      const updateAction = { type: 'TEST_UPDATE', payload: { value: 42 } };
      const rollbackData = { value: 0 };

      store.dispatch(optimisticUpdate('update-1', updateAction, rollbackData));

      expect(store.getState().test.value).toBe(42);
      expect(isUpdatePending('update-1')).toBe(true);
      expect(getUpdateQueueSize()).toBe(1);
    });

    it('should confirm optimistic update', () => {
      const updateAction = { type: 'TEST_UPDATE', payload: { value: 42 } };
      const rollbackData = { value: 0 };

      store.dispatch(optimisticUpdate('update-1', updateAction, rollbackData));
      store.dispatch(confirmUpdate('update-1'));

      expect(store.getState().test.value).toBe(42);
      expect(isUpdatePending('update-1')).toBe(false);
      expect(getUpdateQueueSize()).toBe(0);
    });

    it('should rollback optimistic update', () => {
      const updateAction = { type: 'TEST_UPDATE', payload: { value: 42 } };
      const rollbackData = { value: 0 };

      store.dispatch(optimisticUpdate('update-1', updateAction, rollbackData));
      expect(store.getState().test.value).toBe(42);

      store.dispatch(rollbackUpdate('update-1', new Error('Update failed')));

      expect(store.getState().test.value).toBe(0);
      expect(isUpdatePending('update-1')).toBe(false);
      expect(getUpdateQueueSize()).toBe(0);
    });

    it('should add optimistic metadata to dispatched actions', () => {
      const updateAction = { type: 'TEST_UPDATE', payload: { value: 42 } };
      const rollbackData = { value: 0 };

      store.dispatch(optimisticUpdate('update-1', updateAction, rollbackData));

      // Verify the update was applied and is pending
      expect(store.getState().test.value).toBe(42);
      expect(isUpdatePending('update-1')).toBe(true);
      
      // Check that the pending update has the correct metadata
      const pending = getPendingUpdates();
      expect(pending[0].action.type).toBe('TEST_UPDATE');
    });
  });

  describe('batch optimistic updates', () => {
    it('should handle batch optimistic updates', () => {
      const updates = [
        {
          id: 'update-1',
          action: { type: 'ADD_ITEM', payload: { id: 1, name: 'Item 1' } },
          rollbackData: { items: [] }
        },
        {
          id: 'update-2',
          action: { type: 'ADD_ITEM', payload: { id: 2, name: 'Item 2' } },
          rollbackData: { items: [{ id: 1, name: 'Item 1' }] }
        }
      ];

      store.dispatch(batchOptimisticUpdate(updates));

      expect(store.getState().test.items).toHaveLength(2);
      expect(isUpdatePending('update-1')).toBe(true);
      expect(isUpdatePending('update-2')).toBe(true);
      expect(getUpdateQueueSize()).toBe(2);
    });

    it('should rollback batch updates independently', () => {
      const updates = [
        {
          id: 'update-1',
          action: { type: 'ADD_ITEM', payload: { id: 1, name: 'Item 1' } },
          rollbackData: { items: [] }
        },
        {
          id: 'update-2',
          action: { type: 'ADD_ITEM', payload: { id: 2, name: 'Item 2' } },
          rollbackData: { items: [{ id: 1, name: 'Item 1' }] }
        }
      ];

      store.dispatch(batchOptimisticUpdate(updates));
      
      // Confirm first, rollback second
      store.dispatch(confirmUpdate('update-1'));
      store.dispatch(rollbackUpdate('update-2'));

      expect(store.getState().test.items).toHaveLength(1);
      expect(store.getState().test.items[0].id).toBe(1);
      expect(isUpdatePending('update-1')).toBe(false);
      expect(isUpdatePending('update-2')).toBe(false);
    });
  });

  describe('helper functions', () => {
    it('should get pending updates', () => {
      const updateAction1 = { type: 'TEST_UPDATE', payload: { value: 42 } };
      const updateAction2 = { type: 'TEST_UPDATE', payload: { value: 100 } };

      store.dispatch(optimisticUpdate('update-1', updateAction1, { value: 0 }));
      store.dispatch(optimisticUpdate('update-2', updateAction2, { value: 42 }));

      const pending = getPendingUpdates();
      expect(pending).toHaveLength(2);
      expect(pending[0].id).toBe('update-1');
      expect(pending[1].id).toBe('update-2');
    });

    it('should clear pending updates', () => {
      const updateAction = { type: 'TEST_UPDATE', payload: { value: 42 } };

      store.dispatch(optimisticUpdate('update-1', updateAction, { value: 0 }));
      expect(getUpdateQueueSize()).toBe(1);

      clearPendingUpdates();

      expect(getUpdateQueueSize()).toBe(0);
      expect(getPendingUpdates()).toHaveLength(0);
    });
  });

  describe('withOptimisticUpdate wrapper', () => {
    it('should handle successful async operation', async () => {
      const updateAction = { type: 'TEST_UPDATE', payload: { value: 42 } };
      const rollbackData = { value: 0 };
      const asyncOp = vi.fn().mockResolvedValue('success');

      const result = await withOptimisticUpdate(
        'update-1',
        updateAction,
        rollbackData,
        asyncOp,
        store.dispatch
      );

      expect(result).toBe('success');
      expect(store.getState().test.value).toBe(42);
      expect(isUpdatePending('update-1')).toBe(false);
    });

    it('should rollback on async operation failure', async () => {
      const updateAction = { type: 'TEST_UPDATE', payload: { value: 42 } };
      const rollbackData = { value: 0 };
      const asyncOp = vi.fn().mockRejectedValue(new Error('Async failed'));

      await expect(
        withOptimisticUpdate(
          'update-1',
          updateAction,
          rollbackData,
          asyncOp,
          store.dispatch
        )
      ).rejects.toThrow('Async failed');

      expect(store.getState().test.value).toBe(0);
      expect(isUpdatePending('update-1')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle confirm for non-existent update', () => {
      expect(() => {
        store.dispatch(confirmUpdate('non-existent'));
      }).not.toThrow();
      
      expect(getUpdateQueueSize()).toBe(0);
    });

    it('should handle rollback for non-existent update', () => {
      expect(() => {
        store.dispatch(rollbackUpdate('non-existent'));
      }).not.toThrow();
      
      expect(getUpdateQueueSize()).toBe(0);
    });

    it('should maintain update queue order', () => {
      for (let i = 1; i <= 5; i++) {
        store.dispatch(optimisticUpdate(
          `update-${i}`,
          { type: 'TEST_UPDATE', payload: { value: i } },
          { value: 0 }
        ));
      }

      const pending = getPendingUpdates();
      expect(pending).toHaveLength(5);
      expect(pending[0].id).toBe('update-1');
      expect(pending[4].id).toBe('update-5');
    });

    it('should handle concurrent updates to same entity', () => {
      const updateAction1 = { type: 'TEST_UPDATE', payload: { value: 42 } };
      const updateAction2 = { type: 'TEST_UPDATE', payload: { value: 100 } };

      store.dispatch(optimisticUpdate('update-1', updateAction1, { value: 0 }));
      store.dispatch(optimisticUpdate('update-2', updateAction2, { value: 42 }));

      expect(store.getState().test.value).toBe(100);
      expect(getUpdateQueueSize()).toBe(2);

      // Rollback the second update
      store.dispatch(rollbackUpdate('update-2'));
      
      // Should revert to the first update's value
      expect(store.getState().test.value).toBe(42);
    });
  });
});