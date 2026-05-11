/**
 * Service for analyzing imports and detecting duplicates/similarities
 * Provides intelligent matching and merge recommendations
 */

import type { Ingredient as DomainIngredient } from '@/entities/ingredient/types'
import type { ExtractedIngredient } from './ingredientExtractionService'
import { ingredientService } from '@/entities/ingredient/model/ingredientService'
import type { Section } from './noteTransformService'

export interface ImportMatch {
  /** Unique ID for this match */
  id: string
  
  /** Incoming ingredient to be imported */
  incoming: ExtractedIngredient
  
  /** Existing ingredient it matched with */
  existing: DomainIngredient | null
  
  /** Similarity score (0-100) */
  similarity: number
  
  /** Match type categorization */
  matchType: 'exact' | 'near' | 'unique'
  
  /** Specific differences found */
  differences?: {
    field: string
    incomingValue: any
    existingValue: any
  }[]
  
  /** Recommended action */
  recommendation: 'use-existing' | 'create-new' | 'merge' | 'review'
  
  /** Whether this requires a variant (for same-keyname ingredients) */
  requiresVariant?: boolean
}

export interface ImportSummary {
  totalIngredients: number
  exactMatchCount: number
  nearMatchCount: number
  uniqueCount: number
  estimatedDataSaved: string
  estimatedSizeReduction: {
    before: number
    after: number
    percentSaved: number
  }
}

export interface ImportAnalysisResult {
  /** All matches categorized */
  matches: ImportMatch[]
  
  /** Matches grouped by type */
  exactMatches: ImportMatch[]
  nearMatches: ImportMatch[]
  uniqueIngredients: ImportMatch[]
  
  /** Summary statistics */
  summary: ImportSummary
  
  /** Any issues found during analysis */
  issues: string[]
}

export interface ImportDecision {
  matchId: string
  action: 'use-existing' | 'create-new' | 'merge' | 'skip'
  ingredientId?: string // ID of existing ingredient if using/merging
  newName?: string // New name if renaming
}

export interface AnalysisOptions {
  /** Minimum similarity threshold for near matches (default: 70) */
  nearMatchThreshold?: number
  
  /** Whether to check content similarity (default: true) */
  checkContent?: boolean
  
  /** Whether to check reference ranges (default: true) */
  checkReferenceRanges?: boolean
  
  /** Custom similarity weights */
  weights?: {
    name?: number
    content?: number
    properties?: number
    referenceRanges?: number
  }
}

// Levenshtein distance for string similarity
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[m][n]
}

// Calculate similarity percentage between two strings
function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0
  if (str1 === str2) return 100
  
  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0) return 100
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  return Math.round((1 - distance / maxLen) * 100)
}

export class ImportAnalysisService {
  private defaultOptions: Required<AnalysisOptions> = {
    nearMatchThreshold: 70,
    checkContent: true,
    checkReferenceRanges: true,
    weights: {
      name: 0.2,
      content: 0.4,
      properties: 0.2,
      referenceRanges: 0.2
    }
  }

  /**
   * Analyze extracted ingredients against existing database
   * @param extracted - Extracted ingredients from import
   * @param options - Analysis options
   * @returns Analysis result with matches and recommendations
   */
  async analyzeImport(
    extracted: ExtractedIngredient[],
    options: AnalysisOptions = {}
  ): Promise<ImportAnalysisResult> {
    const opts = { ...this.defaultOptions, ...options }
    
    // Get all existing ingredients from database
    const existingResult = await ingredientService.getAll()
    const existingIngredients = existingResult.data || []
    
    // Analyze each extracted ingredient
    const matches: ImportMatch[] = []
    const exactMatches: ImportMatch[] = []
    const nearMatches: ImportMatch[] = []
    const uniqueIngredients: ImportMatch[] = []
    
    for (const extractedIng of extracted) {
      const match = await this.analyzeIngredient(
        extractedIng,
        existingIngredients,
        opts
      )
      
      matches.push(match)
      
      // Categorize by match type
      switch (match.matchType) {
        case 'exact':
          exactMatches.push(match)
          break
        case 'near':
          nearMatches.push(match)
          break
        case 'unique':
          uniqueIngredients.push(match)
          break
      }
    }
    
    // Calculate summary
    const summary = this.calculateSummary(
      extracted.length,
      exactMatches.length,
      nearMatches.length,
      uniqueIngredients.length
    )
    
    // Check for issues
    const issues = this.detectIssues(matches)
    
    return {
      matches,
      exactMatches,
      nearMatches,
      uniqueIngredients,
      summary,
      issues
    }
  }

