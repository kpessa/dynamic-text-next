import { 
  SharedIngredient, 
  DuplicateGroup, 
  MergeSuggestion 
} from '@/entities/shared-ingredient';
import { Ingredient } from '@/entities/ingredient/types';

export interface DeduplicationReport {
  totalIngredients: number;
  duplicateGroups: DuplicateGroup[];
  totalDuplicates: number;
  potentialSavings: number; // Number of ingredients that could be removed
  generatedAt: Date;
}

export interface SimilarityWeights {
  name: number;
  category: number;
  unit: number;
  referenceRanges: number;
  contentHash: number;
}

export class DeduplicationService {
  private static instance: DeduplicationService;
  private readonly defaultWeights: SimilarityWeights = {
    name: 0.4,
    category: 0.2,
    unit: 0.2,
    referenceRanges: 0.15,
    contentHash: 0.05
  };

  private constructor() {}

  static getInstance(): DeduplicationService {
    if (!DeduplicationService.instance) {
      DeduplicationService.instance = new DeduplicationService();
    }
    return DeduplicationService.instance;
  }

  async detectDuplicates(
    ingredients: SharedIngredient[],
    threshold: number = 0.8
  ): Promise<DuplicateGroup[]> {
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < ingredients.length; i++) {
      if (processed.has(ingredients[i].id)) continue;

      const duplicates = this.findSimilar(
        ingredients[i], 
        ingredients.slice(i + 1).filter(ing => !processed.has(ing.id)),
        threshold
      );

      if (duplicates.length > 0) {
        const group: DuplicateGroup = {
          groupId: `group-${Date.now()}-${i}`,
          ingredients: [ingredients[i], ...duplicates],
          similarity: this.calculateAverageSimilarity(ingredients[i], duplicates),
          mergeSuggestion: this.generateMergeSuggestion(ingredients[i], duplicates)
        };
        
        groups.push(group);
        duplicates.forEach(d => processed.add(d.id));
      }

      processed.add(ingredients[i].id);
    }

