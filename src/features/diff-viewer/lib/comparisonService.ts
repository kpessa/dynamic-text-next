import { SharedIngredient } from '@/entities/shared-ingredient';
import { Ingredient } from '@/entities/ingredient/types';
import { DiffEngine, DiffResult, DiffOptions } from './diffEngine';

export type PopulationType = 'neonatal' | 'child' | 'adolescent' | 'adult';
export type ComparisonMode = 'populations' | 'versions';

export interface PopulationInfo {
  name: string;
  color: string;
  bgColor: string;
}

export const POPULATION_TYPES: Record<string, PopulationType> = {
  NEO: 'neonatal',
  CHILD: 'child',
  ADOLESCENT: 'adolescent',
  ADULT: 'adult'
} as const;

export const populationInfo: Record<PopulationType, PopulationInfo> = {
  neonatal: {
    name: 'Neonatal',
    color: '#ff6b6b',
    bgColor: '#ffe0e0'
  },
  child: {
    name: 'Child',
    color: '#4ecdc4',
    bgColor: '#e0f7f5'
  },
  adolescent: {
    name: 'Adolescent',
    color: '#45b7d1',
    bgColor: '#e0f2f7'
  },
  adult: {
    name: 'Adult',
    color: '#5f27cd',
    bgColor: '#ede7f6'
  }
};

export interface ComparisonRequest {
  ingredientId: string;
  mode: ComparisonMode;
  populations?: PopulationType[];
  versions?: { v1: number; v2: number };
  options?: Partial<DiffOptions>;
}

export interface ComparisonResult {
  id: string;
  ingredientId: string;
  mode: ComparisonMode;
  timestamp: Date;
  comparisons: ComparisonPair[];
  summary: ComparisonSummary;
}

export interface ComparisonPair {
  left: {
    label: string;
    population?: PopulationType;
    version?: number;
    content: any;
  };
  right: {
    label: string;
    population?: PopulationType;
    version?: number;
    content: any;
  };
  diff: DiffResult[];
  statistics: {
    additions: number;
    deletions: number;
    modifications: number;
  };
}

export interface ComparisonSummary {
  totalComparisons: number;
  totalChanges: number;
  changedFields: string[];
  identicalPairs: number;
}

export interface ComparisonCache {
  key: string;
  result: ComparisonResult;
  timestamp: number;
}

export class ComparisonService {
  private static instance: ComparisonService;
  private diffEngine: DiffEngine;
  private cache: Map<string, ComparisonCache> = new Map();
  private readonly cacheTimeout = 30 * 60 * 1000; // 30 minutes

  private constructor() {
    this.diffEngine = new DiffEngine();
  }

  static getInstance(): ComparisonService {
    if (!ComparisonService.instance) {
      ComparisonService.instance = new ComparisonService();
    }
    return ComparisonService.instance;
  }

  async comparePopulations(
    ingredient: SharedIngredient | Ingredient,
    populations: PopulationType[],
    options?: Partial<DiffOptions>
  ): Promise<ComparisonResult> {
    const cacheKey = this.getCacheKey(ingredient.id, 'populations', populations);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const comparisons: ComparisonPair[] = [];
    const changedFields = new Set<string>();

    // Compare all population pairs
    for (let i = 0; i < populations.length - 1; i++) {
      for (let j = i + 1; j < populations.length; j++) {
        const leftPop = populations[i];
        const rightPop = populations[j];
        
        const leftData = await this.fetchPopulationData(ingredient, leftPop);
        const rightData = await this.fetchPopulationData(ingredient, rightPop);
        
        if (!leftData || !rightData) continue;

        const leftContent = this.serializeContent(leftData);
        const rightContent = this.serializeContent(rightData);
        
        const diff = this.diffEngine.compare(leftContent, rightContent, options);
        const stats = this.diffEngine.calculateStatistics(diff);
        
        // Track changed fields
        this.extractChangedFields(diff).forEach(field => changedFields.add(field));
        
        comparisons.push({
          left: {
            label: populationInfo[leftPop].name,
            population: leftPop,
            content: leftData
          },
          right: {
            label: populationInfo[rightPop].name,
            population: rightPop,
            content: rightData
          },
          diff,
          statistics: {
            additions: stats.additions,
            deletions: stats.deletions,
            modifications: stats.modifications
          }
        });
      }
    }

    const result: ComparisonResult = {
      id: `comp-${Date.now()}`,
      ingredientId: ingredient.id,
      mode: 'populations',
      timestamp: new Date(),
      comparisons,
      summary: {
        totalComparisons: comparisons.length,
        totalChanges: comparisons.reduce(
          (sum, c) => sum + c.statistics.additions + c.statistics.deletions + c.statistics.modifications,
          0
        ),
        changedFields: Array.from(changedFields),
        identicalPairs: comparisons.filter(c => c.diff.every(d => d.type === 'unchanged')).length
      }
    };

    this.addToCache(cacheKey, result);
    return result;
  }

