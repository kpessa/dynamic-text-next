import { DocumentData, Timestamp } from 'firebase/firestore';

export interface ConflictInfo {
  id: string;
  localVersion: DocumentData;
  remoteVersion: DocumentData;
  baseVersion?: DocumentData;
  conflictType: 'update-update' | 'delete-update' | 'create-create';
  timestamp: number;
}

export interface ResolvedConflict {
  id: string;
  resolvedData: DocumentData;
  strategy: 'last-write-wins' | 'field-merge' | 'manual' | 'local-wins' | 'remote-wins';
  conflictInfo: ConflictInfo;
}

export type ConflictResolutionStrategy = 
  | 'last-write-wins'
  | 'field-merge'
  | 'manual'
  | 'local-wins'
  | 'remote-wins';

export type FieldMergeStrategy = 'local' | 'remote' | 'newer' | 'merge-arrays';

interface FieldMergeConfig {
  [fieldPath: string]: FieldMergeStrategy;
}

class ConflictResolver {
  private conflictQueue: ConflictInfo[] = [];
  private resolutionHistory: ResolvedConflict[] = [];
  private readonly MAX_HISTORY_SIZE = 100;
  private conflictHandlers: Map<string, (conflict: ConflictInfo) => ResolvedConflict> = new Map();

  /**
   * Detect if there's a conflict between local and remote versions
   */
  detectConflict(
    localVersion: DocumentData,
    remoteVersion: DocumentData,
    baseVersion?: DocumentData
  ): boolean {
    // If there's no base version, use timestamp comparison
    if (!baseVersion) {
      const localTimestamp = this.getTimestamp(localVersion);
      const remoteTimestamp = this.getTimestamp(remoteVersion);
      
      // Conflict if both have been modified recently (within 1 second)
      if (localTimestamp && remoteTimestamp) {
        return Math.abs(localTimestamp - remoteTimestamp) < 1000;
      }
    }
    
    // With base version, check if both local and remote differ from base
    if (baseVersion) {
      const localDiffers = !this.deepEqual(localVersion, baseVersion);
      const remoteDiffers = !this.deepEqual(remoteVersion, baseVersion);
      return localDiffers && remoteDiffers;
    }
    
    // Check if versions are different
    return !this.deepEqual(localVersion, remoteVersion);
  }

  /**
   * Resolve conflict using specified strategy
   */
  resolveConflict(
    conflict: ConflictInfo,
    strategy: ConflictResolutionStrategy = 'last-write-wins',
    fieldMergeConfig?: FieldMergeConfig
  ): ResolvedConflict {
    let resolvedData: DocumentData;
    
    switch (strategy) {
      case 'last-write-wins':
        resolvedData = this.resolveLastWriteWins(conflict);
        break;
        
      case 'field-merge':
        resolvedData = this.resolveFieldMerge(conflict, fieldMergeConfig);
        break;
        
      case 'local-wins':
        resolvedData = conflict.localVersion;
        break;
        
      case 'remote-wins':
        resolvedData = conflict.remoteVersion;
        break;
        
      case 'manual':
        // For manual resolution, return local version temporarily
        // Actual manual resolution should be handled by UI
        resolvedData = conflict.localVersion;
        this.addToQueue(conflict);
        break;
        
      default:
        resolvedData = this.resolveLastWriteWins(conflict);
    }
    
    const resolved: ResolvedConflict = {
      id: conflict.id,
      resolvedData,
      strategy,
      conflictInfo: conflict
    };
    
    this.addToHistory(resolved);
    return resolved;
  }

  /**
   * Resolve using last-write-wins strategy
   */
  private resolveLastWriteWins(conflict: ConflictInfo): DocumentData {
    const localTimestamp = this.getTimestamp(conflict.localVersion);
    const remoteTimestamp = this.getTimestamp(conflict.remoteVersion);
    
    if (!localTimestamp && !remoteTimestamp) {
      // No timestamps, prefer remote (server) version
      return conflict.remoteVersion;
    }
    
    if (!localTimestamp) return conflict.remoteVersion;
    if (!remoteTimestamp) return conflict.localVersion;
    
    // Return the newer version
    return localTimestamp > remoteTimestamp 
      ? conflict.localVersion 
      : conflict.remoteVersion;
  }

  /**
   * Resolve using field-level merge strategy
   */
  private resolveFieldMerge(
    conflict: ConflictInfo,
    config?: FieldMergeConfig
  ): DocumentData {
    const merged: DocumentData = { ...conflict.remoteVersion };
    const defaultStrategy: FieldMergeStrategy = 'newer';
    
    // Get all unique field paths
    const allFields = new Set([
      ...Object.keys(conflict.localVersion),
      ...Object.keys(conflict.remoteVersion)
    ]);
    
    allFields.forEach(field => {
      const strategy = config?.[field] || defaultStrategy;
      const localValue = conflict.localVersion[field];
      const remoteValue = conflict.remoteVersion[field];
      
      switch (strategy) {
        case 'local':
          merged[field] = localValue;
          break;
          
        case 'remote':
          merged[field] = remoteValue;
          break;
          
        case 'newer':
          // Try to determine which is newer
          if (this.isTimestamp(localValue) && this.isTimestamp(remoteValue)) {
            merged[field] = localValue.seconds > remoteValue.seconds ? localValue : remoteValue;
          } else {
            // Can't determine, use remote
            merged[field] = remoteValue;
          }
          break;
          
        case 'merge-arrays':
          if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
            // Merge arrays, removing duplicates
            const mergedArray = [...new Set([...localValue, ...remoteValue])];
            merged[field] = mergedArray;
          } else {
            merged[field] = remoteValue;
          }
          break;
          
        default:
          merged[field] = remoteValue;
      }
    });
    
