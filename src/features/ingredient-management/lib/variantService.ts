import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from 'firebase/firestore'
import { db } from '@/shared/config/firebase'
import { 
  Ingredient, 
  IngredientVariant, 
  IngredientType,
  Population,
  ValidationStatus,
  SyncStatus,
  TestCase,
} from '../store/variantSlice'

export class VariantService {
  private readonly COLLECTION_NAME = 'ingredient_variants'
  private readonly INGREDIENTS_COLLECTION = 'ingredients'

  /**
   * Fetch all ingredient variants from Firebase
   */
  async fetchAllVariants(): Promise<IngredientVariant[]> {
    try {
      const variantsSnapshot = await getDocs(collection(db, this.COLLECTION_NAME))
      const variants: IngredientVariant[] = []
      
      variantsSnapshot.forEach((doc) => {
        const data = doc.data()
        variants.push(this.mapDocumentToVariant(doc.id, data))
      })
      
      return variants
    } catch (error) {
      console.error('Error fetching variants:', error)
      throw new Error('Failed to fetch ingredient variants')
    }
  }

  /**
   * Fetch variants for a specific ingredient
   */
  async fetchVariantsByIngredient(ingredientId: string): Promise<IngredientVariant[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('ingredientId', '==', ingredientId),
        orderBy('population'),
        orderBy('healthSystem')
      )
      
      const variantsSnapshot = await getDocs(q)
      const variants: IngredientVariant[] = []
      
      variantsSnapshot.forEach((doc) => {
        const data = doc.data()
        variants.push(this.mapDocumentToVariant(doc.id, data))
      })
      