  async compareVersions(
    ingredient: SharedIngredient | Ingredient,
    population: PopulationType,
    version1: number,
    version2: number,
    options?: Partial<DiffOptions>
  ): Promise<ComparisonResult> {
    const cacheKey = this.getCacheKey(
      ingredient.id,
      'versions',
      [population],
      { v1: version1, v2: version2 }
    );
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const comparisons: ComparisonPair[] = [];
    const changedFields = new Set<string>();

    const v1Data = await this.fetchVersionData(ingredient, population, version1);
    const v2Data = await this.fetchVersionData(ingredient, population, version2);
    
    if (!v1Data || !v2Data) {
      throw new Error('Failed to fetch version data');
    }

    const v1Content = this.serializeContent(v1Data);
    const v2Content = this.serializeContent(v2Data);
    
    const diff = this.diffEngine.compare(v1Content, v2Content, options);
    const stats = this.diffEngine.calculateStatistics(diff);
    
    // Track changed fields
    this.extractChangedFields(diff).forEach(field => changedFields.add(field));
    
    comparisons.push({
      left: {
        label: `Version ${version1}`,
        population,
        version: version1,
        content: v1Data
      },
      right: {
        label: `Version ${version2}`,
        population,
        version: version2,
        content: v2Data
      },
      diff,
      statistics: {
        additions: stats.additions,
        deletions: stats.deletions,
        modifications: stats.modifications
      }
    });

    const result: ComparisonResult = {
      id: `comp-${Date.now()}`,
      ingredientId: ingredient.id,
      mode: 'versions',
      timestamp: new Date(),
      comparisons,
      summary: {
        totalComparisons: 1,
        totalChanges: stats.additions + stats.deletions + stats.modifications,
        changedFields: Array.from(changedFields),
        identicalPairs: diff.every(d => d.type === 'unchanged') ? 1 : 0
      }
    };

    this.addToCache(cacheKey, result);
    return result;
  }

  private async fetchPopulationData(
    ingredient: SharedIngredient | Ingredient,
    population: PopulationType
  ): Promise<any> {
    // In a real implementation, this would fetch from Firebase/API
    // For now, we'll simulate with mock data
    const mockData = {
      ...ingredient,
      population,
      referenceRanges: this.getPopulationReferenceRanges(ingredient, population)
    };
    
    // Simulate async fetch
    await new Promise(resolve => setTimeout(resolve, 10));
    return mockData;
  }

  private async fetchVersionData(
    ingredient: SharedIngredient | Ingredient,
    population: PopulationType,
    version: number
  ): Promise<any> {
    // In a real implementation, this would fetch from version history
    // For now, we'll simulate with mock data
    const mockData = {
      ...ingredient,
      population,
      version,
      metadata: {
        ...('metadata' in ingredient ? ingredient.metadata : {}),
        version
      }
    };
    
    // Simulate async fetch
    await new Promise(resolve => setTimeout(resolve, 10));
    return mockData;
  }

  private getPopulationReferenceRanges(
    ingredient: SharedIngredient | Ingredient,
    population: PopulationType
  ): any[] {
    // Filter reference ranges for the specific population
    const ranges = ingredient.referenceRanges || [];
    return ranges.filter((range: any) => {
      if (!range.populationType) return false;
      const popType = range.populationType.toLowerCase();
      
      // Map population types to reference range types
      switch (population) {
        case 'neonatal':
          return popType === 'neonatal' || popType === 'neo';
        case 'child':
          return popType === 'child' || popType === 'pediatric';
        case 'adolescent':
          return popType === 'adolescent' || popType === 'teen';
        case 'adult':
          return popType === 'adult';
        default:
          return false;
      }
    });
  }

  private serializeContent(data: any): string {
    // Convert object to formatted JSON string for comparison
    return JSON.stringify(data, null, 2);
  }

  private extractChangedFields(diff: DiffResult[]): string[] {
    const fields = new Set<string>();
    
    diff.forEach(d => {
      if (d.type !== 'unchanged' && d.metadata?.field) {
        fields.add(d.metadata.field);
      } else if (d.type !== 'unchanged' && d.content) {
        // Try to extract field name from content
        const match = d.content.match(/"([^"]+)":/);
        if (match) {
          fields.add(match[1]);
        }
      }
    });
    
    return Array.from(fields);
  }

  async handleMissingData(
    ingredientId: string,
    population?: PopulationType,
    version?: number
  ): Promise<any> {
    // Gracefully handle missing or incomplete data
    console.warn(`Missing data for ingredient ${ingredientId}`, { population, version });
    
    // Return a placeholder object
    return {
      id: ingredientId,
      displayName: 'Data Not Available',
      population,
      version,
      error: 'Data not found',
      referenceRanges: []
    };
  }

  // Cache management
  private getCacheKey(
    ingredientId: string,
    mode: ComparisonMode,
    populations?: PopulationType[],
    versions?: { v1: number; v2: number }
  ): string {
    const parts = [ingredientId, mode];
    
    if (populations) {
      parts.push(populations.sort().join('-'));
    }
    
    if (versions) {
      parts.push(`v${versions.v1}-v${versions.v2}`);
    }
    
    return parts.join(':');
  }

  private getFromCache(key: string): ComparisonResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.result;
  }

  private addToCache(key: string, result: ComparisonResult): void {
    // Limit cache size to prevent memory issues
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      key,
      result,
      timestamp: Date.now()
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  // Build comparison context for UI
  buildComparisonContext(result: ComparisonResult): any {
    return {
      mode: result.mode,
      timestamp: result.timestamp,
      populations: result.mode === 'populations' 
        ? Array.from(new Set(result.comparisons.flatMap(c => [c.left.population, c.right.population])))
        : undefined,
      versions: result.mode === 'versions'
        ? { v1: result.comparisons[0]?.left.version, v2: result.comparisons[0]?.right.version }
        : undefined,
      summary: result.summary
    };
  }
}