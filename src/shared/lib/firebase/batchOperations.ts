import { 
  writeBatch, 
  runTransaction,
  Firestore,
  DocumentReference,
  DocumentData,
  Transaction
} from 'firebase/firestore';
import { realtimeMetrics } from '../monitoring/realtimeMetrics';

export interface BatchOperation {
  type: 'set' | 'update' | 'delete';
  ref: DocumentReference;
  data?: DocumentData;
  options?: { merge?: boolean };
}

export interface BatchResult {
  success: boolean;
  operationCount: number;
  duration: number;
  error?: Error;
  failedOperations?: BatchOperation[];
}

export interface TransactionOperation<T> {
  operation: (transaction: Transaction) => Promise<T>;
  retries?: number;
}

class BatchOperations {
  private readonly MAX_BATCH_SIZE = 500; // Firestore limit
  private readonly MAX_BATCH_BYTES = 1048576; // 1MB limit
  private readonly DEBOUNCE_DELAY = 100; // milliseconds
  private pendingOperations: Map<string, BatchOperation[]> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private progressCallbacks: Map<string, (progress: number) => void> = new Map();

  /**
   * Execute batch write operations
   */
  async executeBatch(
    db: Firestore,
    operations: BatchOperation[],
    onProgress?: (progress: number) => void
  ): Promise<BatchResult> {
    const operationId = `batch-${Date.now()}`;
    
    realtimeMetrics.startLatencyTracking(operationId, 'batch-write');
    
    try {
      // Split operations into chunks if exceeding max size
      const chunks = this.splitIntoChunks(operations);
      let totalProcessed = 0;
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const batch = writeBatch(db);
        
        // Apply operations to batch
        for (const op of chunk) {
          switch (op.type) {
            case 'set':
              batch.set(op.ref, op.data || {}, op.options || {});
              break;
            case 'update':
              batch.update(op.ref, op.data || {});
              break;
            case 'delete':
              batch.delete(op.ref);
              break;
          }
        }
        
        // Commit the batch
        await batch.commit();
        
        totalProcessed += chunk.length;
        
        // Report progress
        if (onProgress) {
          const progress = (totalProcessed / operations.length) * 100;
          onProgress(progress);
        }
      }
      
      const duration = realtimeMetrics.endLatencyTracking(operationId, true) || 0;
      
      return {
        success: true,
        operationCount: operations.length,
        duration
      };
    } catch (error) {
      const duration = realtimeMetrics.endLatencyTracking(operationId, false, (error as Error).message) || 0;
      realtimeMetrics.trackError(error as Error, 'batch-operations');
      
      return {
        success: false,
        operationCount: operations.length,
        duration,
        error: error as Error
      };
    }
  }

  /**
   * Execute batch with automatic retry on failure
   */
  async executeBatchWithRetry(
    db: Firestore,
    operations: BatchOperation[],
    maxRetries = 3,
    onProgress?: (progress: number) => void
  ): Promise<BatchResult> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.executeBatch(db, operations, onProgress);
      
      if (result.success) {
        return result;
      }
      
      lastError = result.error;
      
      // Exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return {
      success: false,
      operationCount: operations.length,
      duration: 0,
      error: lastError || new Error('Batch operation failed after retries')
    };
  }

  /**
   * Add operation to debounced batch
   */
  addDebouncedOperation(
    batchId: string,
    operation: BatchOperation,
    flushCallback: (operations: BatchOperation[]) => Promise<void>
  ): void {
    // Add to pending operations
    if (!this.pendingOperations.has(batchId)) {
      this.pendingOperations.set(batchId, []);
    }
    this.pendingOperations.get(batchId)!.push(operation);
    
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(batchId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new debounce timer
    const timer = setTimeout(async () => {
      const operations = this.pendingOperations.get(batchId) || [];
      
      if (operations.length > 0) {
        try {
          await flushCallback(operations);
        } catch (error) {
          console.error(`Failed to flush batch ${batchId}:`, error);
        }
        
        // Clear operations after flush
        this.pendingOperations.delete(batchId);
      }
      
      this.debounceTimers.delete(batchId);
    }, this.DEBOUNCE_DELAY);
    
    this.debounceTimers.set(batchId, timer);
  }

  /**
   * Flush pending operations immediately
   */
  async flushPendingOperations(
    batchId: string,
    flushCallback: (operations: BatchOperation[]) => Promise<void>
  ): Promise<void> {
    // Clear timer
    const timer = this.debounceTimers.get(batchId);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(batchId);
    }
    
    // Get and flush operations
    const operations = this.pendingOperations.get(batchId) || [];
    if (operations.length > 0) {
      await flushCallback(operations);
      this.pendingOperations.delete(batchId);
    }
  }

  /**
   * Clear all pending operations for a batch
   */
  clearPendingOperations(batchId: string): void {
    const timer = this.debounceTimers.get(batchId);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(batchId);
    }
    this.pendingOperations.delete(batchId);
  }

  /**
   * Execute transaction with automatic retry
   */
  async executeTransaction<T>(
    db: Firestore,
    operation: TransactionOperation<T>
  ): Promise<T> {
    const maxRetries = operation.retries || 5;
    const operationId = `transaction-${Date.now()}`;
    
    realtimeMetrics.startLatencyTracking(operationId, 'transaction');
    
    try {
      const result = await runTransaction(db, operation.operation, {
        maxAttempts: maxRetries
      });
      
      realtimeMetrics.endLatencyTracking(operationId, true);
      return result;
    } catch (error) {
      realtimeMetrics.endLatencyTracking(operationId, false, (error as Error).message);
      realtimeMetrics.trackError(error as Error, 'transaction');
      throw error;
    }
  }

  /**
   * Split operations into chunks based on Firestore limits
   */
  private splitIntoChunks(operations: BatchOperation[]): BatchOperation[][] {
    const chunks: BatchOperation[][] = [];
    let currentChunk: BatchOperation[] = [];
    let currentSize = 0;
    
    for (const op of operations) {
      // Estimate operation size (rough approximation)
      const opSize = this.estimateOperationSize(op);
      
      // Check if adding this operation would exceed limits
      if (
        currentChunk.length >= this.MAX_BATCH_SIZE ||
        (currentSize + opSize > this.MAX_BATCH_BYTES && currentChunk.length > 0)
      ) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentSize = 0;
      }
      
      currentChunk.push(op);
      currentSize += opSize;
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  /**
   * Estimate operation size in bytes
   */
  private estimateOperationSize(operation: BatchOperation): number {
    // Base size for operation metadata
    let size = 100;
    
    // Add data size if present
    if (operation.data) {
      size += JSON.stringify(operation.data).length;
    }
    
    // Add reference path size
    if (operation.ref) {
      size += operation.ref.path.length;
    }
    
    return size;
  }

  /**
   * Create batch writer with progress tracking
   */
  createBatchWriter(
    db: Firestore,
    batchId: string,
    options?: {
      autoFlush?: boolean;
      flushSize?: number;
      onProgress?: (progress: number) => void;
    }
  ) {
    const operations: BatchOperation[] = [];
    const flushSize = options?.flushSize || this.MAX_BATCH_SIZE;
    
    const checkAutoFlush = async () => {
      if (options?.autoFlush && operations.length >= flushSize) {
        return flush();
      }
    };
    
    const flush = async (): Promise<BatchResult> => {
      if (operations.length === 0) {
        return {
          success: true,
          operationCount: 0,
          duration: 0
        };
      }
      
      const result = await this.executeBatch(db, [...operations], options?.onProgress);
      operations.length = 0; // Clear operations after flush
      return result;
    };
    
    return {
      set: (ref: DocumentReference, data: DocumentData, setOptions?: { merge?: boolean }) => {
        operations.push({ type: 'set', ref, data, options: setOptions });
        checkAutoFlush();
      },
      
      update: (ref: DocumentReference, data: DocumentData) => {
        operations.push({ type: 'update', ref, data });
        checkAutoFlush();
      },
      
      delete: (ref: DocumentReference) => {
        operations.push({ type: 'delete', ref });
        checkAutoFlush();
      },
      
      checkAutoFlush,
      
      flush,
      
      getOperationCount: () => operations.length,
      
      clear: () => {
        operations.length = 0;
      }
    };
  }

  /**
   * Batch delete documents
   */
  async batchDelete(
    db: Firestore,
    refs: DocumentReference[],
    onProgress?: (progress: number) => void
  ): Promise<BatchResult> {
    const operations: BatchOperation[] = refs.map(ref => ({
      type: 'delete',
      ref
    }));
    
    return this.executeBatch(db, operations, onProgress);
  }

  /**
   * Batch update documents
   */
  async batchUpdate(
    db: Firestore,
    updates: Array<{ ref: DocumentReference; data: DocumentData }>,
    onProgress?: (progress: number) => void
  ): Promise<BatchResult> {
    const operations: BatchOperation[] = updates.map(({ ref, data }) => ({
      type: 'update',
      ref,
      data
    }));
    
    return this.executeBatch(db, operations, onProgress);
  }

  /**
   * Batch set documents
   */
  async batchSet(
    db: Firestore,
    documents: Array<{ ref: DocumentReference; data: DocumentData; options?: { merge?: boolean } }>,
    onProgress?: (progress: number) => void
  ): Promise<BatchResult> {
    const operations: BatchOperation[] = documents.map(({ ref, data, options }) => ({
      type: 'set',
      ref,
      data,
      options
    }));
    
    return this.executeBatch(db, operations, onProgress);
  }

  /**
   * Get statistics about pending operations
   */
  getPendingStats(): {
    totalBatches: number;
    totalOperations: number;
    batches: Record<string, number>;
  } {
    const batches: Record<string, number> = {};
    let totalOperations = 0;
    
    this.pendingOperations.forEach((ops, batchId) => {
      batches[batchId] = ops.length;
      totalOperations += ops.length;
    });
    
    return {
      totalBatches: this.pendingOperations.size,
      totalOperations,
      batches
    };
  }

  /**
   * Clear all pending operations and timers
   */
  clearAll(): void {
    // Clear all timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    
    // Clear all pending operations
    this.pendingOperations.clear();
    
    // Clear progress callbacks
    this.progressCallbacks.clear();
  }
}

// Export singleton instance
export const batchOperations = new BatchOperations();

// Export class for testing
export { BatchOperations };