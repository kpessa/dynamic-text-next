/**
 * Service for transforming between TPN config format and domain format
 * Config format: Schema-compliant format from TPN configurations
 * Domain format: Application format used in Firestore and UI
 */

import { 
  type Ingredient as TPNIngredient,
  type PopulationType as TPNPopulationType,
  type IngredientType as TPNIngredientType,
  type ReferenceRange as TPNReferenceRange,
  type Concentration as TPNConcentration,
  type AltUOM,
  type Lab,
  type Exclude
} from '../types/schemas'

import {
  type Ingredient as DomainIngredient,
  type PopulationType,
  type IngredientType,
  type IngredientCategory,
  type ReferenceRange,
  type Concentration,
  type ThresholdType
} from '@/entities/ingredient/types'

import { noteTransformService, type Section } from './noteTransformService'

export class IngredientTransformService {
  /**
   * Transform from TPN config format to domain format for storage
   * @param config - Ingredient in TPN schema format
   * @param healthSystem - Optional health system identifier
   * @returns Ingredient in domain format for Firestore
   */
  toDomainFormat(
    config: TPNIngredient, 
    healthSystem?: string,
    populationType?: PopulationType
  ): Omit<DomainIngredient, 'id' | 'createdAt' | 'updatedAt'> {
    // Transform NOTE array to sections
    const sections = config.NOTE ? 
      noteTransformService.noteArrayToSections(config.NOTE, config.KEYNAME) : []

    return {
      keyname: config.KEYNAME,
      displayName: config.DISPLAY,
      mnemonic: config.MNEMONIC,
      type: this.mapIngredientType(config.TYPE),
      category: this.inferCategory(config.TYPE),
      unit: config.UOM_DISP,
      alternateUnits: this.mapAlternateUnits(config.ALTUOM),
      referenceRanges: this.mapReferenceRanges(config.REFERENCE_RANGE, populationType),
      concentration: this.mapConcentration(config.CONCENTRATION),
      isShared: false, // Default to not shared on import
      healthSystem: healthSystem,
      populationType: populationType,
      osmolalityRatio: config.OSMO_RATIO,
      editMode: config.EDITMODE === 'Custom' ? 'Custom' : 'None',
      precision: config.PRECISION,
      special: config.SPECIAL,
      excludes: config.EXCLUDES?.map(e => e.KEYNAME) || [],
      labs: this.mapLabs(config.LABS),
      notes: sections.filter(s => s.type === 'static').map(s => s.content),
      // Store sections for dynamic content
      sections: sections,
      formula: sections.find(s => s.type === 'dynamic')?.content,
      dependencies: this.extractDependencies(sections),
      metadata: {
        originalFormat: 'TPN',
        importedAt: new Date().toISOString()
      }
    }
  }

  /**
   * Transform from domain format to TPN config format for export
   * @param domain - Ingredient in domain format
   * @returns Ingredient in TPN schema format
   */
  toConfigFormat(domain: DomainIngredient): TPNIngredient {
    // Transform sections back to NOTE array
    const noteArray = domain.sections ? 
      noteTransformService.sectionsToNoteArray(domain.sections) :
      domain.notes?.map(note => ({ TEXT: note })) || []

    return {
      KEYNAME: domain.keyname,
      DISPLAY: domain.displayName,
      MNEMONIC: domain.mnemonic || '',
      UOM_DISP: domain.unit,
      TYPE: this.reverseMapIngredientType(domain.type),
      OSMO_RATIO: domain.osmolalityRatio || 0,
      EDITMODE: (domain.editMode === 'Custom' ? 'Custom' : 'None') as 'None' | 'Custom',
      PRECISION: domain.precision || 2,
      SPECIAL: domain.special || '',
      NOTE: noteArray,
      ALTUOM: this.reverseMapAlternateUnits(domain.alternateUnits),
      REFERENCE_RANGE: this.reverseMapReferenceRanges(domain.referenceRanges),
      LABS: this.reverseMapLabs(domain.labs),
      CONCENTRATION: this.reverseMapConcentration(domain.concentration),
      EXCLUDES: domain.excludes?.map(keyname => ({ KEYNAME: keyname })) || []
    }
  }

  /**
   * Batch transform multiple ingredients to domain format
   * @param configs - Array of TPN format ingredients
   * @param healthSystem - Optional health system for all
   * @returns Array of domain format ingredients
   */
  batchToDomain(
    configs: TPNIngredient[], 
    healthSystem?: string,
    populationType?: PopulationType
  ): Array<Omit<DomainIngredient, 'id' | 'createdAt' | 'updatedAt'>> {
    return configs.map(config => 
      this.toDomainFormat(config, healthSystem, populationType)
    )
  }

  /**
   * Batch transform multiple ingredients to config format
   * @param domains - Array of domain format ingredients
   * @returns Array of TPN format ingredients
   */
  batchToConfig(domains: DomainIngredient[]): TPNIngredient[] {
    return domains.map(domain => this.toConfigFormat(domain))
  }