  /**
   * Analyze a single ingredient against existing ones
   */
  private async analyzeIngredient(
    extracted: ExtractedIngredient,
    existing: DomainIngredient[],
    options: Required<AnalysisOptions>
  ): Promise<ImportMatch> {
    let bestMatch: {
      ingredient: DomainIngredient | null
      similarity: number
      differences: ImportMatch['differences']
    } = {
      ingredient: null,
      similarity: 0,
      differences: []
    }
    
    // Compare with each existing ingredient
    let requiresVariant = false
    for (const existingIng of existing) {
      const comparison = this.compareIngredients(
        extracted.domain,
        existingIng,
        options
      )
      
      if (comparison.similarity > bestMatch.similarity) {
        bestMatch = {
          ingredient: existingIng,
          similarity: comparison.similarity,
          differences: comparison.differences
        }
        requiresVariant = comparison.requiresVariant || false
        
        // Short-circuit if exact match found
        if (comparison.similarity === 100) break
      }
    }
    
    // Determine match type and recommendation
    let matchType: ImportMatch['matchType']
    let recommendation: ImportMatch['recommendation']
    
    if (bestMatch.similarity === 100) {
      matchType = 'exact'
      // If same keyname but has significant differences, recommend creating a variant
      // Otherwise, just use the existing ingredient
      recommendation = requiresVariant ? 'create-new' : 'use-existing'
    } else if (bestMatch.similarity >= options.nearMatchThreshold) {
      matchType = 'near'
      recommendation = bestMatch.similarity >= 85 ? 'merge' : 'review'
    } else {
      matchType = 'unique'
      recommendation = 'create-new'
      bestMatch.ingredient = null // Clear for unique items
    }
    
    return {
      id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      incoming: extracted,
      existing: bestMatch.ingredient,
      similarity: bestMatch.similarity,
      matchType,
      differences: bestMatch.differences,
      recommendation,
      requiresVariant
    }
  }

  /**
   * Extract all differences between two ingredients
   */
  private extractAllDifferences(
    incoming: Omit<DomainIngredient, 'id' | 'createdAt' | 'updatedAt'>,
    existing: DomainIngredient
  ): ImportMatch['differences'] {
    const differences: ImportMatch['differences'] = []
    
    // Compare all relevant fields
    if (incoming.displayName !== existing.displayName) {
      differences.push({
        field: 'displayName',
        incomingValue: incoming.displayName,
        existingValue: existing.displayName
      })
    }
    
    if (incoming.unit !== existing.unit) {
      differences.push({
        field: 'unit',
        incomingValue: incoming.unit,
        existingValue: existing.unit
      })
    }
    
    if (incoming.type !== existing.type) {
      differences.push({
        field: 'type',
        incomingValue: incoming.type || 'N/A',
        existingValue: existing.type || 'N/A'
      })
    }
    
    if (incoming.populationType !== existing.populationType) {
      differences.push({
        field: 'populationType',
        incomingValue: incoming.populationType || 'N/A',
        existingValue: existing.populationType || 'N/A'
      })
    }
    
    if (incoming.healthSystem !== existing.healthSystem) {
      differences.push({
        field: 'healthSystem',
        incomingValue: incoming.healthSystem || 'N/A',
        existingValue: existing.healthSystem || 'N/A'
      })
    }
    
    // Compare sections/content
    const incomingSectionCount = incoming.sections?.length || 0
    const existingSectionCount = existing.sections?.length || 0
    if (incomingSectionCount !== existingSectionCount) {
      differences.push({
        field: 'sections',
        incomingValue: `${incomingSectionCount} sections`,
        existingValue: `${existingSectionCount} sections`
      })
    }
    
    // Compare reference ranges
    const incomingRangeCount = incoming.referenceRanges?.length || 0
    const existingRangeCount = existing.referenceRanges?.length || 0
    if (incomingRangeCount !== existingRangeCount) {
      differences.push({
        field: 'referenceRanges',
        incomingValue: `${incomingRangeCount} ranges`,
        existingValue: `${existingRangeCount} ranges`
      })
    }
    
    return differences
  }

