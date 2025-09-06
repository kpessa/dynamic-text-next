import type { 
  Ingredient, 
  ReferenceRange, 
  ReferenceRangeValidation,
  PopulationType,
  ThresholdType 
} from '@/entities/ingredient/types'

export class ReferenceRangeService {
  // Get reference ranges for a specific population
  getRangesForPopulation(
    ingredient: Ingredient,
    populationType: PopulationType
  ): ReferenceRange | undefined {
    // First try to find exact match
    const exactMatch = ingredient.referenceRanges.find(
      r => r.populationType === populationType
    )
    
    if (exactMatch) {
      return exactMatch
    }

    // If no exact match, try inheritance rules
    return this.getInheritedRange(ingredient, populationType)
  }

  // Inheritance rules for missing population types
  private getInheritedRange(
    ingredient: Ingredient,
    populationType: PopulationType
  ): ReferenceRange | undefined {
    const inheritanceMap: Record<PopulationType, PopulationType[]> = {
      'NEO': ['CHILD', 'ADOLESCENT', 'ADULT'], // Neonatal is most specific, no inheritance
      'CHILD': ['ADOLESCENT', 'ADULT'],  // Child can inherit from adolescent or adult
      'ADOLESCENT': ['ADULT', 'CHILD'],  // Adolescent can inherit from adult or child
      'ADULT': ['ADOLESCENT', 'CHILD']   // Adult can inherit from adolescent or child
    }

    const fallbackOrder = inheritanceMap[populationType] || []
    
    for (const fallback of fallbackOrder) {
      const range = ingredient.referenceRanges.find(
        r => r.populationType === fallback
      )
      if (range) {
        // Return a copy with adjusted population type
        return {
          ...range,
          populationType // Mark it as for the requested population
        }
      }
    }

    // If still no match, return the first available range as last resort
    return ingredient.referenceRanges[0]
  }

  // Validate a value against reference ranges
  validateRange(
    value: number,
    ingredient: Ingredient,
    populationType: PopulationType
  ): ReferenceRangeValidation {
    const ranges = this.getRangesForPopulation(ingredient, populationType)
    
    if (!ranges) {
      return {
        status: 'normal',
        message: 'No reference ranges defined',
        value,
        ranges: {
          populationType,
          unit: ingredient.unit
        }
      }
    }

    // Check against critical ranges first
    if (ranges.critical) {
      if (value < ranges.critical.low) {
        return {
          status: 'critical-low',
          message: `Critical low: Below ${ranges.critical.low} ${ranges.unit}`,
          value,
          ranges
        }
      }
      if (value > ranges.critical.high) {
        return {
          status: 'critical-high',
          message: `Critical high: Above ${ranges.critical.high} ${ranges.unit}`,
          value,
          ranges
        }
      }
    }

    // Check against normal ranges
    if (ranges.normal) {
      if (value < ranges.normal.low) {
        return {
          status: 'low',
          message: `Low: Below normal range (${ranges.normal.low}-${ranges.normal.high} ${ranges.unit})`,
          value,
          ranges
        }
      }
      if (value > ranges.normal.high) {
        return {
          status: 'high',
          message: `High: Above normal range (${ranges.normal.low}-${ranges.normal.high} ${ranges.unit})`,
          value,
          ranges
        }
      }
    }

    // Check against feasible ranges
    if (ranges.feasible) {
      if (value < ranges.feasible.low || value > ranges.feasible.high) {
        return {
          status: 'out-of-range',
          message: `Out of feasible range (${ranges.feasible.low}-${ranges.feasible.high} ${ranges.unit})`,
          value,
          ranges
        }
      }
    }

    // Check against simple min/max if no other ranges defined
    if (ranges.min !== undefined && value < ranges.min) {
      return {
        status: 'low',
        message: `Below minimum value ${ranges.min} ${ranges.unit}`,
        value,
        ranges
      }
    }

    if (ranges.max !== undefined && value > ranges.max) {
      return {
        status: 'high',
        message: `Above maximum value ${ranges.max} ${ranges.unit}`,
        value,
        ranges
      }
    }

    return {
      status: 'normal',
      message: 'Within normal range',
      value,
      ranges
    }
  }

  // Parse threshold-based ranges (from parent project format)
  parseThresholdRanges(
    thresholds: Array<{ threshold: ThresholdType; value: number }>,
    unit: string,
    populationType: PopulationType
  ): ReferenceRange {
    const range: ReferenceRange = {
      populationType,
      unit
    }

    const feasibleLow = thresholds.find(t => t.threshold === 'Feasible Low')?.value
    const criticalLow = thresholds.find(t => t.threshold === 'Critical Low')?.value
    const normalLow = thresholds.find(t => t.threshold === 'Normal Low')?.value
    const normalHigh = thresholds.find(t => t.threshold === 'Normal High')?.value
    const criticalHigh = thresholds.find(t => t.threshold === 'Critical High')?.value
    const feasibleHigh = thresholds.find(t => t.threshold === 'Feasible High')?.value

    if (feasibleLow !== undefined && feasibleHigh !== undefined) {
      range.feasible = { low: feasibleLow, high: feasibleHigh }
    }

    if (criticalLow !== undefined && criticalHigh !== undefined) {
      range.critical = { low: criticalLow, high: criticalHigh }
    }

    if (normalLow !== undefined && normalHigh !== undefined) {
      range.normal = { low: normalLow, high: normalHigh }
    }

    // Set min/max as the outer feasible bounds
    if (feasibleLow !== undefined) range.min = feasibleLow
    if (feasibleHigh !== undefined) range.max = feasibleHigh

    return range
  }

