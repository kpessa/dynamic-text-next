import { Unsubscribe } from 'firebase/firestore';

interface ListenerEntry {
  unsubscribe: Unsubscribe;
  refCount: number;
  path: string;
  type: 'document' | 'collection' | 'query';
  createdAt: number;
}

class ListenerRegistry {
  private listeners: Map<string, ListenerEntry> = new Map();
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 1000;

  /**
   * Register a new listener with reference counting
   */
  register(
    key: string,
    unsubscribe: Unsubscribe,
    path: string,
    type: 'document' | 'collection' | 'query' = 'collection'
  ): void {
    const existing = this.listeners.get(key);
    
    if (existing) {
      // Increment reference count for shared subscription
      existing.refCount++;
      this.listeners.set(key, existing);
    } else {
      // Create new listener entry
      this.listeners.set(key, {
        unsubscribe,
        refCount: 1,
        path,
        type,
        createdAt: Date.now()
      });
    }
  }

  /**
   * Unregister a listener, managing reference count
   */
  unregister(key: string): void {
    const entry = this.listeners.get(key);
    
    if (!entry) {
      console.warn(`Listener not found for key: ${key}`);
      return;
    }

    entry.refCount--;

    if (entry.refCount <= 0) {
      // No more references, clean up listener
      entry.unsubscribe();
      this.listeners.delete(key);
      this.clearReconnectTimer(key);
    } else {
      // Update reference count
      this.listeners.set(key, entry);
    }
  }

  /**
   * Check if a listener exists
   */
  has(key: string): boolean {
    return this.listeners.has(key);
  }

  /**
   * Get listener information
   */
  getListener(key: string): ListenerEntry | undefined {
    return this.listeners.get(key);
  }

  /**
   * Get all active listener keys
   */
  getActiveListeners(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get listener count
   */
  getListenerCount(): number {
    return this.listeners.size;
  }

  /**
   * Get total reference count across all listeners
   */
  getTotalRefCount(): number {
    let total = 0;
    this.listeners.forEach(entry => {
      total += entry.refCount;
    });
    return total;
  }

  /**
   * Clean up all listeners
   */
  cleanup(): void {
    this.listeners.forEach((entry, key) => {
      entry.unsubscribe();
      this.clearReconnectTimer(key);
    });
    this.listeners.clear();
  }

  /**
   * Clean up listeners for a specific path pattern
   */
  cleanupByPath(pathPattern: string): void {
    const keysToRemove: string[] = [];
    
    this.listeners.forEach((entry, key) => {
      if (entry.path.includes(pathPattern)) {
        entry.unsubscribe();
        keysToRemove.push(key);
        this.clearReconnectTimer(key);
      }
    });

    keysToRemove.forEach(key => this.listeners.delete(key));
  }

  /**
   * Setup automatic reconnection for a listener
   */
  setupReconnection(
    key: string,
    reconnectFn: () => Promise<Unsubscribe>,
    attemptNumber = 1
  ): void {
    if (attemptNumber > this.MAX_RECONNECT_ATTEMPTS) {
      console.error(`Max reconnection attempts reached for listener: ${key}`);
      return;
    }

    const delay = this.RECONNECT_DELAY * Math.pow(2, attemptNumber - 1);
    
    const timer = setTimeout(async () => {
      try {
        const entry = this.listeners.get(key);
        if (!entry) {
          // Listener was removed, stop reconnection
          return;
        }

        // Attempt to reconnect
        const newUnsubscribe = await reconnectFn();
        
        // Update listener with new unsubscribe function
        this.listeners.set(key, {
          ...entry,
          unsubscribe: newUnsubscribe
        });

        console.log(`Successfully reconnected listener: ${key}`);
        this.clearReconnectTimer(key);
      } catch (error) {
        console.error(`Failed to reconnect listener ${key}:`, error);
        // Try again with exponential backoff
        this.setupReconnection(key, reconnectFn, attemptNumber + 1);
      }
    }, delay);

    this.reconnectTimers.set(key, timer);
  }

  /**
   * Clear reconnection timer for a listener
   */
  private clearReconnectTimer(key: string): void {
    const timer = this.reconnectTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(key);
    }
  }

  /**
   * Get debug information about listeners
   */
  getDebugInfo(): {
    totalListeners: number;
    totalRefCount: number;
    listeners: Array<{
      key: string;
      path: string;
      type: string;
      refCount: number;
      age: number;
    }>;
  } {
    const now = Date.now();
    const listeners = Array.from(this.listeners.entries()).map(([key, entry]) => ({
      key,
      path: entry.path,
      type: entry.type,
      refCount: entry.refCount,
      age: now - entry.createdAt
    }));

    return {
      totalListeners: this.listeners.size,
      totalRefCount: this.getTotalRefCount(),
      listeners
    };
  }
}

// Export singleton instance
export const listenerRegistry = new ListenerRegistry();

// Export type for testing
export type { ListenerEntry };