      return variants
    } catch (error) {
      console.error('Error fetching variants for ingredient:', error)
      throw new Error(`Failed to fetch variants for ingredient ${ingredientId}`)
    }
  }

  /**
   * Fetch variants by population and health system
   */
  async fetchVariantsByPopulationAndSystem(
    population: Population,
    healthSystem: string
  ): Promise<IngredientVariant[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('population', '==', population),
        where('healthSystem', '==', healthSystem)
      )
      
      const variantsSnapshot = await getDocs(q)
      const variants: IngredientVariant[] = []
      
      variantsSnapshot.forEach((doc) => {
        const data = doc.data()
        variants.push(this.mapDocumentToVariant(doc.id, data))
      })
      
      return variants
    } catch (error) {
      console.error('Error fetching variants by population and system:', error)
      throw new Error(`Failed to fetch variants for ${population}/${healthSystem}`)
    }
  }

  /**
   * Fetch all ingredients with their variants grouped by type
   */
  async fetchIngredientsWithVariants(): Promise<Record<IngredientType, Ingredient[]>> {
    try {
      // Fetch all ingredients
      const ingredientsSnapshot = await getDocs(collection(db, this.INGREDIENTS_COLLECTION))
      const ingredientsMap = new Map<string, Ingredient>()
      
      ingredientsSnapshot.forEach((doc) => {
        const data = doc.data()
        const ingredient: Ingredient = {
          id: doc.id,
          name: data.name || '',
          keyname: data.keyname || data.KEYNAME || doc.id,
          display: data.display || data.DISPLAY || data.name || '',
          displayName: data.displayName || data.DISPLAY || data.display || data.name || '',
          mnemonic: data.mnemonic || data.MNEMONIC,
          uomDisp: data.uomDisp || data.UOM_DISP,
          type: (data.type || data.TYPE || 'Other') as IngredientType,
          osmoRatio: data.osmoRatio || data.OSMO_RATIO,
          editMode: data.editMode || data.EDITMODE,
          precision: data.precision || data.PRECISION,
          special: data.special || data.SPECIAL,
          notes: data.notes || (data.NOTE && Array.isArray(data.NOTE) ? data.NOTE.map((n: any) => n.TEXT || n) : undefined),
          altUom: data.altUom || (data.ALTUOM && Array.isArray(data.ALTUOM) ? data.ALTUOM.map((u: any) => ({
            name: u.NAME || '',
            uomDisp: u.UOM_DISP || ''
          })) : undefined),
          referenceRanges: data.referenceRanges || (data.REFERENCE_RANGE && Array.isArray(data.REFERENCE_RANGE) ? 
            data.REFERENCE_RANGE.map((r: any) => ({
              threshold: r.THRESHOLD || '',
              value: r.VALUE || 0
            })) : undefined),
          labs: data.labs || (data.LABS && Array.isArray(data.LABS) ? 
            data.LABS.map((l: any) => ({
              display: l.DISPLAY || '',
              eventSetName: l.EVENT_SET_NAME || '',
              graph: l.GRAPH || 0
            })) : undefined),
          concentration: data.concentration || (data.CONCENTRATION ? {
            strength: data.CONCENTRATION.STRENGTH || 0,
            strengthUom: data.CONCENTRATION.STRENGTH_UOM || '',
            volume: data.CONCENTRATION.VOLUME || 0,
            volumeUom: data.CONCENTRATION.VOLUME_UOM || ''
          } : undefined),
          excludes: data.excludes || (data.EXCLUDES && Array.isArray(data.EXCLUDES) ? 
            data.EXCLUDES.map((e: any) => e.keyname || e) : undefined),
          variants: [],
          tests: data.tests || [],
          hasSyncConflicts: false,
        }
        ingredientsMap.set(doc.id, ingredient)
      })
      
      // Fetch all variants
      const variants = await this.fetchAllVariants()
      
      // Attach variants to ingredients and check for sync conflicts
      for (const variant of variants) {
        const ingredient = ingredientsMap.get(variant.ingredientId)
        if (ingredient) {
          ingredient.variants.push(variant)
        }
      }
      
      // Check for sync conflicts
      for (const ingredient of ingredientsMap.values()) {
        ingredient.hasSyncConflicts = this.checkSyncConflicts(ingredient.variants)
      }
      
      // Group by type
      const result: Record<IngredientType, Ingredient[]> = {
        Macronutrient: [],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      }
      
      for (const ingredient of ingredientsMap.values()) {
        result[ingredient.type].push(ingredient)
      }
      
      // Sort ingredients by display name within each type
      for (const type of Object.keys(result) as IngredientType[]) {
        result[type].sort((a, b) => a.display.localeCompare(b.display))
      }
      
      return result
    } catch (error) {
      console.error('Error fetching ingredients with variants:', error)
      throw new Error('Failed to fetch ingredients with variants')
    }
  }

  /**
   * Validate sections for completeness
   */
  validateSections(variant: IngredientVariant): ValidationStatus {
    const { sections } = variant
    
    if (!sections || (!sections.static?.length && !sections.dynamic?.length)) {
      return 'error'
    }
    
    let hasWarnings = false
    let hasErrors = false
    
    // Check static sections
    for (const section of sections.static || []) {
      if (!section.content || section.content.trim() === '') {
        hasErrors = true
        break
      }
      if (!this.isValidHTML(section.content)) {
        hasWarnings = true
      }
    }
    
    // Check dynamic sections
    for (const section of sections.dynamic || []) {
      if (!section.template || section.template.trim() === '') {
        hasErrors = true
        break
      }
      if (!section.variables || Object.keys(section.variables).length === 0) {
        hasWarnings = true
      }
    }
    
    if (hasErrors) return 'error'
    if (hasWarnings) return 'warning'
    return 'valid'
  }

  /**
   * Check test case status
   */
  getTestStatus(tests: TestCase[]): { passed: number; total: number; status: 'passed' | 'failed' | 'pending' } {
    if (!tests || tests.length === 0) {
      return { passed: 0, total: 0, status: 'pending' }
    }
    
    const enabledTests = tests.filter(t => t.enabled !== false)
    const passedTests = enabledTests.filter(t => t.expected && t.expected.trim() !== '')
    
    const status = passedTests.length === enabledTests.length 
      ? 'passed' 
      : passedTests.length === 0 
        ? 'failed' 
        : 'pending'
    
    return {
      passed: passedTests.length,
      total: enabledTests.length,
      status,
    }
  }

  /**
   * Compare variants across domains for sync status
   */
  async checkSyncStatus(ingredientId: string): Promise<SyncStatus> {
    try {
      const variants = await this.fetchVariantsByIngredient(ingredientId)
      
      if (variants.length === 0) return 'unknown'
      if (variants.length === 1) return 'synced'
      
      // Group variants by population and health system
      const groupedVariants = new Map<string, IngredientVariant[]>()
      
      for (const variant of variants) {
        const key = `${variant.population}-${variant.healthSystem}`
        if (!groupedVariants.has(key)) {
          groupedVariants.set(key, [])
        }
        groupedVariants.get(key)!.push(variant)
      }
      
      // Check for conflicts within each group
      for (const [key, group] of groupedVariants) {
        if (group.length > 1) {
          // Compare versions and content
          const versions = new Set(group.map(v => v.version))
          const lastUpdatedTimes = new Set(group.map(v => v.lastUpdated?.toString()))
          
          if (versions.size > 1) {
            // Different versions across domains
            return 'conflict'
          }
          
          if (lastUpdatedTimes.size > 1) {
            // Different update times might indicate outdated content
            return 'outdated'
          }
        }
      }
      
      return 'synced'
    } catch (error) {
      console.error('Error checking sync status:', error)
      return 'unknown'
    }
  }

  /**
   * Get metadata for a variant
   */
  getVariantMetadata(variant: IngredientVariant): {
    lastUpdated: string
    version: string
    validationStatus: ValidationStatus
    syncStatus: SyncStatus
    testStatus: { passed: number; total: number }
  } {
    const testStatus = this.getTestStatus(variant.tests)
    
    return {
      lastUpdated: variant.lastUpdated 
        ? new Date(variant.lastUpdated).toLocaleDateString() 
        : 'Unknown',
      version: variant.version || '1.0.0',
      validationStatus: this.validateSections(variant),
      syncStatus: variant.syncStatus || 'unknown',
      testStatus,
    }
  }

  /**
   * Update variant in Firebase
   */
  async updateVariant(variantId: string, updates: Partial<IngredientVariant>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, variantId)
      await updateDoc(docRef, {
        ...updates,
        lastUpdated: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error updating variant:', error)
      throw new Error(`Failed to update variant ${variantId}`)
    }
  }

  /**
   * Create new variant in Firebase
   */
  async createVariant(variant: Omit<IngredientVariant, 'id'>): Promise<string> {
    try {
      const docRef = doc(collection(db, this.COLLECTION_NAME))
      await setDoc(docRef, {
        ...variant,
        lastUpdated: Timestamp.now(),
        version: variant.version || '1.0.0',
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating variant:', error)
      throw new Error('Failed to create variant')
    }
  }

  /**
   * Helper: Map Firestore document to IngredientVariant
   */
  private mapDocumentToVariant(id: string, data: DocumentData): IngredientVariant {
    return {
      id,
      ingredientId: data.ingredientId || '',
      ingredientType: (data.ingredientType || 'Other') as IngredientType,
      population: (data.population || 'ADULT') as Population,
      healthSystem: data.healthSystem || '',
      domain: data.domain || '',
      subdomain: data.subdomain || '',
      sections: data.sections || { static: [], dynamic: [] },
      tests: data.tests || [],
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
      validationStatus: (data.validationStatus || 'pending') as ValidationStatus,
      syncStatus: (data.syncStatus || 'unknown') as SyncStatus,
      version: data.version || '1.0.0',
      domainVersions: data.domainVersions || {},
    }
  }

  /**
   * Helper: Check if content is valid HTML
   */
  private isValidHTML(content: string): boolean {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, 'text/html')
      return !doc.querySelector('parsererror')
    } catch {
      return false
    }
  }

  /**
   * Helper: Check for sync conflicts across variants
   */
  private checkSyncConflicts(variants: IngredientVariant[]): boolean {
    if (variants.length <= 1) return false
    
    // Group by population and health system
    const groups = new Map<string, IngredientVariant[]>()
    
    for (const variant of variants) {
      const key = `${variant.population}-${variant.healthSystem}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(variant)
    }
    
    // Check each group for conflicts
    for (const group of groups.values()) {
      if (group.length > 1) {
        const versions = new Set(group.map(v => v.version))
        if (versions.size > 1) {
          return true // Conflict found
        }
      }
    }
    
    return false
  }

  /**
   * Get distinct ingredients (without variants visible)
   */
  getDistinctIngredients(ingredients: Ingredient[]): Ingredient[] {
    // Return ingredients with variants array but not expanded
    return ingredients.map(ing => ({
      ...ing,
      variants: ing.variants || [],
    }))
  }

  /**
   * Filter variants by criteria
   */
  filterVariants(
    variants: IngredientVariant[],
    filters: {
      population?: Population
      healthSystem?: string
      validationStatus?: ValidationStatus
      syncStatus?: SyncStatus
    }
  ): IngredientVariant[] {
    return variants.filter(variant => {
      if (filters.population && variant.population !== filters.population) return false
      if (filters.healthSystem && variant.healthSystem !== filters.healthSystem) return false
      if (filters.validationStatus) {
        const status = this.validateSections(variant)
        if (status !== filters.validationStatus) return false
      }
      if (filters.syncStatus && variant.syncStatus !== filters.syncStatus) return false
      return true
    })
  }
}

// Export singleton instance
export const variantService = new VariantService()