  // Convert range to threshold format (for export)
  rangeToThresholds(range: ReferenceRange): Array<{ threshold: ThresholdType; value: number }> {
    const thresholds: Array<{ threshold: ThresholdType; value: number }> = []

    if (range.feasible) {
      thresholds.push(
        { threshold: 'Feasible Low', value: range.feasible.low },
        { threshold: 'Feasible High', value: range.feasible.high }
      )
    }

    if (range.critical) {
      thresholds.push(
        { threshold: 'Critical Low', value: range.critical.low },
        { threshold: 'Critical High', value: range.critical.high }
      )
    }

    if (range.normal) {
      thresholds.push(
        { threshold: 'Normal Low', value: range.normal.low },
        { threshold: 'Normal High', value: range.normal.high }
      )
    }

    return thresholds
  }

  // Detect conflicts between ranges
  detectRangeConflicts(ranges: ReferenceRange[]): string[] {
    const conflicts: string[] = []

    ranges.forEach((range, index) => {
      // Check for logical conflicts within a single range
      if (range.critical && range.normal) {
        if (range.critical.low > range.normal.low) {
          conflicts.push(
            `Range ${index + 1} (${range.populationType}): Critical low is higher than normal low`
          )
        }
        if (range.critical.high < range.normal.high) {
          conflicts.push(
            `Range ${index + 1} (${range.populationType}): Critical high is lower than normal high`
          )
        }
      }

      if (range.feasible && range.critical) {
        if (range.feasible.low > range.critical.low) {
          conflicts.push(
            `Range ${index + 1} (${range.populationType}): Feasible low is higher than critical low`
          )
        }
        if (range.feasible.high < range.critical.high) {
          conflicts.push(
            `Range ${index + 1} (${range.populationType}): Feasible high is lower than critical high`
          )
        }
      }

      // Check for duplicate population types
      const duplicates = ranges.filter(
        (r, i) => i !== index && r.populationType === range.populationType
      )
      if (duplicates.length > 0) {
        conflicts.push(
          `Duplicate reference range for population type: ${range.populationType}`
        )
      }
    })

    return conflicts
  }

  // Merge ranges from different sources
  mergeRanges(
    existingRanges: ReferenceRange[],
    newRanges: ReferenceRange[],
    strategy: 'replace' | 'merge' | 'keep-existing' = 'merge'
  ): ReferenceRange[] {
    if (strategy === 'replace') {
      return newRanges
    }

    if (strategy === 'keep-existing') {
      return existingRanges
    }

    // Merge strategy: combine both, preferring new ranges for conflicts
    const merged = [...existingRanges]
    
    newRanges.forEach(newRange => {
      const existingIndex = merged.findIndex(
        r => r.populationType === newRange.populationType
      )
      
      if (existingIndex >= 0) {
        // Replace existing with new
        merged[existingIndex] = newRange
      } else {
        // Add new range
        merged.push(newRange)
      }
    })

    return merged
  }

  // Calculate range coverage (what percentage of population types have ranges)
  calculateRangeCoverage(ingredient: Ingredient): number {
    const allPopulations: PopulationType[] = ['NEO', 'CHILD', 'ADOLESCENT', 'ADULT']
    const coveredPopulations = new Set(
      ingredient.referenceRanges.map(r => r.populationType)
    )
    
    return (coveredPopulations.size / allPopulations.length) * 100
  }

  // Generate range summary for display
  generateRangeSummary(range: ReferenceRange): string {
    const parts: string[] = []

    if (range.normal) {
      parts.push(`Normal: ${range.normal.low}-${range.normal.high}`)
    }
    
    if (range.critical) {
      parts.push(`Critical: ${range.critical.low}-${range.critical.high}`)
    }
    
    if (range.feasible) {
      parts.push(`Feasible: ${range.feasible.low}-${range.feasible.high}`)
    }
    
    if (parts.length === 0 && range.min !== undefined && range.max !== undefined) {
      parts.push(`Range: ${range.min}-${range.max}`)
    }

    return parts.length > 0 
      ? `${parts.join(', ')} ${range.unit}`
      : `No ranges defined (${range.unit})`
  }

  // Validate range updates
  validateRangeUpdate(
    existingRange: ReferenceRange,
    updates: Partial<ReferenceRange>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const merged = { ...existingRange, ...updates }

    // Validate critical ranges
    if (merged.critical) {
      if (merged.critical.low >= merged.critical.high) {
        errors.push('Critical low must be less than critical high')
      }
    }

    // Validate normal ranges
    if (merged.normal) {
      if (merged.normal.low >= merged.normal.high) {
        errors.push('Normal low must be less than normal high')
      }
    }

    // Validate feasible ranges
    if (merged.feasible) {
      if (merged.feasible.low >= merged.feasible.high) {
        errors.push('Feasible low must be less than feasible high')
      }
    }

    // Cross-validate ranges
    if (merged.critical && merged.normal) {
      if (merged.critical.low > merged.normal.low) {
        errors.push('Critical low cannot be higher than normal low')
      }
      if (merged.critical.high < merged.normal.high) {
        errors.push('Critical high cannot be lower than normal high')
      }
    }

    if (merged.feasible && merged.normal) {
      if (merged.feasible.low > merged.normal.low) {
        errors.push('Feasible low cannot be higher than normal low')
      }
      if (merged.feasible.high < merged.normal.high) {
        errors.push('Feasible high cannot be lower than normal high')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const referenceRangeService = new ReferenceRangeService()