  /**
   * Map TPN ingredient type to domain type
   */
  private mapIngredientType(tpnType: TPNIngredientType): IngredientType | undefined {
    const typeMap: Record<TPNIngredientType, IngredientType> = {
      'Macronutrient': 'Macronutrient',
      'Micronutrient': 'Micronutrient',
      'Electrolyte': 'Salt',           // Map Electrolyte to Salt (configs use Salt for electrolytes)
      'Mineral': 'Micronutrient',      // Map to Micronutrient
      'Vitamin': 'Micronutrient',      // Map to Micronutrient
      'Trace Element': 'Micronutrient', // Map to Micronutrient
      'Additive': 'Additive',
      'Salt': 'Salt',
      'Diluent': 'Diluent',
      'Other': 'Other'
    }
    return typeMap[tpnType]
  }

  /**
   * Reverse map domain type to TPN type
   */
  private reverseMapIngredientType(domainType?: IngredientType): TPNIngredientType {
    if (!domainType) return 'Other'
    
    // Direct mapping for types that exist in both
    // Salt in domain maps back to Salt in TPN (not Electrolyte)
    if (['Macronutrient', 'Micronutrient', 'Additive', 'Salt', 'Diluent', 'Other'].includes(domainType)) {
      return domainType as TPNIngredientType
    }
    
    return 'Other'
  }

  /**
   * Infer category from TPN ingredient type
   */
  private inferCategory(tpnType: TPNIngredientType): IngredientCategory {
    const categoryMap: Record<TPNIngredientType, IngredientCategory> = {
      'Macronutrient': 'macro',
      'Micronutrient': 'micro',
      'Electrolyte': 'salt',    // Electrolyte maps to salt category
      'Mineral': 'micro',       // Mineral maps to micro category
      'Vitamin': 'micro',       // Vitamin maps to micro category
      'Trace Element': 'micro', // Trace Element maps to micro category
      'Additive': 'additive',
      'Salt': 'salt',
      'Diluent': 'diluent',
      'Other': 'other'
    }
    return categoryMap[tpnType] || 'other'
  }

  /**
   * Map alternate units of measure
   */
  private mapAlternateUnits(altUom?: AltUOM[]): DomainIngredient['alternateUnits'] {
    if (!altUom || altUom.length === 0) return undefined
    
    return altUom.map(uom => ({
      name: uom.NAME,
      unit: uom.UOM_DISP,
      conversionFactor: uom.CONVERSION
    }))
  }

  /**
   * Reverse map alternate units
   */
  private reverseMapAlternateUnits(altUnits?: DomainIngredient['alternateUnits']): AltUOM[] {
    if (!altUnits) return []
    
    return altUnits.map(unit => ({
      NAME: unit.name,
      UOM_DISP: unit.unit,
      CONVERSION: unit.conversionFactor
    }))
  }

  /**
   * Map reference ranges with threshold conversion
   */
  private mapReferenceRanges(
    ranges?: TPNReferenceRange[],
    populationType?: PopulationType
  ): ReferenceRange[] {
    if (!ranges || ranges.length === 0) return []

    // Group ranges by population type
    const rangeMap = new Map<string, ReferenceRange>()
    
    ranges.forEach(range => {
      const pop = range.POPULATION || populationType || 'ADULT'
      const key = pop
      
      if (!rangeMap.has(key)) {
        rangeMap.set(key, {
          populationType: pop as PopulationType,
          unit: '', // Will be set from parent
          threshold: range.THRESHOLD as ThresholdType,
          value: range.VALUE
        })
      }
      
      const existing = rangeMap.get(key)!
      
      // Map threshold values to appropriate range properties
      switch (range.THRESHOLD) {
        case 'Critical Low':
          if (!existing.critical) existing.critical = { low: 0, high: 0 }
          existing.critical.low = range.VALUE
          break
        case 'Critical High':
          if (!existing.critical) existing.critical = { low: 0, high: 0 }
          existing.critical.high = range.VALUE
          break
        case 'Normal Low':
          if (!existing.normal) existing.normal = { low: 0, high: 0 }
          existing.normal.low = range.VALUE
          break
        case 'Normal High':
          if (!existing.normal) existing.normal = { low: 0, high: 0 }
          existing.normal.high = range.VALUE
          break
        case 'Feasible Low':
          if (!existing.feasible) existing.feasible = { low: 0, high: 0 }
          existing.feasible.low = range.VALUE
          break
        case 'Feasible High':
          if (!existing.feasible) existing.feasible = { low: 0, high: 0 }
          existing.feasible.high = range.VALUE
          break
      }
    })
    
    return Array.from(rangeMap.values())
  }

