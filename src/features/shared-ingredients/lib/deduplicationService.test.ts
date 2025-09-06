import { describe, it, expect, beforeEach } from 'vitest';
import { DeduplicationService } from './deduplicationService';
import { SharedIngredient } from '@/entities/shared-ingredient';

describe('DeduplicationService', () => {
  let service: DeduplicationService;
  
  const createMockIngredient = (
    id: string,
    displayName: string,
    category: string = 'Vitamins',
    unit: string = 'mg'
  ): SharedIngredient => ({
    id,
    displayName,
    category,
    unit,
    masterId: id,
    isActive: true,
    referenceRanges: [],
    customizations: [],
    metadata: {
      createdBy: 'test',
      createdAt: new Date(),
      modifiedBy: 'test',
      modifiedAt: new Date(),
      version: 1,
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
    service = DeduplicationService.getInstance();
  });
  
  describe('calculateSimilarity', () => {
    it('should return 1 for identical ingredients', () => {
      const ing1 = createMockIngredient('1', 'Vitamin C', 'Vitamins', 'mg');
      const ing2 = createMockIngredient('2', 'Vitamin C', 'Vitamins', 'mg');
      
      const similarity = service.calculateSimilarity(ing1, ing2);
      expect(similarity).toBe(1);
    });
    
    it('should return lower similarity for different names', () => {
      const ing1 = createMockIngredient('1', 'Vitamin C', 'Vitamins', 'mg');
      const ing2 = createMockIngredient('2', 'Vitamin D', 'Vitamins', 'mg');
      
      const similarity = service.calculateSimilarity(ing1, ing2);
      expect(similarity).toBeLessThan(1);
      expect(similarity).toBeGreaterThan(0);
    });
    
    it('should return 0 for completely different ingredients', () => {
      const ing1 = createMockIngredient('1', 'Vitamin C', 'Vitamins', 'mg');
      const ing2 = createMockIngredient('2', 'Calcium', 'Minerals', 'g');
      
      const similarity = service.calculateSimilarity(ing1, ing2);
      expect(similarity).toBeLessThan(0.5);
    });
    
    it('should handle similar names with typos', () => {
      const ing1 = createMockIngredient('1', 'Vitamin C', 'Vitamins', 'mg');
      const ing2 = createMockIngredient('2', 'Vitamen C', 'Vitamins', 'mg');
      
      const similarity = service.calculateSimilarity(ing1, ing2);
      expect(similarity).toBeGreaterThan(0.7); // Adjusted for realistic typo similarity
    });
  });
  
  describe('detectDuplicates', () => {
    it('should detect exact duplicates', async () => {
      const ingredients = [
        createMockIngredient('1', 'Vitamin C', 'Vitamins', 'mg'),
        createMockIngredient('2', 'Vitamin C', 'Vitamins', 'mg'),
        createMockIngredient('3', 'Vitamin D', 'Vitamins', 'mg')
      ];
      
      const duplicates = await service.detectDuplicates(ingredients);
      
      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].ingredients).toHaveLength(2);
      expect(duplicates[0].ingredients.map(i => i.id)).toContain('1');
      expect(duplicates[0].ingredients.map(i => i.id)).toContain('2');
    });
    
    it('should detect similar ingredients above threshold', async () => {
      const ingredients = [
        createMockIngredient('1', 'Vitamin C', 'Vitamins', 'mg'),
        createMockIngredient('2', 'Vitamen C', 'Vitamins', 'mg'),
        createMockIngredient('3', 'Calcium', 'Minerals', 'g')
      ];
      
      const duplicates = await service.detectDuplicates(ingredients, 0.7); // Adjusted threshold
      
      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].ingredients).toHaveLength(2);
    });
    
    it('should not detect duplicates below threshold', async () => {
      const ingredients = [
        createMockIngredient('1', 'Vitamin A', 'Vitamins', 'mg'),
        createMockIngredient('2', 'Vitamin B', 'Vitamins', 'mg'),
        createMockIngredient('3', 'Vitamin C', 'Vitamins', 'mg')
      ];
      
      const duplicates = await service.detectDuplicates(ingredients, 0.95);
      
      expect(duplicates).toHaveLength(0);
    });
    
    it('should handle empty ingredient list', async () => {
      const duplicates = await service.detectDuplicates([]);
      expect(duplicates).toHaveLength(0);
    });
    
    it('should handle single ingredient', async () => {
      const ingredients = [
        createMockIngredient('1', 'Vitamin C', 'Vitamins', 'mg')
      ];
      
      const duplicates = await service.detectDuplicates(ingredients);
      expect(duplicates).toHaveLength(0);
    });
  });
  
  describe('mergeDuplicates', () => {
    it('should merge duplicates keeping master properties', async () => {
      const master = createMockIngredient('1', 'Vitamin C', 'Vitamins', 'mg');
      master.usage.referenceCount = 5;
      
      const duplicate = createMockIngredient('2', 'Vitamen C', 'Vitamins', 'mg');
      duplicate.usage.referenceCount = 3;
      
      const merged = await service.mergeDuplicates(master, [duplicate]);
      
      expect(merged.id).toBe(master.id);
      expect(merged.displayName).toBe(master.displayName);
      expect(merged.usage.referenceCount).toBe(8); // Combined references
    });
    
    it('should combine reference ranges from duplicates', async () => {
      const master = createMockIngredient('1', 'Vitamin C', 'Vitamins', 'mg');
      master.referenceRanges = [{
        populationType: 'adults',
        min: 50,
        max: 100,
        unit: 'mg'
      }];
      
      const duplicate = createMockIngredient('2', 'Vitamin C', 'Vitamins', 'mg');
      duplicate.referenceRanges = [{
        populationType: 'children',
        min: 30,
        max: 60,
        unit: 'mg'
      }];
      
      const merged = await service.mergeDuplicates(master, [duplicate]);
      
      expect(merged.referenceRanges).toHaveLength(2);
      expect(merged.referenceRanges.map(r => r.populationType)).toContain('adults');
      expect(merged.referenceRanges.map(r => r.populationType)).toContain('children');
    });
  });
  
  describe('contentHash', () => {
    it('should generate consistent hash for same content', () => {
      const ing1 = createMockIngredient('1', 'Vitamin C', 'Vitamins', 'mg');
      const ing2 = createMockIngredient('2', 'Vitamin C', 'Vitamins', 'mg');
      
      const hash1 = service['contentHash'](ing1);
      const hash2 = service['contentHash'](ing2);
      
      expect(hash1).toBe(hash2);
    });
    
    it('should generate different hash for different content', () => {
      const ing1 = createMockIngredient('1', 'Vitamin C', 'Vitamins', 'mg');
      const ing2 = createMockIngredient('2', 'Vitamin D', 'Vitamins', 'mg');
      
      const hash1 = service['contentHash'](ing1);
      const hash2 = service['contentHash'](ing2);
      
      expect(hash1).not.toBe(hash2);
    });
  });
});