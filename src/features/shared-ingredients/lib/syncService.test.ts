import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SyncService } from './syncService';
import { SharedIngredient } from '@/entities/shared-ingredient';
import * as firestore from 'firebase/firestore';

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => new Date())
}));

vi.mock('@/shared/lib/firebase/config', () => ({
  db: {}
}));

describe('SyncService', () => {
  let service: SyncService;
  
  const createMockIngredient = (
    id: string,
    displayName: string,
    version: number = 1
  ): SharedIngredient => ({
    id,
    displayName,
    category: 'Vitamins',
    unit: 'mg',
    masterId: id,
    isActive: true,
    referenceRanges: [],
    customizations: [],
    metadata: {
      createdBy: 'test',
      createdAt: new Date('2024-01-01'),
      modifiedBy: 'test',
      modifiedAt: new Date('2024-01-01'),
      version,
      isPublic: false
    },
    usage: {
      referenceCount: 0,
      lastUsed: new Date(),
      references: []
    },
    permissions: {
      view: [],
      edit: [],
      admin: [],
      inherit: true,
      scope: 'organization',
      allowCustomization: true,
      requireApproval: false
    }
  });
  
  beforeEach(() => {
    service = SyncService.getInstance();
    vi.clearAllMocks();
  });
  
  describe('detectConflict', () => {
    it('should detect no conflict when versions match', async () => {
      const local = createMockIngredient('1', 'Vitamin C', 1);
      const server = createMockIngredient('1', 'Vitamin C', 1);
      
      vi.mocked(firestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => server
      } as any);
      
      const hasConflict = await service.detectConflict('1', local);
      expect(hasConflict).toBe(false);
    });
    
    it('should detect conflict when server has newer version', async () => {
      const local = createMockIngredient('1', 'Vitamin C', 1);
      const server = createMockIngredient('1', 'Vitamin C Updated', 2);
      server.metadata.modifiedAt = new Date('2024-01-02');
      
      vi.mocked(firestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => server
      } as any);
      
      const hasConflict = await service.detectConflict('1', local);
      expect(hasConflict).toBe(true);
    });
    
    it('should detect conflict when local changes differ from server', async () => {
      const local = createMockIngredient('1', 'Vitamin C Local', 1);
      local.metadata.modifiedAt = new Date('2024-01-02');
      
      const server = createMockIngredient('1', 'Vitamin C Server', 1);
      server.metadata.modifiedAt = new Date('2024-01-02');
      
      vi.mocked(firestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => server
      } as any);
      
      const hasConflict = await service.detectConflict('1', local);
      expect(hasConflict).toBe(true);
    });
    
    it('should handle non-existent server document', async () => {
      const local = createMockIngredient('1', 'Vitamin C', 1);
      
      vi.mocked(firestore.getDoc).mockResolvedValue({
        exists: () => false
      } as any);
      
      const hasConflict = await service.detectConflict('1', local);
      expect(hasConflict).toBe(false);
    });
  });
  
  describe('syncSharedIngredient', () => {
    it('should sync changes when no conflict exists', async () => {
      const ingredient = createMockIngredient('1', 'Vitamin C', 1);
      const changes = { displayName: 'Vitamin C Updated' };
      
      vi.mocked(firestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ingredient
      } as any);
      
      await service.syncSharedIngredient('1', changes);
      
      expect(firestore.updateDoc).toHaveBeenCalled();
    });
    
    it('should throw error when conflict exists', async () => {
      const local = createMockIngredient('1', 'Vitamin C', 1);
      const server = createMockIngredient('1', 'Vitamin C Server', 2);
      
      vi.mocked(firestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => server
      } as any);
      
      await expect(
        service.syncSharedIngredient('1', { ...local })
      ).rejects.toThrow('Sync conflict detected');
    });
    
    it('should update lastSyncTime on successful sync', async () => {
      const ingredient = createMockIngredient('1', 'Vitamin C', 1);
      
      vi.mocked(firestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ingredient
      } as any);
      
      await service.syncSharedIngredient('1', { displayName: 'Updated' });
      
      const lastSync = service.getLastSyncTime('1');
      expect(lastSync).toBeInstanceOf(Date);
    });
  });
  
  describe('syncBatch', () => {
    it('should sync multiple ingredients', async () => {
      const ingredients = [
        createMockIngredient('1', 'Vitamin C', 1),
        createMockIngredient('2', 'Vitamin D', 1)
      ];
      
      vi.mocked(firestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ingredients[0]
      } as any);
      
      const results = await service.syncBatch(ingredients);
      
      expect(results.successful).toHaveLength(2);
      expect(results.conflicts).toHaveLength(0);
      expect(results.failed).toHaveLength(0);
    });
    
    it('should handle conflicts in batch sync', async () => {
      const local1 = createMockIngredient('1', 'Vitamin C', 1);
      const local2 = createMockIngredient('2', 'Vitamin D', 1);
      const server2 = createMockIngredient('2', 'Vitamin D Server', 2);
      
      vi.mocked(firestore.getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => local1
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => server2
        } as any);
      
      const results = await service.syncBatch([local1, local2]);
      
      expect(results.successful).toHaveLength(1);
      expect(results.conflicts).toHaveLength(1);
      expect(results.conflicts[0].ingredientId).toBe('2');
    });
    
    it('should handle errors in batch sync', async () => {
      const ingredients = [
        createMockIngredient('1', 'Vitamin C', 1)
      ];
      
      vi.mocked(firestore.getDoc).mockRejectedValue(new Error('Network error'));
      
      const results = await service.syncBatch(ingredients);
      
      expect(results.successful).toHaveLength(0);
      expect(results.failed).toHaveLength(1);
      expect(results.failed[0].error).toBe('Network error');
    });
  });
  
  describe('getLastSyncTime', () => {
    it('should return null for unsynced ingredient', () => {
      const lastSync = service.getLastSyncTime('new-id');
      expect(lastSync).toBeNull();
    });
    
    it('should return last sync time after sync', async () => {
      const ingredient = createMockIngredient('1', 'Vitamin C', 1);
      
      vi.mocked(firestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ingredient
      } as any);
      
      await service.syncSharedIngredient('1', {});
      
      const lastSync = service.getLastSyncTime('1');
      expect(lastSync).toBeInstanceOf(Date);
    });
  });
});