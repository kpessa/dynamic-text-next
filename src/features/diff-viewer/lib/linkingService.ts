import { SharedIngredient } from '@/entities/shared-ingredient';
import { Ingredient } from '@/entities/ingredient/types';
import { PopulationType } from './comparisonService';

export interface LinkingCandidate {
  ingredient: SharedIngredient | Ingredient;
  population: PopulationType;
  score: number;
  matchType: 'exact' | 'partial' | 'fuzzy';
  matchedFields: string[];
}

export interface LinkingResult {
  sourceIngredient: SharedIngredient | Ingredient;
  linkedIngredients: Map<PopulationType, SharedIngredient | Ingredient>;
  conflicts: LinkingConflict[];
  confidence: number;
}

export interface LinkingConflict {
  field: string;
  populations: PopulationType[];
  values: Map<PopulationType, any>;
  resolution?: 'keep_all' | 'use_primary' | 'manual';
}

export interface LinkingOperation {
  id: string;
  type: 'link' | 'unlink' | 'bulk_link' | 'resolve_conflict';
  timestamp: Date;
  ingredientIds: string[];
  populations: PopulationType[];
  previousState?: LinkingResult;
  newState?: LinkingResult;
}

export interface LinkingStatus {
  linked: boolean;
  populations: PopulationType[];
  conflicts: number;
  lastModified: Date;
  confidence: number;
}

export interface BulkLinkingOptions {
  threshold?: number;
  autoResolveConflicts?: boolean;
  conflictResolution?: 'keep_all' | 'use_primary' | 'skip';
  populations?: PopulationType[];
}

/**
 * Service for managing shared ingredient linking across populations
 * Handles detection, linking, conflict resolution, and undo/redo operations
 */
export class LinkingService {
  private static instance: LinkingService;
  private linkingHistory: LinkingOperation[] = [];
  private currentHistoryIndex = -1;
  private readonly maxHistorySize = 50;
  private linkingMap: Map<string, LinkingResult> = new Map();

  private constructor() {}

  static getInstance(): LinkingService {
    if (!LinkingService.instance) {
      LinkingService.instance = new LinkingService();
    }
    return LinkingService.instance;
  }

  /**
   * Detect potential shared ingredients across populations
   */
  async detectSharedIngredients(
    ingredients: (SharedIngredient | Ingredient)[],
    populations: PopulationType[]
  ): Promise<Map<string, LinkingCandidate[]>> {
    const candidatesMap = new Map<string, LinkingCandidate[]>();

    for (const ingredient of ingredients) {
      const candidates = await this.findLinkingCandidates(ingredient, ingredients, populations);
      if (candidates.length > 0) {
        candidatesMap.set(ingredient.id, candidates);
      }
    }

    return candidatesMap;
  }

