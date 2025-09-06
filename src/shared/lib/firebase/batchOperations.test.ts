import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BatchOperations, BatchOperation } from './batchOperations';
import type { DocumentReference } from 'firebase/firestore';

// Mock Firestore
const mockCommit = vi.fn();
const mockSet = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock('firebase/firestore', () => ({
  writeBatch: vi.fn(() => ({
    set: mockSet,
    update: mockUpdate,
    delete: mockDelete,
    commit: mockCommit
  })),
  runTransaction: vi.fn((db, callback) => callback({
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  })),
  doc: vi.fn((db, path) => ({ path })),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn()
}));

// Mock metrics
vi.mock('../monitoring/realtimeMetrics', () => ({
  realtimeMetrics: {
    startLatencyTracking: vi.fn(),
    endLatencyTracking: vi.fn(() => 100),
    trackError: vi.fn()
  }
}));

describe('BatchOperations', () => {
  let batchOps: BatchOperations;
  let mockDb: { type: string };

  beforeEach(() => {
    batchOps = new BatchOperations();
    mockDb = { type: 'firestore' };
    mockCommit.mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    batchOps.clearAll();
  });

  describe('executeBatch', () => {
    it('should execute batch operations successfully', async () => {
      const operations: BatchOperation[] = [
        { type: 'set', ref: { path: 'users/1' } as DocumentReference, data: { name: 'John' } },
        { type: 'update', ref: { path: 'users/2' } as DocumentReference, data: { age: 30 } },
        { type: 'delete', ref: { path: 'users/3' } as DocumentReference }
      ];

      const result = await batchOps.executeBatch(mockDb, operations);

      expect(result.success).toBe(true);
      expect(result.operationCount).toBe(3);
      expect(result.duration).toBe(100);
      expect(mockSet).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockCommit).toHaveBeenCalledTimes(1);
    });

    it('should handle batch operation failure', async () => {
      const error = new Error('Batch failed');
      mockCommit.mockRejectedValueOnce(error);

      const operations: BatchOperation[] = [
        { type: 'set', ref: { path: 'users/1' } as DocumentReference, data: { name: 'John' } }
      ];

      const result = await batchOps.executeBatch(mockDb, operations);

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should split large batches into chunks', async () => {
      // Create 600 operations (exceeds 500 limit)
      const operations: BatchOperation[] = [];
      for (let i = 0; i < 600; i++) {
        operations.push({
          type: 'set',
          ref: { path: `users/${i}` } as DocumentReference,
          data: { id: i }
        });
      }

      await batchOps.executeBatch(mockDb, operations);

      // Should be called twice (500 + 100)
      expect(mockCommit).toHaveBeenCalledTimes(2);
    });

    it('should report progress during batch execution', async () => {
      const onProgress = vi.fn();
      const operations: BatchOperation[] = [
        { type: 'set', ref: { path: 'users/1' } as DocumentReference, data: { name: 'John' } },
        { type: 'set', ref: { path: 'users/2' } as DocumentReference, data: { name: 'Jane' } }
      ];

      await batchOps.executeBatch(mockDb, operations, onProgress);

      expect(onProgress).toHaveBeenCalledWith(100);
    });
  });

  describe('executeBatchWithRetry', () => {
    it('should retry on failure', async () => {
      const error = new Error('Temporary failure');
      mockCommit
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(undefined);

      const operations: BatchOperation[] = [
        { type: 'set', ref: { path: 'users/1' } as DocumentReference, data: { name: 'John' } }
      ];

      const result = await batchOps.executeBatchWithRetry(mockDb, operations, 3);

      expect(result.success).toBe(true);
      expect(mockCommit).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const error = new Error('Persistent failure');
      mockCommit.mockRejectedValue(error);

      const operations: BatchOperation[] = [
        { type: 'set', ref: { path: 'users/1' } as DocumentReference, data: { name: 'John' } }
      ];

      const result = await batchOps.executeBatchWithRetry(mockDb, operations, 2);

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(mockCommit).toHaveBeenCalledTimes(2);
    });
  });

  describe('debounced operations', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce operations', async () => {
      const flushCallback = vi.fn();
      const operation1: BatchOperation = {
        type: 'set',
        ref: { path: 'users/1' } as DocumentReference,
        data: { name: 'John' }
      };
      const operation2: BatchOperation = {
        type: 'set',
        ref: { path: 'users/2' } as DocumentReference,
        data: { name: 'Jane' }
      };

      batchOps.addDebouncedOperation('batch1', operation1, flushCallback);
      batchOps.addDebouncedOperation('batch1', operation2, flushCallback);

      expect(flushCallback).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(100);

      expect(flushCallback).toHaveBeenCalledTimes(1);
      expect(flushCallback).toHaveBeenCalledWith([operation1, operation2]);
    });

    it('should flush pending operations immediately', async () => {
      const flushCallback = vi.fn();
      const operation: BatchOperation = {
        type: 'set',
        ref: { path: 'users/1' } as DocumentReference,
        data: { name: 'John' }
      };

      batchOps.addDebouncedOperation('batch1', operation, flushCallback);
      
      await batchOps.flushPendingOperations('batch1', flushCallback);

      expect(flushCallback).toHaveBeenCalledWith([operation]);
    });

    it('should clear pending operations', () => {
      const flushCallback = vi.fn();
      const operation: BatchOperation = {
        type: 'set',
        ref: { path: 'users/1' } as DocumentReference,
        data: { name: 'John' }
      };

      batchOps.addDebouncedOperation('batch1', operation, flushCallback);
      batchOps.clearPendingOperations('batch1');

      vi.advanceTimersByTime(200);

      expect(flushCallback).not.toHaveBeenCalled();
    });
  });

  describe('createBatchWriter', () => {
    it('should create a batch writer', async () => {
      const writer = batchOps.createBatchWriter(mockDb, 'writer1');

      writer.set({ path: 'users/1' } as DocumentReference, { name: 'John' });
      writer.update({ path: 'users/2' } as DocumentReference, { age: 30 });
      writer.delete({ path: 'users/3' } as DocumentReference);

      expect(writer.getOperationCount()).toBe(3);

      const result = await writer.flush();

      expect(result.success).toBe(true);
      expect(result.operationCount).toBe(3);
      expect(writer.getOperationCount()).toBe(0);
    });

    it('should auto-flush when reaching flush size', async () => {
      const writer = batchOps.createBatchWriter(mockDb, 'writer1', {
        autoFlush: true,
        flushSize: 2
      });

      writer.set({ path: 'users/1' } as DocumentReference, { name: 'John' });
      writer.set({ path: 'users/2' } as DocumentReference, { name: 'Jane' });

      // Wait for auto-flush to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should have auto-flushed after 2 operations
      expect(mockCommit).toHaveBeenCalledTimes(1);

      // Add one more to trigger another batch
      writer.set({ path: 'users/3' } as DocumentReference, { name: 'Bob' });
      
      await writer.flush();
      
      // Should have flushed remaining operations
      expect(mockCommit).toHaveBeenCalledTimes(2);
    });

    it('should clear operations', () => {
      const writer = batchOps.createBatchWriter(mockDb, 'writer1');

      writer.set({ path: 'users/1' } as DocumentReference, { name: 'John' });
      expect(writer.getOperationCount()).toBe(1);

      writer.clear();
      expect(writer.getOperationCount()).toBe(0);
    });
  });

  describe('batch helper methods', () => {
    it('should batch delete documents', async () => {
      const refs = [
        { path: 'users/1' } as DocumentReference,
        { path: 'users/2' } as DocumentReference,
        { path: 'users/3' } as DocumentReference
      ];

      const result = await batchOps.batchDelete(mockDb, refs);

      expect(result.success).toBe(true);
      expect(result.operationCount).toBe(3);
      expect(mockDelete).toHaveBeenCalledTimes(3);
    });

    it('should batch update documents', async () => {
      const updates = [
        { ref: { path: 'users/1' } as DocumentReference, data: { age: 25 } },
        { ref: { path: 'users/2' } as DocumentReference, data: { age: 30 } }
      ];

      const result = await batchOps.batchUpdate(mockDb, updates);

      expect(result.success).toBe(true);
      expect(result.operationCount).toBe(2);
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    it('should batch set documents', async () => {
      const documents = [
        { ref: { path: 'users/1' } as DocumentReference, data: { name: 'John' } },
        { ref: { path: 'users/2' } as DocumentReference, data: { name: 'Jane' }, options: { merge: true } }
      ];

      const result = await batchOps.batchSet(mockDb, documents);

      expect(result.success).toBe(true);
      expect(result.operationCount).toBe(2);
      expect(mockSet).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPendingStats', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return statistics about pending operations', () => {
      const flushCallback = vi.fn();
      
      batchOps.addDebouncedOperation('batch1', {
        type: 'set',
        ref: { path: 'users/1' } as DocumentReference,
        data: { name: 'John' }
      }, flushCallback);
      
      batchOps.addDebouncedOperation('batch1', {
        type: 'set',
        ref: { path: 'users/2' } as DocumentReference,
        data: { name: 'Jane' }
      }, flushCallback);
      
      batchOps.addDebouncedOperation('batch2', {
        type: 'delete',
        ref: { path: 'users/3' } as DocumentReference
      }, flushCallback);

      const stats = batchOps.getPendingStats();

      expect(stats.totalBatches).toBe(2);
      expect(stats.totalOperations).toBe(3);
      expect(stats.batches.batch1).toBe(2);
      expect(stats.batches.batch2).toBe(1);
    });
  });

  describe('clearAll', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should clear all pending operations and timers', () => {
      const flushCallback = vi.fn();
      
      batchOps.addDebouncedOperation('batch1', {
        type: 'set',
        ref: { path: 'users/1' } as DocumentReference,
        data: { name: 'John' }
      }, flushCallback);

      batchOps.clearAll();

      const stats = batchOps.getPendingStats();
      expect(stats.totalBatches).toBe(0);
      expect(stats.totalOperations).toBe(0);

      vi.advanceTimersByTime(200);
      expect(flushCallback).not.toHaveBeenCalled();
    });
  });
});