    return groups;
  }

  private findSimilar(
    target: SharedIngredient,
    candidates: SharedIngredient[],
    threshold: number
  ): SharedIngredient[] {
    return candidates.filter(candidate => {
      const similarity = this.calculateSimilarity(target, candidate);
      return similarity >= threshold;
    });
  }

  calculateSimilarity(
    ing1: SharedIngredient,
    ing2: SharedIngredient,
    weights: SimilarityWeights = this.defaultWeights
  ): number {
    // Name similarity
    const nameSimil = this.stringSimilarity(ing1.displayName, ing2.displayName);
    
    // Category match
    const categorySim = ing1.category === ing2.category ? 1 : 0;
    
    // Unit match
    const unitSim = ing1.unit === ing2.unit ? 1 : 0;
    
    // If name, category and unit all match exactly, return 1
    if (nameSimil === 1 && categorySim === 1 && unitSim === 1) {
      return 1;
    }
    
    // Reference ranges similarity
    const rangeSimil = this.compareReferenceRanges(
      ing1.referenceRanges,
      ing2.referenceRanges
    );
    
    // Content hash match
    const hash1 = this.contentHash(ing1);
    const hash2 = this.contentHash(ing2);
    const hashSim = hash1 === hash2 ? 1 : 0;
    
    // Weighted average
    return (
      nameSimil * weights.name +
      categorySim * weights.category +
      unitSim * weights.unit +
      rangeSimil * weights.referenceRanges +
      hashSim * weights.contentHash
    );
  }

  private stringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;
    
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    if (s1 === s2) return 1;
    
    // Levenshtein distance
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    return 1 - (distance / maxLength);
  }
  
  private fuzzyMatch(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1;

    // Levenshtein distance
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    return 1 - (distance / maxLength);
  }

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

  private compareReferenceRanges(ranges1: any[], ranges2: any[]): number {
    if (!ranges1?.length || !ranges2?.length) return 0;

    let matchCount = 0;
    const totalComparisons = Math.max(ranges1.length, ranges2.length);

    for (const range1 of ranges1) {
      for (const range2 of ranges2) {
        if (
          range1.populationType === range2.populationType &&
          range1.unit === range2.unit
        ) {
          // Check if values are similar (within 10%)
          const valueSimilarity = this.compareNumericValues(
            range1.min,
            range2.min
          ) * 0.5 + this.compareNumericValues(
            range1.max,
            range2.max
          ) * 0.5;
          
          matchCount += valueSimilarity;
        }
      }
    }

    return matchCount / totalComparisons;
  }

  private compareNumericValues(val1: number, val2: number): number {
    if (val1 === val2) return 1;
    if (!val1 || !val2) return 0;
    
    const diff = Math.abs(val1 - val2);
    const avg = (val1 + val2) / 2;
    const percentDiff = diff / avg;
    
    return Math.max(0, 1 - percentDiff);
  }

  private contentHash(ingredient: SharedIngredient): string {
    const significant = {
      displayName: ingredient.displayName,
      unit: ingredient.unit,
      category: ingredient.category,
      referenceRanges: ingredient.referenceRanges?.map(r => ({
        populationType: r.populationType,
        min: r.min,
        max: r.max,
        unit: r.unit
      }))
    };

    // Simple browser-compatible hash function
    const str = JSON.stringify(significant);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  generateMergeSuggestion(
    master: SharedIngredient,
    duplicates: SharedIngredient[]
  ): MergeSuggestion {
    const conflictingFields = new Set<string>();
    const mergedData: Partial<SharedIngredient> = { ...master };

    // Analyze differences
    for (const dup of duplicates) {
      if (dup.displayName !== master.displayName) {
        conflictingFields.add('displayName');
      }
      if (dup.unit !== master.unit) {
        conflictingFields.add('unit');
      }
      if (JSON.stringify(dup.referenceRanges) !== JSON.stringify(master.referenceRanges)) {
        conflictingFields.add('referenceRanges');
      }
    }

    // Merge reference ranges (union)
    const allRanges = [
      ...master.referenceRanges,
      ...duplicates.flatMap(d => d.referenceRanges)
    ];
    
    mergedData.referenceRanges = this.mergeReferenceRanges(allRanges);

    // Merge usage statistics
    mergedData.usage = {
      referenceCount: master.usage.referenceCount + 
        duplicates.reduce((sum, d) => sum + d.usage.referenceCount, 0),
      lastUsed: new Date(Math.max(
        master.usage.lastUsed.getTime(),
        ...duplicates.map(d => d.usage.lastUsed.getTime())
      )),
      references: [
        ...master.usage.references,
        ...duplicates.flatMap(d => d.usage.references)
      ].filter((ref, index, self) => 
        index === self.findIndex(r => r.id === ref.id)
      )
    };

    return {
      targetId: master.id,
      sourceIds: duplicates.map(d => d.id),
      mergedData,
      conflictingFields: Array.from(conflictingFields),
      autoResolvable: conflictingFields.size === 0
    };
  }

  private mergeReferenceRanges(ranges: any[]): any[] {
    const merged = new Map();
    
    for (const range of ranges) {
      const key = `${range.populationType}-${range.unit}`;
      
      if (!merged.has(key)) {
        merged.set(key, range);
      } else {
        // Merge by taking average or most restrictive values
        const existing = merged.get(key);
        merged.set(key, {
          ...existing,
          min: Math.min(existing.min || 0, range.min || 0),
          max: Math.max(existing.max || 0, range.max || 0)
        });
      }
    }
    
    return Array.from(merged.values());
  }

  async generateDeduplicationReport(
    ingredients: SharedIngredient[]
  ): Promise<DeduplicationReport> {
    const duplicateGroups = await this.detectDuplicates(ingredients);
    const totalDuplicates = duplicateGroups.reduce(
      (sum, group) => sum + group.duplicates.length,
      0
    );

    return {
      totalIngredients: ingredients.length,
      duplicateGroups,
      totalDuplicates,
      potentialSavings: totalDuplicates,
      generatedAt: new Date()
    };
  }

  private calculateAverageSimilarity(
    master: SharedIngredient,
    duplicates: SharedIngredient[]
  ): number {
    if (duplicates.length === 0) return 0;
    
    const totalSimilarity = duplicates.reduce(
      (sum, dup) => sum + this.calculateSimilarity(master, dup),
      0
    );
    
    return totalSimilarity / duplicates.length;
  }

  async mergeDuplicates(
    master: SharedIngredient,
    duplicates: SharedIngredient[]
  ): Promise<SharedIngredient> {
    const mergedIngredient = { ...master };

    // Combine usage statistics
    mergedIngredient.usage = {
      referenceCount: master.usage.referenceCount + 
        duplicates.reduce((sum, d) => sum + d.usage.referenceCount, 0),
      lastUsed: new Date(Math.max(
        master.usage.lastUsed.getTime(),
        ...duplicates.map(d => d.usage.lastUsed.getTime())
      )),
      references: [
        ...master.usage.references,
        ...duplicates.flatMap(d => d.usage.references)
      ].filter((ref, index, self) => 
        index === self.findIndex(r => r.id === ref.id)
      )
    };

    // Merge reference ranges
    const allRanges = [
      ...master.referenceRanges,
      ...duplicates.flatMap(d => d.referenceRanges)
    ];
    mergedIngredient.referenceRanges = this.mergeReferenceRanges(allRanges);

    // Update metadata
    mergedIngredient.metadata = {
      ...mergedIngredient.metadata,
      modifiedAt: new Date(),
      version: mergedIngredient.metadata.version + 1
    };

    return mergedIngredient;
  }
}