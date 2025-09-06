import { describe, it, expect, beforeEach } from 'vitest';
import { ConflictResolver, ConflictInfo } from './conflictResolver';
import { Timestamp } from 'firebase/firestore';

describe('ConflictResolver', () => {
  let resolver: ConflictResolver;

  beforeEach(() => {
    resolver = new ConflictResolver();
  });

  describe('detectConflict', () => {
    it('should detect conflict when versions differ without base version', () => {
      const local = { id: '1', value: 'local', updatedAt: Timestamp.fromMillis(1000) };
      const remote = { id: '1', value: 'remote', updatedAt: Timestamp.fromMillis(1500) };
      
      const hasConflict = resolver.detectConflict(local, remote);
      expect(hasConflict).toBe(true);
    });

    it('should not detect conflict when versions are identical', () => {
      const local = { id: '1', value: 'same' };
      const remote = { id: '1', value: 'same' };
      
      const hasConflict = resolver.detectConflict(local, remote);
      expect(hasConflict).toBe(false);
    });

    it('should detect conflict with base version when both sides changed', () => {
      const base = { id: '1', value: 'original' };
      const local = { id: '1', value: 'local' };
      const remote = { id: '1', value: 'remote' };
      
      const hasConflict = resolver.detectConflict(local, remote, base);
      expect(hasConflict).toBe(true);
    });

    it('should not detect conflict when only one side changed from base', () => {
      const base = { id: '1', value: 'original' };
      const local = { id: '1', value: 'original' };
      const remote = { id: '1', value: 'remote' };
      
      const hasConflict = resolver.detectConflict(local, remote, base);
      expect(hasConflict).toBe(false);
    });
  });

  describe('resolveConflict - last-write-wins', () => {
    it('should choose newer version based on timestamp', () => {
      const conflict: ConflictInfo = {
        id: 'doc1',
        localVersion: { value: 'local', updatedAt: Timestamp.fromMillis(2000) },
        remoteVersion: { value: 'remote', updatedAt: Timestamp.fromMillis(1000) },
        conflictType: 'update-update',
        timestamp: Date.now()
      };
      
      const resolved = resolver.resolveConflict(conflict, 'last-write-wins');
      
      expect(resolved.resolvedData.value).toBe('local');
      expect(resolved.strategy).toBe('last-write-wins');
    });

    it('should prefer remote when timestamps are missing', () => {
      const conflict: ConflictInfo = {
        id: 'doc1',
        localVersion: { value: 'local' },
        remoteVersion: { value: 'remote' },
        conflictType: 'update-update',
        timestamp: Date.now()
      };
      
      const resolved = resolver.resolveConflict(conflict, 'last-write-wins');
      
      expect(resolved.resolvedData.value).toBe('remote');
    });
  });

  describe('resolveConflict - field-merge', () => {
    it('should merge fields from both versions', () => {
      const conflict: ConflictInfo = {
        id: 'doc1',
        localVersion: { 
          field1: 'local1',
          field2: 'local2',
          updatedAt: Timestamp.fromMillis(2000)
        },
        remoteVersion: { 
          field1: 'remote1',
          field3: 'remote3',
          updatedAt: Timestamp.fromMillis(1000)
        },
        conflictType: 'update-update',
        timestamp: Date.now()
      };
      
      const resolved = resolver.resolveConflict(conflict, 'field-merge', {
        field1: 'local',
        field2: 'local',
        field3: 'remote'
      });
      
      expect(resolved.resolvedData.field1).toBe('local1');
      expect(resolved.resolvedData.field2).toBe('local2');
      expect(resolved.resolvedData.field3).toBe('remote3');
    });

    it('should merge arrays when configured', () => {
      const conflict: ConflictInfo = {
        id: 'doc1',
        localVersion: { tags: ['a', 'b', 'c'] },
        remoteVersion: { tags: ['b', 'c', 'd'] },
        conflictType: 'update-update',
        timestamp: Date.now()
      };
      
      const resolved = resolver.resolveConflict(conflict, 'field-merge', {
        tags: 'merge-arrays'
      });
      
      expect(resolved.resolvedData.tags).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('resolveConflict - direct strategies', () => {
    const conflict: ConflictInfo = {
      id: 'doc1',
      localVersion: { value: 'local' },
      remoteVersion: { value: 'remote' },
      conflictType: 'update-update',
      timestamp: Date.now()
    };

    it('should use local version with local-wins strategy', () => {
      const resolved = resolver.resolveConflict(conflict, 'local-wins');
      expect(resolved.resolvedData.value).toBe('local');
    });

    it('should use remote version with remote-wins strategy', () => {
      const resolved = resolver.resolveConflict(conflict, 'remote-wins');
      expect(resolved.resolvedData.value).toBe('remote');
    });

    it('should queue conflict for manual resolution', () => {
      const resolved = resolver.resolveConflict(conflict, 'manual');
      
      expect(resolved.resolvedData.value).toBe('local'); // Temporarily uses local
      expect(resolver.getConflictQueue()).toHaveLength(1);
      expect(resolver.getConflictQueue()[0].id).toBe('doc1');
    });
  });

  describe('conflict queue management', () => {
    it('should add conflicts to queue without duplicates', () => {
      const conflict: ConflictInfo = {
        id: 'doc1',
        localVersion: { value: 'local' },
        remoteVersion: { value: 'remote' },
        conflictType: 'update-update',
        timestamp: Date.now()
      };
      
      resolver.addToQueue(conflict);
      resolver.addToQueue(conflict);
      
      expect(resolver.getConflictQueue()).toHaveLength(1);
    });

    it('should remove conflict from queue', () => {
      const conflict1: ConflictInfo = {
        id: 'doc1',
        localVersion: { value: 'local' },
        remoteVersion: { value: 'remote' },
        conflictType: 'update-update',
        timestamp: Date.now()
      };
      
      const conflict2: ConflictInfo = {
        id: 'doc2',
        localVersion: { value: 'local' },
        remoteVersion: { value: 'remote' },
        conflictType: 'update-update',
        timestamp: Date.now()
      };
      
      resolver.addToQueue(conflict1);
      resolver.addToQueue(conflict2);
      
      resolver.removeFromQueue('doc1');
      
      const queue = resolver.getConflictQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe('doc2');
    });

    it('should clear all conflicts from queue', () => {
      const conflict: ConflictInfo = {
        id: 'doc1',
        localVersion: { value: 'local' },
        remoteVersion: { value: 'remote' },
        conflictType: 'update-update',
        timestamp: Date.now()
      };
      
      resolver.addToQueue(conflict);
      resolver.clearQueue();
      
      expect(resolver.getConflictQueue()).toHaveLength(0);
    });
  });

  describe('custom handlers', () => {
    it('should register and retrieve custom handlers', () => {
      const customHandler = (conflict: ConflictInfo) => ({
        id: conflict.id,
        resolvedData: { custom: 'resolved' },
        strategy: 'manual' as const,
        conflictInfo: conflict
      });
      
      resolver.registerHandler('customType', customHandler);
      
      const handler = resolver.getHandler('customType');
      expect(handler).toBe(customHandler);
    });

    it('should return undefined for non-existent handler', () => {
      const handler = resolver.getHandler('nonExistent');
      expect(handler).toBeUndefined();
    });
  });

  describe('resolution history', () => {
    it('should maintain resolution history', () => {
      const conflict: ConflictInfo = {
        id: 'doc1',
        localVersion: { value: 'local' },
        remoteVersion: { value: 'remote' },
        conflictType: 'update-update',
        timestamp: Date.now()
      };
      
      resolver.resolveConflict(conflict, 'local-wins');
      resolver.resolveConflict({ ...conflict, id: 'doc2' }, 'remote-wins');
      
      const history = resolver.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].id).toBe('doc2'); // Most recent first
      expect(history[1].id).toBe('doc1');
    });

    it('should clear resolution history', () => {
      const conflict: ConflictInfo = {
        id: 'doc1',
        localVersion: { value: 'local' },
        remoteVersion: { value: 'remote' },
        conflictType: 'update-update',
        timestamp: Date.now()
      };
      
      resolver.resolveConflict(conflict, 'local-wins');
      resolver.clearHistory();
      
      expect(resolver.getHistory()).toHaveLength(0);
    });
  });

  describe('threeWayMerge', () => {
    it('should merge when only local changed', () => {
      const base = { field1: 'original', field2: 'original' };
      const local = { field1: 'changed', field2: 'original' };
      const remote = { field1: 'original', field2: 'original' };
      
      const merged = resolver.threeWayMerge(base, local, remote);
      
      expect(merged.field1).toBe('changed');
      expect(merged.field2).toBe('original');
    });

    it('should merge when only remote changed', () => {
      const base = { field1: 'original', field2: 'original' };
      const local = { field1: 'original', field2: 'original' };
      const remote = { field1: 'changed', field2: 'original' };
      
      const merged = resolver.threeWayMerge(base, local, remote);
      
      expect(merged.field1).toBe('changed');
      expect(merged.field2).toBe('original');
    });

    it('should handle conflicts when both sides changed differently', () => {
      const base = { field1: 'original', field2: 'original' };
      const local = { 
        field1: 'local-change',
        field2: 'original',
        updatedAt: Timestamp.fromMillis(2000)
      };
      const remote = { 
        field1: 'remote-change',
        field2: 'original',
        updatedAt: Timestamp.fromMillis(1000)
      };
      
      const merged = resolver.threeWayMerge(base, local, remote);
      
      // Should use last-write-wins for conflicted field
      expect(merged.field1).toBe('local-change');
      expect(merged.field2).toBe('original');
    });

    it('should handle new fields added by either side', () => {
      const base = { field1: 'original' };
      const local = { field1: 'original', field2: 'local-new' };
      const remote = { field1: 'original', field3: 'remote-new' };
      
      const merged = resolver.threeWayMerge(base, local, remote);
      
      expect(merged.field1).toBe('original');
      expect(merged.field2).toBe('local-new');
      expect(merged.field3).toBe('remote-new');
    });
  });
});