  /**
   * Reverse map reference ranges
   */
  private reverseMapReferenceRanges(ranges?: ReferenceRange[]): TPNReferenceRange[] {
    if (!ranges || ranges.length === 0) return []
    
    const tpnRanges: TPNReferenceRange[] = []
    
    ranges.forEach(range => {
      // Extract individual threshold values
      if (range.critical?.low !== undefined) {
        tpnRanges.push({
          THRESHOLD: 'Critical Low',
          VALUE: range.critical.low,
          POPULATION: range.populationType
        })
      }
      if (range.critical?.high !== undefined) {
        tpnRanges.push({
          THRESHOLD: 'Critical High',
          VALUE: range.critical.high,
          POPULATION: range.populationType
        })
      }
      if (range.normal?.low !== undefined) {
        tpnRanges.push({
          THRESHOLD: 'Normal Low',
          VALUE: range.normal.low,
          POPULATION: range.populationType
        })
      }
      if (range.normal?.high !== undefined) {
        tpnRanges.push({
          THRESHOLD: 'Normal High',
          VALUE: range.normal.high,
          POPULATION: range.populationType
        })
      }
      if (range.feasible?.low !== undefined) {
        tpnRanges.push({
          THRESHOLD: 'Feasible Low',
          VALUE: range.feasible.low,
          POPULATION: range.populationType
        })
      }
      if (range.feasible?.high !== undefined) {
        tpnRanges.push({
          THRESHOLD: 'Feasible High',
          VALUE: range.feasible.high,
          POPULATION: range.populationType
        })
      }
    })
    
    return tpnRanges
  }

  /**
   * Map concentration values
   */
  private mapConcentration(conc?: TPNConcentration): Concentration | undefined {
    if (!conc) return undefined
    
    return {
      strength: conc.STRENGTH,
      strengthUnit: conc.STRENGTH_UOM,
      volume: conc.VOLUME,
      volumeUnit: conc.VOLUME_UOM
    }
  }

  /**
   * Reverse map concentration
   */
  private reverseMapConcentration(conc?: Concentration): TPNConcentration {
    if (!conc) {
      return {
        STRENGTH: 0,
        STRENGTH_UOM: '',
        VOLUME: 0,
        VOLUME_UOM: ''
      }
    }
    
    return {
      STRENGTH: conc.strength,
      STRENGTH_UOM: conc.strengthUnit,
      VOLUME: conc.volume,
      VOLUME_UOM: conc.volumeUnit
    }
  }

  /**
   * Map lab configurations
   */
  private mapLabs(labs?: Lab[]): DomainIngredient['labs'] {
    if (!labs || labs.length === 0) return undefined
    
    return labs.map(lab => ({
      displayName: lab.NAME,
      eventSetName: lab.CODE,
      shouldGraph: true // Default to true, adjust based on needs
    }))
  }

  /**
   * Reverse map labs
   */
  private reverseMapLabs(labs?: DomainIngredient['labs']): Lab[] {
    if (!labs) return []
    
    return labs.map(lab => ({
      NAME: lab.displayName,
      CODE: lab.eventSetName,
      UOM: '' // Will need to be set from context
    }))
  }

  /**
   * Extract dependencies from dynamic sections
   * Looks for references to other ingredients in JavaScript code
   */
  private extractDependencies(sections: Section[]): string[] {
    const dependencies = new Set<string>()
    
    sections
      .filter(s => s.type === 'dynamic')
      .forEach(section => {
        // Look for patterns like me.KEYNAME or me['KEYNAME']
        const mePattern = /me\.([\w_]+)|me\['([\w_]+)'\]|me\["([\w_]+)"\]/g
        let match
        
        while ((match = mePattern.exec(section.content)) !== null) {
          const key = match[1] || match[2] || match[3]
          if (key) {
            dependencies.add(key)
          }
        }
      })
    
    return Array.from(dependencies)
  }

  /**
   * Validate that a round-trip transformation preserves data
   * @param original - Original TPN format ingredient
   * @returns Validation result with any differences found
   */
  validateRoundTrip(original: TPNIngredient): {
    valid: boolean
    differences: string[]
  } {
    const domain = this.toDomainFormat(original)
    const reconstructed = this.toConfigFormat({
      ...domain,
      id: 'test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as DomainIngredient)
    
    const differences: string[] = []
    
    // Check key fields
    if (original.KEYNAME !== reconstructed.KEYNAME) {
      differences.push(`KEYNAME: ${original.KEYNAME} !== ${reconstructed.KEYNAME}`)
    }
    if (original.DISPLAY !== reconstructed.DISPLAY) {
      differences.push(`DISPLAY: ${original.DISPLAY} !== ${reconstructed.DISPLAY}`)
    }
    if (original.NOTE.length !== reconstructed.NOTE.length) {
      differences.push(`NOTE length: ${original.NOTE.length} !== ${reconstructed.NOTE.length}`)
    }
    
    return {
      valid: differences.length === 0,
      differences
    }
  }
}

// Export singleton instance
export const ingredientTransformService = new IngredientTransformService()