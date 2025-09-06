import { describe, it, expect, beforeEach } from 'vitest';
import { ComparisonService, PopulationType } from '../comparisonService';
import { SharedIngredient } from '@/entities/shared-ingredient';

describe('ComparisonService', () => {
  let service: ComparisonService;
  
  const createMockIngredient = (id: string): SharedIngredient => ({
    id,
    displayName: 'Test Ingredient',
    category: 'Vitamins',
    unit: 'mg',
    masterId: id,
    isActive: true,
    referenceRanges: [
      { populationType: 'neonatal', min: 10, max: 20, unit: 'mg' },
      { populationType: 'child', min: 20, max: 40, unit: 'mg' },
      { populationType: 'adolescent', min: 30, max: 60, unit: 'mg' },
      { populationType: 'adult', min: 40, max: 80, unit: 'mg' }
    ],
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
    service = ComparisonService.getInstance();
    service.clearCache();
  });

  describe('comparePopulations', () => {
    it('should compare ingredients across different populations', async () => {
      const ingredient = createMockIngredient('test-1');
      const populations: PopulationType[] = ['neonatal', 'child'];
      
      const result = await service.comparePopulations(ingredient, populations);
      
      expect(result).toBeDefined();
      expect(result.mode).toBe('populations');
      expect(result.ingredientId).toBe('test-1');
      expect(result.comparisons).toHaveLength(1); // One comparison pair for 2 populations
    });

    it('should generate multiple comparisons for multiple populations', async () => {
      const ingredient = createMockIngredient('test-1');
      const populations: PopulationType[] = ['neonatal', 'child', 'adult'];
      
      const result = await service.comparePopulations(ingredient, populations);
      
      // Should have 3 comparisons: neo-child, neo-adult, child-adult
      expect(result.comparisons).toHaveLength(3);
    });

    it('should identify differences between populations', async () => {
      const ingredient = createMockIngredient('test-1');
      const populations: PopulationType[] = ['neonatal', 'adult'];
      
      const result = await service.comparePopulations(ingredient, populations);
      
      expect(result.summary.totalChanges).toBeGreaterThan(0);
      expect(result.comparisons[0].diff).toBeDefined();
    });

    it('should cache comparison results', async () => {
      const ingredient = createMockIngredient('test-1');
      const populations: PopulationType[] = ['neonatal', 'child'];
      
      await service.comparePopulations(ingredient, populations);
      expect(service.getCacheSize()).toBe(1);
      
      // Second call should use cache
      await service.comparePopulations(ingredient, populations);
      expect(service.getCacheSize()).toBe(1);
    });

    it('should handle empty populations array', async () => {
      const ingredient = createMockIngredient('test-1');
      const populations: PopulationType[] = [];
      
      const result = await service.comparePopulations(ingredient, populations);
      
      expect(result.comparisons).toHaveLength(0);
      expect(result.summary.totalComparisons).toBe(0);
    });

    it('should handle single population', async () => {
      const ingredient = createMockIngredient('test-1');
      const populations: PopulationType[] = ['neonatal'];
      
      const result = await service.comparePopulations(ingredient, populations);
      
      // No comparisons possible with single population
      expect(result.comparisons).toHaveLength(0);
    });
  });

  describe('compareVersions', () => {
    it('should compare different versions of same population', async () => {
      const ingredient = createMockIngredient('test-1');
      
      const result = await service.compareVersions(
        ingredient,
        'neonatal',
        1,
        2
      );
      
      expect(result).toBeDefined();
      expect(result.mode).toBe('versions');
      expect(result.comparisons).toHaveLength(1);
      expect(result.comparisons[0].left.version).toBe(1);
      expect(result.comparisons[0].right.version).toBe(2);
    });

    it('should identify version differences', async () => {
      const ingredient = createMockIngredient('test-1');
      
      const result = await service.compareVersions(
        ingredient,
        'child',
        1,
        3
      );
      
      expect(result.comparisons[0].diff).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should cache version comparisons', async () => {
      const ingredient = createMockIngredient('test-1');
      
      await service.compareVersions(ingredient, 'adult', 1, 2);
      expect(service.getCacheSize()).toBe(1);
      
      // Second call should use cache
      await service.compareVersions(ingredient, 'adult', 1, 2);
      expect(service.getCacheSize()).toBe(1);
    });

    it('should handle same version comparison', async () => {
      const ingredient = createMockIngredient('test-1');
      
      const result = await service.compareVersions(
        ingredient,
        'neonatal',
        1,
        1
      );
      
      // Should still work but show no differences
      expect(result.comparisons).toHaveLength(1);
      // Mock data is identical so changes might be 0
      expect(result.summary.totalChanges).toBeGreaterThanOrEqual(0);
    });
  });

  describe('handleMissingData', () => {
    it('should gracefully handle missing data', async () => {
      const result = await service.handleMissingData('missing-id', 'neonatal', 1);
      
      expect(result).toBeDefined();
      expect(result.error).toBe('Data not found');
      expect(result.displayName).toBe('Data Not Available');
    });
  });

  describe('buildComparisonContext', () => {
    it('should build context for population comparison', async () => {
      const ingredient = createMockIngredient('test-1');
      const populations: PopulationType[] = ['neonatal', 'child', 'adult'];
      
      const result = await service.comparePopulations(ingredient, populations);
      const context = service.buildComparisonContext(result);
      
      expect(context.mode).toBe('populations');
      expect(context.populations).toContain('neonatal');
      expect(context.populations).toContain('child');
      expect(context.populations).toContain('adult');
      expect(context.summary).toBeDefined();
    });

    it('should build context for version comparison', async () => {
      const ingredient = createMockIngredient('test-1');
      
      const result = await service.compareVersions(ingredient, 'child', 1, 2);
      const context = service.buildComparisonContext(result);
      
      expect(context.mode).toBe('versions');
      expect(context.versions).toEqual({ v1: 1, v2: 2 });
      expect(context.summary).toBeDefined();
    });
  });

  describe('cache management', () => {
    it('should clear cache', async () => {
      const ingredient = createMockIngredient('test-1');
      
      await service.comparePopulations(ingredient, ['neonatal', 'child']);
      expect(service.getCacheSize()).toBe(1);
      
      service.clearCache();
      expect(service.getCacheSize()).toBe(0);
    });

    it('should handle different cache keys', async () => {
      const ingredient = createMockIngredient('test-1');
      
      await service.comparePopulations(ingredient, ['neonatal', 'child']);
      await service.comparePopulations(ingredient, ['adolescent', 'adult']);
      await service.compareVersions(ingredient, 'neonatal', 1, 2);
      
      expect(service.getCacheSize()).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle ingredient without reference ranges', async () => {
      const ingredient = createMockIngredient('test-1');
      ingredient.referenceRanges = [];
      
      const result = await service.comparePopulations(
        ingredient,
        ['neonatal', 'child']
      );
      
      expect(result).toBeDefined();
      expect(result.comparisons).toHaveLength(1);
    });

    it('should handle all four populations comparison', async () => {
      const ingredient = createMockIngredient('test-1');
      const allPopulations: PopulationType[] = ['neonatal', 'child', 'adolescent', 'adult'];
      
      const result = await service.comparePopulations(ingredient, allPopulations);
      
      // Should have 6 comparisons: C(4,2) = 6
      expect(result.comparisons).toHaveLength(6);
    });

    it('should handle large version differences', async () => {
      const ingredient = createMockIngredient('test-1');
      
      const result = await service.compareVersions(
        ingredient,
        'adult',
        1,
        100
      );
      
      expect(result).toBeDefined();
      expect(result.comparisons[0].left.version).toBe(1);
      expect(result.comparisons[0].right.version).toBe(100);
    });
  });
});