  /**
   * Find linking candidates for a specific ingredient
   */
  private async findLinkingCandidates(
    sourceIngredient: SharedIngredient | Ingredient,
    allIngredients: (SharedIngredient | Ingredient)[],
    populations: PopulationType[]
  ): Promise<LinkingCandidate[]> {
    const candidates: LinkingCandidate[] = [];

    for (const targetIngredient of allIngredients) {
      if (targetIngredient.id === sourceIngredient.id) continue;

      for (const population of populations) {
        const score = this.calculateSimilarityScore(sourceIngredient, targetIngredient);
        
        if (score > 0.5) { // Threshold for considering as candidate
          const matchType = this.determineMatchType(score);
          const matchedFields = this.getMatchedFields(sourceIngredient, targetIngredient);

          candidates.push({
            ingredient: targetIngredient,
            population,
            score,
            matchType,
            matchedFields
          });
        }
      }
    }

    // Sort by score descending
    return candidates.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate similarity score between two ingredients
   */
  private calculateSimilarityScore(
    ingredient1: SharedIngredient | Ingredient,
    ingredient2: SharedIngredient | Ingredient
  ): number {
    let score = 0;
    let weightSum = 0;

    // Name similarity (highest weight)
    const nameScore = this.stringSimilarity(
      ingredient1.name?.toLowerCase() || '',
      ingredient2.name?.toLowerCase() || ''
    );
    score += nameScore * 0.4;
    weightSum += 0.4;

    // Display name similarity
    if ('displayName' in ingredient1 && 'displayName' in ingredient2) {
      const displayScore = this.stringSimilarity(
        ingredient1.displayName?.toLowerCase() || '',
        ingredient2.displayName?.toLowerCase() || ''
      );
      score += displayScore * 0.3;
      weightSum += 0.3;
    }

    // Category match
    if ('category' in ingredient1 && 'category' in ingredient2) {
      if (ingredient1.category === ingredient2.category) {
        score += 0.15;
      }
      weightSum += 0.15;
    }

    // Unit match
    if ('unit' in ingredient1 && 'unit' in ingredient2) {
      if (ingredient1.unit === ingredient2.unit) {
        score += 0.1;
      }
      weightSum += 0.1;
    }

    // Reference ranges overlap
    if (ingredient1.referenceRanges && ingredient2.referenceRanges) {
      const overlap = this.calculateReferenceRangeOverlap(
        ingredient1.referenceRanges,
        ingredient2.referenceRanges
      );
      score += overlap * 0.05;
      weightSum += 0.05;
    }

    return weightSum > 0 ? score / weightSum : 0;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private stringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;

    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;

    const distance = this.levenshteinDistance(str1, str2);
    return 1 - (distance / maxLen);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate reference range overlap
   */
  private calculateReferenceRangeOverlap(ranges1: any[], ranges2: any[]): number {
    if (!ranges1.length || !ranges2.length) return 0;

    let overlapCount = 0;
    let totalComparisons = 0;

    for (const range1 of ranges1) {
      for (const range2 of ranges2) {
        if (range1.populationType === range2.populationType) {
          totalComparisons++;
          
          // Check if ranges overlap
          const min1 = range1.min || 0;
          const max1 = range1.max || Infinity;
          const min2 = range2.min || 0;
          const max2 = range2.max || Infinity;

          if (min1 <= max2 && min2 <= max1) {
            overlapCount++;
          }
        }
      }
    }

    return totalComparisons > 0 ? overlapCount / totalComparisons : 0;
  }

  /**
   * Determine match type based on score
   */
  private determineMatchType(score: number): 'exact' | 'partial' | 'fuzzy' {
    if (score >= 0.95) return 'exact';
    if (score >= 0.75) return 'partial';
    return 'fuzzy';
  }

  /**
   * Get matched fields between ingredients
   */
  private getMatchedFields(
    ingredient1: SharedIngredient | Ingredient,
    ingredient2: SharedIngredient | Ingredient
  ): string[] {
    const matchedFields: string[] = [];

    if (ingredient1.name === ingredient2.name) {
      matchedFields.push('name');
    }

    if ('displayName' in ingredient1 && 'displayName' in ingredient2) {
      if (ingredient1.displayName === ingredient2.displayName) {
        matchedFields.push('displayName');
      }
    }

    if ('category' in ingredient1 && 'category' in ingredient2) {
      if (ingredient1.category === ingredient2.category) {
        matchedFields.push('category');
      }
    }

    if ('unit' in ingredient1 && 'unit' in ingredient2) {
      if (ingredient1.unit === ingredient2.unit) {
        matchedFields.push('unit');
      }
    }

    return matchedFields;
  }

  /**
   * Link ingredients across populations
   */
  async linkIngredients(
    sourceIngredient: SharedIngredient | Ingredient,
    targetIngredients: Map<PopulationType, SharedIngredient | Ingredient>,
    autoResolveConflicts = false
  ): Promise<LinkingResult> {
    const conflicts = this.detectConflicts(sourceIngredient, targetIngredients);
    
    if (conflicts.length > 0 && !autoResolveConflicts) {
      // Create result with unresolved conflicts
      const result: LinkingResult = {
        sourceIngredient,
        linkedIngredients: targetIngredients,
        conflicts,
        confidence: this.calculateLinkingConfidence(sourceIngredient, targetIngredients)
      };
      
      // Store the result even with conflicts
      this.linkingMap.set(sourceIngredient.id, result);
      
      return result;
    }

    // Auto-resolve conflicts if requested
    if (conflicts.length > 0) {
      this.autoResolveConflicts(conflicts, 'use_primary');
    }

    const result: LinkingResult = {
      sourceIngredient,
      linkedIngredients: targetIngredients,
      conflicts: [],
      confidence: this.calculateLinkingConfidence(sourceIngredient, targetIngredients)
    };

    // Store linking result
    this.linkingMap.set(sourceIngredient.id, result);

    // Add to history
    this.addToHistory({
      id: `link-${Date.now()}`,
      type: 'link',
      timestamp: new Date(),
      ingredientIds: [sourceIngredient.id, ...Array.from(targetIngredients.values()).map(i => i.id)],
      populations: Array.from(targetIngredients.keys()),
      newState: result
    });

    return result;
  }

  /**
   * Unlink ingredients
   */
  async unlinkIngredients(
    ingredientId: string,
    populations?: PopulationType[]
  ): Promise<void> {
    const currentLinking = this.linkingMap.get(ingredientId);
    if (!currentLinking) return;

    if (populations) {
      // Unlink specific populations
      for (const population of populations) {
        currentLinking.linkedIngredients.delete(population);
      }
      
      if (currentLinking.linkedIngredients.size === 0) {
        this.linkingMap.delete(ingredientId);
      }
    } else {
      // Unlink all
      this.linkingMap.delete(ingredientId);
    }

    // Add to history
    this.addToHistory({
      id: `unlink-${Date.now()}`,
      type: 'unlink',
      timestamp: new Date(),
      ingredientIds: [ingredientId],
      populations: populations || Array.from(currentLinking.linkedIngredients.keys()),
      previousState: currentLinking,
      newState: this.linkingMap.get(ingredientId)
    });
  }

  /**
   * Bulk link ingredients
   */
  async bulkLinkIngredients(
    ingredients: (SharedIngredient | Ingredient)[],
    options: BulkLinkingOptions = {}
  ): Promise<Map<string, LinkingResult>> {
    const {
      threshold = 0.75,
      autoResolveConflicts = false,
      conflictResolution = 'skip',
      populations = ['neonatal', 'child', 'adolescent', 'adult'] as PopulationType[]
    } = options;

    const results = new Map<string, LinkingResult>();
    const candidates = await this.detectSharedIngredients(ingredients, populations);

    for (const [ingredientId, candidateList] of candidates) {
      const sourceIngredient = ingredients.find(i => i.id === ingredientId);
      if (!sourceIngredient) continue;

      // Group candidates by score threshold
      const validCandidates = candidateList.filter(c => c.score >= threshold);
      
      if (validCandidates.length > 0) {
        const targetIngredients = new Map<PopulationType, SharedIngredient | Ingredient>();
        
        for (const candidate of validCandidates) {
          if (!targetIngredients.has(candidate.population)) {
            targetIngredients.set(candidate.population, candidate.ingredient);
          }
        }

        const result = await this.linkIngredients(
          sourceIngredient,
          targetIngredients,
          autoResolveConflicts
        );

        // Handle conflicts based on resolution strategy
        if (result.conflicts.length > 0 && conflictResolution === 'skip') {
          continue;
        }

        results.set(ingredientId, result);
      }
    }

    // Add to history as bulk operation
    this.addToHistory({
      id: `bulk-link-${Date.now()}`,
      type: 'bulk_link',
      timestamp: new Date(),
      ingredientIds: Array.from(results.keys()),
      populations,
      newState: results.values().next().value
    });

    return results;
  }

  /**
   * Detect conflicts between linked ingredients
   */
  private detectConflicts(
    sourceIngredient: SharedIngredient | Ingredient,
    targetIngredients: Map<PopulationType, SharedIngredient | Ingredient>
  ): LinkingConflict[] {
    const conflicts: LinkingConflict[] = [];
    const fieldsToCheck = ['name', 'displayName', 'unit', 'category', 'concentration'];

    for (const field of fieldsToCheck) {
      const values = new Map<PopulationType, any>();
      let hasConflict = false;
      let baseValue: any = (sourceIngredient as any)[field];

      for (const [population, ingredient] of targetIngredients) {
        const value = (ingredient as any)[field];
        values.set(population, value);
        
        if (value !== undefined && baseValue !== undefined && value !== baseValue) {
          hasConflict = true;
        }
      }

      if (hasConflict) {
        conflicts.push({
          field,
          populations: Array.from(values.keys()),
          values
        });
      }
    }

    return conflicts;
  }

  /**
   * Auto-resolve conflicts
   */
  private autoResolveConflicts(
    conflicts: LinkingConflict[],
    strategy: 'keep_all' | 'use_primary'
  ): void {
    for (const conflict of conflicts) {
      conflict.resolution = strategy;
    }
  }

  /**
   * Manually resolve a conflict
   */
  resolveConflict(
    ingredientId: string,
    conflictField: string,
    resolution: 'keep_all' | 'use_primary' | 'manual',
    manualValue?: any
  ): LinkingResult | null {
    const linking = this.linkingMap.get(ingredientId);
    if (!linking) return null;

    const conflict = linking.conflicts.find(c => c.field === conflictField);
    if (!conflict) return linking;

    conflict.resolution = resolution;
    
    // Apply resolution
    if (resolution === 'manual' && manualValue !== undefined) {
      // Apply manual value to all linked ingredients
      for (const ingredient of linking.linkedIngredients.values()) {
        (ingredient as any)[conflictField] = manualValue;
      }
    }

    // Add to history
    this.addToHistory({
      id: `resolve-${Date.now()}`,
      type: 'resolve_conflict',
      timestamp: new Date(),
      ingredientIds: [ingredientId],
      populations: Array.from(linking.linkedIngredients.keys()),
      previousState: { ...linking },
      newState: linking
    });

    return linking;
  }

  /**
   * Calculate linking confidence
   */
  private calculateLinkingConfidence(
    sourceIngredient: SharedIngredient | Ingredient,
    targetIngredients: Map<PopulationType, SharedIngredient | Ingredient>
  ): number {
    let totalScore = 0;
    let count = 0;

    for (const targetIngredient of targetIngredients.values()) {
      totalScore += this.calculateSimilarityScore(sourceIngredient, targetIngredient);
      count++;
    }

    return count > 0 ? totalScore / count : 0;
  }

  /**
   * Get linking status for an ingredient
   */
  getLinkingStatus(ingredientId: string): LinkingStatus | null {
    const linking = this.linkingMap.get(ingredientId);
    if (!linking) return null;

    return {
      linked: true,
      populations: Array.from(linking.linkedIngredients.keys()),
      conflicts: linking.conflicts.length,
      lastModified: this.getLastModifiedDate(ingredientId),
      confidence: linking.confidence
    };
  }

  /**
   * Get last modified date for linking
   */
  private getLastModifiedDate(ingredientId: string): Date {
    const relevantOperations = this.linkingHistory.filter(
      op => op.ingredientIds.includes(ingredientId)
    );
    
    if (relevantOperations.length > 0) {
      return relevantOperations[relevantOperations.length - 1].timestamp;
    }
    
    return new Date();
  }

  /**
   * Add operation to history
   */
  private addToHistory(operation: LinkingOperation): void {
    // Remove any operations after current index (for redo functionality)
    if (this.currentHistoryIndex < this.linkingHistory.length - 1) {
      this.linkingHistory = this.linkingHistory.slice(0, this.currentHistoryIndex + 1);
    }

    // Add new operation
    this.linkingHistory.push(operation);
    this.currentHistoryIndex++;

    // Limit history size
    if (this.linkingHistory.length > this.maxHistorySize) {
      this.linkingHistory.shift();
      this.currentHistoryIndex--;
    }
  }

  /**
   * Undo last linking operation
   */
  undo(): boolean {
    if (!this.canUndo()) return false;

    const operation = this.linkingHistory[this.currentHistoryIndex];
    
    // Restore previous state
    if (operation.previousState) {
      if (operation.type === 'link' || operation.type === 'bulk_link') {
        this.linkingMap.set(operation.ingredientIds[0], operation.previousState);
      } else if (operation.type === 'unlink') {
        if (operation.previousState) {
          this.linkingMap.set(operation.ingredientIds[0], operation.previousState);
        }
      }
    } else {
      // Remove if no previous state
      this.linkingMap.delete(operation.ingredientIds[0]);
    }

    this.currentHistoryIndex--;
    return true;
  }

  /**
   * Redo linking operation
   */
  redo(): boolean {
    if (!this.canRedo()) return false;

    this.currentHistoryIndex++;
    const operation = this.linkingHistory[this.currentHistoryIndex];
    
    // Apply new state
    if (operation.newState) {
      if (operation.type === 'link' || operation.type === 'bulk_link') {
        this.linkingMap.set(operation.ingredientIds[0], operation.newState);
      } else if (operation.type === 'unlink') {
        if (operation.newState) {
          this.linkingMap.set(operation.ingredientIds[0], operation.newState);
        } else {
          this.linkingMap.delete(operation.ingredientIds[0]);
        }
      }
    }

    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentHistoryIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentHistoryIndex < this.linkingHistory.length - 1;
  }

  /**
   * Get history for debugging/UI
   */
  getHistory(): LinkingOperation[] {
    return [...this.linkingHistory];
  }

  /**
   * Clear all linking data
   */
  clearAll(): void {
    this.linkingMap.clear();
    this.linkingHistory = [];
    this.currentHistoryIndex = -1;
  }

  /**
   * Export linking data
   */
  exportLinkingData(): Record<string, any> {
    const data: Record<string, any> = {
      links: {},
      history: this.linkingHistory,
      timestamp: new Date().toISOString()
    };

    for (const [id, result] of this.linkingMap) {
      data.links[id] = {
        sourceIngredient: result.sourceIngredient.id,
        linkedIngredients: Array.from(result.linkedIngredients.entries()).map(
          ([pop, ing]) => ({ population: pop, ingredientId: ing.id })
        ),
        conflicts: result.conflicts,
        confidence: result.confidence
      };
    }

    return data;
  }

  /**
   * Import linking data
   */
  importLinkingData(data: Record<string, any>): void {
    this.clearAll();
    
    // Import would need actual ingredient instances
    // This is a simplified version
    if (data.history) {
      this.linkingHistory = data.history;
      this.currentHistoryIndex = this.linkingHistory.length - 1;
    }
  }
}

// Export singleton instance
export const linkingService = LinkingService.getInstance();