    // Ensure updatedAt timestamp is current
    merged.updatedAt = Timestamp.now();
    
    return merged;
  }

  /**
   * Register a custom conflict handler for specific document types
   */
  registerHandler(
    documentType: string,
    handler: (conflict: ConflictInfo) => ResolvedConflict
  ): void {
    this.conflictHandlers.set(documentType, handler);
  }

  /**
   * Get custom handler for document type if exists
   */
  getHandler(documentType: string): ((conflict: ConflictInfo) => ResolvedConflict) | undefined {
    return this.conflictHandlers.get(documentType);
  }

  /**
   * Add conflict to queue for manual resolution
   */
  addToQueue(conflict: ConflictInfo): void {
    // Avoid duplicates
    const exists = this.conflictQueue.some(c => c.id === conflict.id);
    if (!exists) {
      this.conflictQueue.push(conflict);
    }
  }

  /**
   * Get conflicts pending manual resolution
   */
  getConflictQueue(): ConflictInfo[] {
    return [...this.conflictQueue];
  }

  /**
   * Remove conflict from queue after resolution
   */
  removeFromQueue(conflictId: string): void {
    this.conflictQueue = this.conflictQueue.filter(c => c.id !== conflictId);
  }

  /**
   * Clear all pending conflicts
   */
  clearQueue(): void {
    this.conflictQueue = [];
  }

  /**
   * Add resolved conflict to history
   */
  private addToHistory(resolved: ResolvedConflict): void {
    this.resolutionHistory.unshift(resolved);
    
    // Limit history size
    if (this.resolutionHistory.length > this.MAX_HISTORY_SIZE) {
      this.resolutionHistory = this.resolutionHistory.slice(0, this.MAX_HISTORY_SIZE);
    }
  }

  /**
   * Get resolution history
   */
  getHistory(): ResolvedConflict[] {
    return [...this.resolutionHistory];
  }

  /**
   * Clear resolution history
   */
  clearHistory(): void {
    this.resolutionHistory = [];
  }

  /**
   * Helper to get timestamp from document
   */
  private getTimestamp(doc: DocumentData): number | null {
    if (doc.updatedAt && this.isTimestamp(doc.updatedAt)) {
      return doc.updatedAt.toMillis();
    }
    if (doc.createdAt && this.isTimestamp(doc.createdAt)) {
      return doc.createdAt.toMillis();
    }
    if (doc._updatedAt && typeof doc._updatedAt === 'number') {
      return doc._updatedAt;
    }
    return null;
  }

  /**
   * Check if value is a Firestore Timestamp
   */
  private isTimestamp(value: unknown): value is Timestamp {
    return value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value;
  }

  /**
   * Deep equality check for objects
   */
  private deepEqual(obj1: unknown, obj2: unknown): boolean {
    if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return false;
    
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return obj1 === obj2;
    }
    
    const keys1 = Object.keys(obj1 as Record<string, unknown>);
    const keys2 = Object.keys(obj2 as Record<string, unknown>);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      
      if (!this.deepEqual((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key])) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Create a three-way merge for complex conflicts
   */
  threeWayMerge(
    baseVersion: DocumentData,
    localVersion: DocumentData,
    remoteVersion: DocumentData
  ): DocumentData {
    const merged: DocumentData = { ...baseVersion };
    const allFields = new Set([
      ...Object.keys(baseVersion),
      ...Object.keys(localVersion),
      ...Object.keys(remoteVersion)
    ]);
    
    allFields.forEach(field => {
      const baseValue = baseVersion[field];
      const localValue = localVersion[field];
      const remoteValue = remoteVersion[field];
      
      // No conflict if only one side changed
      if (this.deepEqual(baseValue, localValue)) {
        merged[field] = remoteValue;
      } else if (this.deepEqual(baseValue, remoteValue)) {
        merged[field] = localValue;
      } else if (this.deepEqual(localValue, remoteValue)) {
        merged[field] = localValue;
      } else {
        // Both sides changed differently - conflict!
        // Use last-write-wins for this field
        const localTimestamp = this.getTimestamp(localVersion);
        const remoteTimestamp = this.getTimestamp(remoteVersion);
        
        merged[field] = (localTimestamp && remoteTimestamp && localTimestamp > remoteTimestamp)
          ? localValue
          : remoteValue;
      }
    });
    
    return merged;
  }
}

// Export singleton instance
export const conflictResolver = new ConflictResolver();

// Export class for testing
export { ConflictResolver };