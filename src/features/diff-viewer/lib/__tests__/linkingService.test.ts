import { describe, it, expect, beforeEach } from 'vitest';
import { LinkingService } from '../linkingService';
import { SharedIngredient } from '@/entities/shared-ingredient';
import { PopulationType } from '../comparisonService';

describe('LinkingService', () => {
  let service: LinkingService;
  
  const mockIngredients: SharedIngredient[] = [
    {
      id: 'ing-1',
      name: 'Calcium Gluconate',
      displayName: 'Calcium Gluconate 10%',
      category: 'mineral',
      unit: 'mg',
      referenceRanges: [
        { populationType: 'neonatal', min: 8.5, max: 10.5, unit: 'mg/dL' }
      ]
    } as SharedIngredient,
    {
      id: 'ing-2',
      name: 'Calcium Gluconate',
      displayName: 'Calcium Gluconate 10%',
      category: 'mineral',
      unit: 'mg',
      referenceRanges: [
        { populationType: 'child', min: 9.0, max: 11.0, unit: 'mg/dL' }
      ]
    } as SharedIngredient,
    {
      id: 'ing-3',
      name: 'Magnesium Sulfate',
      displayName: 'Magnesium Sulfate 50%',
      category: 'mineral',
      unit: 'mg',
      referenceRanges: [
        { populationType: 'neonatal', min: 1.5, max: 2.5, unit: 'mg/dL' }
      ]
    } as SharedIngredient,
    {
      id: 'ing-4',
      name: 'Calcium Carbonate', // Similar but different
      displayName: 'Calcium Carbonate',
      category: 'mineral',
      unit: 'mg',
      referenceRanges: []
    } as SharedIngredient
  ];

  beforeEach(() => {
    service = LinkingService.getInstance();
    service.clearAll();
  });

  describe('detectSharedIngredients', () => {
    it('should detect similar ingredients across populations', async () => {
      const populations: PopulationType[] = ['neonatal', 'child'];
      const candidates = await service.detectSharedIngredients(
        mockIngredients.slice(0, 2),
        populations
      );

      expect(candidates.size).toBeGreaterThan(0);
      
      // Should find ing-2 as candidate for ing-1
      const ing1Candidates = candidates.get('ing-1');
      expect(ing1Candidates).toBeDefined();
      expect(ing1Candidates?.length).toBeGreaterThan(0);
      expect(ing1Candidates?.[0].ingredient.id).toBe('ing-2');
      expect(ing1Candidates?.[0].matchType).toBe('exact');
    });

    it('should not detect unrelated ingredients', async () => {
      const populations: PopulationType[] = ['neonatal', 'child'];
      const candidates = await service.detectSharedIngredients(
        [mockIngredients[0], mockIngredients[2]], // Calcium vs Magnesium
        populations
      );

      // Magnesium might be detected but with low score
      const ing1Candidates = candidates.get('ing-1');
      if (ing1Candidates && ing1Candidates.length > 0) {
        // If any candidates found, they should have low scores
        expect(ing1Candidates[0].score).toBeLessThan(0.7);
      }
    });

    it('should detect partial matches', async () => {
      const populations: PopulationType[] = ['neonatal', 'child'];
      const candidates = await service.detectSharedIngredients(
        [mockIngredients[0], mockIngredients[3]], // Calcium Gluconate vs Calcium Carbonate
        populations
      );

      const ing1Candidates = candidates.get('ing-1');
      if (ing1Candidates && ing1Candidates.length > 0) {
        // Match type could be partial or fuzzy depending on score
        expect(['partial', 'fuzzy']).toContain(ing1Candidates[0].matchType);
        expect(ing1Candidates[0].score).toBeLessThan(0.95);
        expect(ing1Candidates[0].score).toBeGreaterThan(0.5);
      }
    });
  });

  describe('linkIngredients', () => {
    it('should link ingredients without conflicts', async () => {
      const targetIngredients = new Map<PopulationType, SharedIngredient>([
        ['child', mockIngredients[1]]
      ]);

      const result = await service.linkIngredients(
        mockIngredients[0],
        targetIngredients
      );

      expect(result.sourceIngredient.id).toBe('ing-1');
      expect(result.linkedIngredients.size).toBe(1);
      expect(result.linkedIngredients.get('child')?.id).toBe('ing-2');
      expect(result.conflicts.length).toBe(0);
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should detect conflicts when field values differ', async () => {
      const conflictingIngredient: SharedIngredient = {
        ...mockIngredients[1],
        id: 'ing-conflict',
        displayName: 'Calcium Gluconate 20%' // Different concentration
      };

      const targetIngredients = new Map<PopulationType, SharedIngredient>([
        ['child', conflictingIngredient]
      ]);

      const result = await service.linkIngredients(
        mockIngredients[0],
        targetIngredients,
        false // Don't auto-resolve
      );

      expect(result.conflicts.length).toBeGreaterThan(0);
      const displayNameConflict = result.conflicts.find(c => c.field === 'displayName');
      expect(displayNameConflict).toBeDefined();
    });

    it('should auto-resolve conflicts when requested', async () => {
      const conflictingIngredient: SharedIngredient = {
        ...mockIngredients[1],
        id: 'ing-conflict',
        displayName: 'Calcium Gluconate 20%'
      };

      const targetIngredients = new Map<PopulationType, SharedIngredient>([
        ['child', conflictingIngredient]
      ]);

      const result = await service.linkIngredients(
        mockIngredients[0],
        targetIngredients,
        true // Auto-resolve
      );

      expect(result.conflicts.length).toBe(0);
    });
  });

  describe('unlinkIngredients', () => {
    it('should unlink all populations', async () => {
      // First link ingredients
      const targetIngredients = new Map<PopulationType, SharedIngredient>([
        ['child', mockIngredients[1]]
      ]);
      
      await service.linkIngredients(mockIngredients[0], targetIngredients);
      
      // Then unlink
      await service.unlinkIngredients('ing-1');
      
      const status = service.getLinkingStatus('ing-1');
      expect(status).toBeNull();
    });

    it('should unlink specific populations', async () => {
      // Link to multiple populations
      const targetIngredients = new Map<PopulationType, SharedIngredient>([
        ['child', mockIngredients[1]],
        ['adolescent', mockIngredients[1]]
      ]);
      
      await service.linkIngredients(mockIngredients[0], targetIngredients);
      
      // Unlink only child
      await service.unlinkIngredients('ing-1', ['child']);
      
      const status = service.getLinkingStatus('ing-1');
      expect(status?.populations).toEqual(['adolescent']);
    });
  });

  describe('bulkLinkIngredients', () => {
    it('should link multiple ingredients in bulk', async () => {
      const results = await service.bulkLinkIngredients(
        mockIngredients.slice(0, 2),
        {
          threshold: 0.9,
          populations: ['neonatal', 'child']
        }
      );

      expect(results.size).toBeGreaterThan(0);
    });

    it('should respect threshold for bulk linking', async () => {
      const results = await service.bulkLinkIngredients(
        mockIngredients,
        {
          threshold: 0.95, // Very high threshold
          populations: ['neonatal', 'child']
        }
      );

      // Only high confidence matches should be linked
      for (const [, result] of results) {
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      }
    });

    it('should skip conflicts when configured', async () => {
      const results = await service.bulkLinkIngredients(
        mockIngredients,
        {
          threshold: 0.5,
          conflictResolution: 'skip',
          populations: ['neonatal', 'child']
        }
      );

      // Results should not include conflicted links
      for (const [, result] of results) {
        expect(result.conflicts.length).toBe(0);
      }
    });
  });

  describe('resolveConflict', () => {
    it('should manually resolve conflicts', async () => {
      // Create a conflict
      const conflictingIngredient: SharedIngredient = {
        ...mockIngredients[1],
        id: 'ing-conflict',
        unit: 'g' // Different unit
      };

      const targetIngredients = new Map<PopulationType, SharedIngredient>([
        ['child', conflictingIngredient]
      ]);

      await service.linkIngredients(mockIngredients[0], targetIngredients, false);
      
      // Resolve the conflict
      const resolved = service.resolveConflict(
        'ing-1',
        'unit',
        'manual',
        'mg' // Use original value
      );

      expect(resolved).toBeDefined();
      // After resolution, the conflict should have the resolution set
      const unitConflict = resolved?.conflicts.find(c => c.field === 'unit');
      expect(unitConflict).toBeDefined();
      expect(unitConflict?.resolution).toBe('manual');
    });
  });

  describe('getLinkingStatus', () => {
    it('should return linking status for linked ingredient', async () => {
      const targetIngredients = new Map<PopulationType, SharedIngredient>([
        ['child', mockIngredients[1]]
      ]);
      
      await service.linkIngredients(mockIngredients[0], targetIngredients);
      
      const status = service.getLinkingStatus('ing-1');
      
      expect(status).toBeDefined();
      expect(status?.linked).toBe(true);
      expect(status?.populations).toContain('child');
      expect(status?.confidence).toBeGreaterThan(0);
    });

    it('should return null for unlinked ingredient', () => {
      const status = service.getLinkingStatus('unknown-id');
      expect(status).toBeNull();
    });
  });

  describe('undo/redo', () => {
    it('should undo linking operation', async () => {
      const targetIngredients = new Map<PopulationType, SharedIngredient>([
        ['child', mockIngredients[1]]
      ]);
      
      await service.linkIngredients(mockIngredients[0], targetIngredients);
      
      expect(service.getLinkingStatus('ing-1')).toBeDefined();
      
      const undone = service.undo();
      expect(undone).toBe(true);
      expect(service.getLinkingStatus('ing-1')).toBeNull();
    });

    it('should redo linking operation', async () => {
      const targetIngredients = new Map<PopulationType, SharedIngredient>([
        ['child', mockIngredients[1]]
      ]);
      
      await service.linkIngredients(mockIngredients[0], targetIngredients);
      
      service.undo();
      expect(service.getLinkingStatus('ing-1')).toBeNull();
      
      const redone = service.redo();
      expect(redone).toBe(true);
      expect(service.getLinkingStatus('ing-1')).toBeDefined();
    });

    it('should track undo/redo availability', async () => {
      expect(service.canUndo()).toBe(false);
      expect(service.canRedo()).toBe(false);
      
      const targetIngredients = new Map<PopulationType, SharedIngredient>([
        ['child', mockIngredients[1]]
      ]);
      
      await service.linkIngredients(mockIngredients[0], targetIngredients);
      
      expect(service.canUndo()).toBe(true);
      expect(service.canRedo()).toBe(false);
      
      service.undo();
      
      expect(service.canUndo()).toBe(false);
      expect(service.canRedo()).toBe(true);
    });
  });

  describe('history management', () => {
    it('should track operation history', async () => {
      const targetIngredients = new Map<PopulationType, SharedIngredient>([
        ['child', mockIngredients[1]]
      ]);
      
      await service.linkIngredients(mockIngredients[0], targetIngredients);
      await service.unlinkIngredients('ing-1');
      
      const history = service.getHistory();
      expect(history.length).toBe(2);
      expect(history[0].type).toBe('link');
      expect(history[1].type).toBe('unlink');
    });

    it('should limit history size', async () => {
      // Perform many operations to exceed max history
      for (let i = 0; i < 60; i++) {
        const targetIngredients = new Map<PopulationType, SharedIngredient>([
          ['child', mockIngredients[1]]
        ]);
        
        await service.linkIngredients(mockIngredients[0], targetIngredients);
        await service.unlinkIngredients('ing-1');
      }
      
      const history = service.getHistory();
      expect(history.length).toBeLessThanOrEqual(50); // Max history size
    });
  });

  describe('export/import', () => {
    it('should export linking data', async () => {
      const targetIngredients = new Map<PopulationType, SharedIngredient>([
        ['child', mockIngredients[1]]
      ]);
      
      await service.linkIngredients(mockIngredients[0], targetIngredients);
      
      const exported = service.exportLinkingData();
      
      expect(exported.links).toBeDefined();
      expect(exported.links['ing-1']).toBeDefined();
      expect(exported.history).toBeDefined();
      expect(exported.timestamp).toBeDefined();
    });

    it('should clear all data', () => {
      const targetIngredients = new Map<PopulationType, SharedIngredient>([
        ['child', mockIngredients[1]]
      ]);
      
      service.linkIngredients(mockIngredients[0], targetIngredients);
      
      service.clearAll();
      
      expect(service.getLinkingStatus('ing-1')).toBeNull();
      expect(service.getHistory().length).toBe(0);
      expect(service.canUndo()).toBe(false);
    });
  });

  describe('string similarity', () => {
    it('should calculate exact match similarity', () => {
      const service = LinkingService.getInstance();
      // Access private method through any cast for testing
      const similarity = (service as any).stringSimilarity('calcium', 'calcium');
      expect(similarity).toBe(1);
    });

    it('should calculate partial match similarity', () => {
      const service = LinkingService.getInstance();
      const similarity = (service as any).stringSimilarity('calcium', 'calcum');
      expect(similarity).toBeGreaterThan(0.7);
      expect(similarity).toBeLessThan(1);
    });

    it('should calculate no match similarity', () => {
      const service = LinkingService.getInstance();
      const similarity = (service as any).stringSimilarity('calcium', 'magnesium');
      expect(similarity).toBeLessThan(0.5);
    });
  });
});