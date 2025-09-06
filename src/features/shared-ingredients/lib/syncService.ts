import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase/config';
import { 
  SharedIngredient, 
  SyncOperation, 
  SyncConflict 
} from '@/entities/shared-ingredient';

export class SyncService {
  private static instance: SyncService;
  private syncQueue: SyncOperation[] = [];
  private syncInProgress = false;
  private listeners = new Map<string, () => void>();
  private conflictHandlers = new Map<string, (conflict: SyncConflict) => void>();

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async syncSharedIngredient(
    ingredientId: string,
    changes: Partial<SharedIngredient>
  ): Promise<void> {
    const operation: SyncOperation = {
      id: crypto.randomUUID(),
      ingredientId,
      type: 'update',
      changes,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    };

    this.syncQueue.push(operation);
    
    if (!this.syncInProgress) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.syncInProgress = true;

    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue.shift()!;
      operation.status = 'in-progress';

      try {
        await this.executeSyncOperation(operation);
        operation.status = 'completed';
      } catch (error) {
        operation.error = (error as Error).message;
        
        if (operation.retries < 3) {
          operation.retries++;
          operation.status = 'pending';
          this.syncQueue.push(operation);
        } else {
          operation.status = 'failed';
          console.error('Sync failed after retries:', error);
        }
      }
    }

    this.syncInProgress = false;
  }

  private async executeSyncOperation(operation: SyncOperation): Promise<void> {
    const docRef = doc(db, 'sharedIngredients', operation.ingredientId);
    const current = await getDoc(docRef);
    
    if (!current.exists() && operation.type === 'update') {
      throw new Error(`Ingredient ${operation.ingredientId} not found`);
    }

    if (operation.type === 'create') {
      await setDoc(docRef, {
        ...operation.changes,
        'metadata.createdAt': serverTimestamp(),
        'metadata.version': 1
      });
    } else if (operation.type === 'update') {
      const serverData = current.data() as SharedIngredient;
      const serverVersion = serverData.metadata?.version || 0;
      const localVersion = operation.changes.metadata?.version || 0;

      if (serverVersion > localVersion) {
        // Conflict detected
        const conflict: SyncConflict = {
          ingredientId: operation.ingredientId,
          localVersion: operation.changes as SharedIngredient,
          serverVersion: serverData,
          detectedAt: new Date()
        };
        
        await this.handleConflict(conflict);
      } else {
        await updateDoc(docRef, {
          ...operation.changes,
          'metadata.modifiedAt': serverTimestamp(),
          'metadata.version': increment(1)
        });
      }
    } else if (operation.type === 'delete') {
      await updateDoc(docRef, {
        isActive: false,
        'metadata.deletedAt': serverTimestamp()
      });
    }
  }

  private async handleConflict(conflict: SyncConflict): Promise<void> {
    const handler = this.conflictHandlers.get(conflict.ingredientId);
    
    if (handler) {
      handler(conflict);
    } else {
      // Default conflict resolution - keep server version
      console.warn('Conflict detected, keeping server version:', conflict);
    }
  }

  subscribeToIngredient(
    ingredientId: string,
    callback: (ingredient: SharedIngredient | null) => void
  ): () => void {
    const docRef = doc(db, 'sharedIngredients', ingredientId);
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as SharedIngredient);
      } else {
        callback(null);
      }
    });

    this.listeners.set(ingredientId, unsubscribe);
    
    return () => {
      unsubscribe();
      this.listeners.delete(ingredientId);
    };
  }

  setConflictHandler(
    ingredientId: string,
    handler: (conflict: SyncConflict) => void
  ): void {
    this.conflictHandlers.set(ingredientId, handler);
  }

  removeConflictHandler(ingredientId: string): void {
    this.conflictHandlers.delete(ingredientId);
  }

  getSyncStatus(): {
    queueLength: number;
    syncInProgress: boolean;
    activeListeners: number;
  } {
    return {
      queueLength: this.syncQueue.length,
      syncInProgress: this.syncInProgress,
      activeListeners: this.listeners.size
    };
  }

  async forceSyncAll(ingredientIds: string[]): Promise<void> {
    for (const id of ingredientIds) {
      const docRef = doc(db, 'sharedIngredients', id);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data() as SharedIngredient;
        await this.syncSharedIngredient(id, data);
      }
    }
  }

  clearQueue(): void {
    this.syncQueue = [];
  }

  async retryFailedOperations(): Promise<void> {
    const failed = this.syncQueue.filter(op => op.status === 'failed');
    failed.forEach(op => {
      op.retries = 0;
      op.status = 'pending';
    });
    
    if (!this.syncInProgress) {
      await this.processQueue();
    }
  }
}