import { SharedIngredient, SyncConflict } from '@/entities/shared-ingredient';

export type ResolutionStrategy = 'local' | 'server' | 'merge' | 'manual';

export class ConflictResolver {
  private static instance: ConflictResolver;

  static getInstance(): ConflictResolver {
    if (!ConflictResolver.instance) {
      ConflictResolver.instance = new ConflictResolver();
    }
    return ConflictResolver.instance;
  }

  async resolveConflict(
    conflict: SyncConflict,
    strategy: ResolutionStrategy,
    customData?: Partial<SharedIngredient>
  ): Promise<SharedIngredient> {
    switch (strategy) {
      case 'local':
        return conflict.localVersion;
      case 'server':
        return conflict.serverVersion;
      case 'merge':
        return this.autoMerge(conflict);
      case 'manual':
        if (!customData) throw new Error('Custom data required for manual resolution');
        return { ...conflict.serverVersion, ...customData };
      default:
        throw new Error(`Unknown resolution strategy: ${strategy}`);
    }
  }

  private autoMerge(conflict: SyncConflict): SharedIngredient {
    const { localVersion, serverVersion } = conflict;
    
    // Take newer metadata from server, merge other fields intelligently
    return {
      ...serverVersion,
      // Merge reference ranges (union)
      referenceRanges: this.mergeArrays(
        localVersion.referenceRanges,
        serverVersion.referenceRanges,
        'populationType'
      ),
      // Combine customizations
      customizations: this.mergeArrays(
        localVersion.customizations || [],
        serverVersion.customizations || [],
        'referenceId'
      ),
      // Keep server metadata but update version
      metadata: {
        ...serverVersion.metadata,
        version: serverVersion.metadata.version + 1,
        modifiedAt: new Date()
      }
    };
  }

  private mergeArrays<T extends { [key: string]: any }>(
    arr1: T[],
    arr2: T[],
    uniqueKey: keyof T
  ): T[] {
    const merged = new Map<any, T>();
    
    [...arr1, ...arr2].forEach(item => {
      const key = item[uniqueKey];
      if (!merged.has(key) || this.isNewer(item, merged.get(key)!)) {
        merged.set(key, item);
      }
    });
    
    return Array.from(merged.values());
  }

  private isNewer(item1: any, item2: any): boolean {
    const date1 = item1.modifiedAt || item1.createdAt || 0;
    const date2 = item2.modifiedAt || item2.createdAt || 0;
    return date1 > date2;
  }

  detectConflicts(local: SharedIngredient, server: SharedIngredient): string[] {
    const conflicts: string[] = [];
    
    if (local.displayName !== server.displayName) conflicts.push('displayName');
    if (local.unit !== server.unit) conflicts.push('unit');
    if (JSON.stringify(local.referenceRanges) !== JSON.stringify(server.referenceRanges)) {
      conflicts.push('referenceRanges');
    }
    
    return conflicts;
  }
}