  /**
   * Compare two ingredients and calculate similarity
   */
  private compareIngredients(
    incoming: Omit<DomainIngredient, 'id' | 'createdAt' | 'updatedAt'>,
    existing: DomainIngredient,
    options: Required<AnalysisOptions>
  ): {
    similarity: number
    differences: ImportMatch['differences']
    requiresVariant?: boolean
  } {
    const differences: ImportMatch['differences'] = []
    const weights = options.weights!  // We know weights exist from defaultOptions
    let weightedSum = 0
    let totalWeight = 0
    
    // Check for exact keyname match - this means same ingredient, different variant
    const sameKeyname = incoming.keyname === existing.keyname
    if (sameKeyname) {
      // Same keyname means it's the same ingredient
      const allDifferences = this.extractAllDifferences(incoming, existing)
      
      // Filter out population/healthSystem differences - these don't require variants
      const significantDifferences = allDifferences.filter(diff => 
        !['populationType', 'healthSystem'].includes(diff.field)
      )
      
      // Only require a variant if there are actual content differences
      const requiresVariant = significantDifferences.length > 0
      
      return {
        similarity: 100, // Always 100% for same keyname
        differences: allDifferences,
        requiresVariant
      }
    }
    
    // Compare display names
    const nameSimilarity = calculateStringSimilarity(
      incoming.displayName,
      existing.displayName
    )
    if (nameSimilarity < 100) {
      differences.push({
        field: 'displayName',
        incomingValue: incoming.displayName,
        existingValue: existing.displayName
      })
    }
    weightedSum += nameSimilarity * weights.name
    totalWeight += weights.name
    
    // Compare content (sections)
    if (options.checkContent) {
      const contentSimilarity = this.compareContent(
        incoming.sections,
        existing.sections
      )
      if (contentSimilarity < 100) {
        differences.push({
          field: 'sections',
          incomingValue: `${incoming.sections?.length || 0} sections`,
          existingValue: `${existing.sections?.length || 0} sections`
        })
      }
      weightedSum += contentSimilarity * weights.content
      totalWeight += weights.content
    }
    
    // Compare properties
    const propSimilarity = this.compareProperties(incoming, existing, differences)
    weightedSum += propSimilarity * weights.properties
    totalWeight += weights.properties
    
    // Compare reference ranges
    if (options.checkReferenceRanges) {
      const rangeSimilarity = this.compareReferenceRanges(
        incoming.referenceRanges,
        existing.referenceRanges
      )
      if (rangeSimilarity < 100) {
        differences.push({
          field: 'referenceRanges',
          incomingValue: `${incoming.referenceRanges?.length || 0} ranges`,
          existingValue: `${existing.referenceRanges?.length || 0} ranges`
        })
      }
      weightedSum += rangeSimilarity * weights.referenceRanges
      totalWeight += weights.referenceRanges
    }
    
    const similarity = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
    
    return { similarity, differences }
  }

  /**
   * Compare content/sections between ingredients
   */
  private compareContent(
    incomingSections?: Section[],
    existingSections?: any[]
  ): number {
    if (!incomingSections && !existingSections) return 100
    if (!incomingSections || !existingSections) return 0
    if (incomingSections.length === 0 && existingSections.length === 0) return 100
    if (incomingSections.length === 0 || existingSections.length === 0) return 0
    
    // Compare content by concatenating and checking similarity
    const incomingContent = incomingSections
      .map(s => s.content)
      .join('\n')
      .trim()
    
    const existingContent = existingSections
      .map(s => s.content || '')
      .join('\n')
      .trim()
    
    return calculateStringSimilarity(incomingContent, existingContent)
  }

  /**
   * Compare basic properties
   */
  private compareProperties(
    incoming: Omit<DomainIngredient, 'id' | 'createdAt' | 'updatedAt'>,
    existing: DomainIngredient,
    differences: NonNullable<ImportMatch['differences']>
  ): number {
    let matches = 0
    let total = 0
    
    // Compare category
    total++
    if (incoming.category === existing.category) {
      matches++
    } else if (incoming.category && existing.category) {
      differences.push({
        field: 'category',
        incomingValue: incoming.category,
        existingValue: existing.category
      })
    }
    
    // Compare type
    total++
    if (incoming.type === existing.type) {
      matches++
    } else if (incoming.type && existing.type) {
      differences.push({
        field: 'type',
        incomingValue: incoming.type,
        existingValue: existing.type
      })
    }
    
    // Compare unit
    total++
    if (incoming.unit === existing.unit) {
      matches++
    } else {
      differences.push({
        field: 'unit',
        incomingValue: incoming.unit,
        existingValue: existing.unit
      })
    }
    
    // Compare health system
    if (incoming.healthSystem && existing.healthSystem) {
      total++
      if (incoming.healthSystem === existing.healthSystem) {
        matches++
      } else {
        differences.push({
          field: 'healthSystem',
          incomingValue: incoming.healthSystem,
          existingValue: existing.healthSystem
        })
      }
    }
    
    return total > 0 ? (matches / total) * 100 : 100
  }

  /**
   * Compare reference ranges
   */
  private compareReferenceRanges(
    incomingRanges?: any[],
    existingRanges?: any[]
  ): number {
    if (!incomingRanges && !existingRanges) return 100
    if (!incomingRanges || !existingRanges) return 0
    if (incomingRanges.length === 0 && existingRanges.length === 0) return 100
    if (incomingRanges.length !== existingRanges.length) return 50
    
    // Simple comparison based on count and population types
    const incomingPops = new Set(incomingRanges.map(r => r.populationType))
    const existingPops = new Set(existingRanges.map(r => r.populationType))
    
    let matches = 0
    incomingPops.forEach(pop => {
      if (existingPops.has(pop)) matches++
    })
    
    const total = Math.max(incomingPops.size, existingPops.size)
    return total > 0 ? (matches / total) * 100 : 100
  }

  /**
   * Calculate import summary statistics
   */
  private calculateSummary(
    total: number,
    exact: number,
    near: number,
    unique: number
  ): ImportSummary {
    const avgIngredientSize = 2048 // Estimated bytes per ingredient
    const before = total * avgIngredientSize
    
    // Calculate space saved
    // Exact matches: 100% saved (use existing)
    // Near matches: 75% saved (merge with existing)
    // Unique: 0% saved (must create new)
    const savedFromExact = exact * avgIngredientSize
    const savedFromNear = near * avgIngredientSize * 0.75
    const after = before - savedFromExact - savedFromNear
    
    const percentSaved = before > 0 ? 
      Math.round(((before - after) / before) * 100) : 0
    
    return {
      totalIngredients: total,
      exactMatchCount: exact,
      nearMatchCount: near,
      uniqueCount: unique,
      estimatedDataSaved: `${percentSaved}%`,
      estimatedSizeReduction: {
        before,
        after: Math.round(after),
        percentSaved
      }
    }
  }

  /**
   * Detect potential issues in the analysis
   */
  private detectIssues(matches: ImportMatch[]): string[] {
    const issues: string[] = []
    
    // Check for high number of near matches that need review
    const reviewNeeded = matches.filter(m => m.recommendation === 'review').length
    if (reviewNeeded > 10) {
      issues.push(`${reviewNeeded} ingredients require manual review`)
    }
    
    // Check for conflicting keynames
    const keynames = new Map<string, number>()
    matches.forEach(m => {
      const key = m.incoming.domain.keyname
      keynames.set(key, (keynames.get(key) || 0) + 1)
    })
    
    keynames.forEach((count, key) => {
      if (count > 1) {
        issues.push(`Duplicate keyname found: ${key} (${count} occurrences)`)
      }
    })
    
    // Check for ingredients with very low similarity but not unique
    const lowSimilarity = matches.filter(
      m => m.matchType === 'near' && m.similarity < 50
    )
    if (lowSimilarity.length > 0) {
      issues.push(`${lowSimilarity.length} ingredients have very low similarity scores`)
    }
    
    return issues
  }

  /**
   * Apply import decisions to execute the import
   * @param decisions - Array of import decisions
   * @returns Result of applying decisions
   */
  async applyDecisions(decisions: ImportDecision[]): Promise<{
    created: string[]
    merged: string[]
    skipped: string[]
    errors: Array<{ decision: ImportDecision; error: string }>
  }> {
    const result = {
      created: [] as string[],
      merged: [] as string[],
      skipped: [] as string[],
      errors: [] as Array<{ decision: ImportDecision; error: string }>
    }
    
    for (const decision of decisions) {
      try {
        switch (decision.action) {
          case 'create-new':
            // Implementation would create new ingredient
            result.created.push(decision.matchId)
            break
            
          case 'use-existing':
            // Skip creation, use existing
            result.skipped.push(decision.matchId)
            break
            
          case 'merge':
            // Merge with existing ingredient
            if (decision.ingredientId) {
              result.merged.push(decision.matchId)
            }
            break
            
          case 'skip':
            // Skip entirely
            result.skipped.push(decision.matchId)
            break
        }
      } catch (error) {
        result.errors.push({
          decision,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return result
  }
}

// Export singleton instance
export const importAnalysisService = new ImportAnalysisService()