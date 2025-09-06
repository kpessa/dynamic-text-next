import { FirestoreService, ServiceResult } from '@/shared/api/firestore/baseService'
import { 
  query, 
  where, 
  orderBy
} from 'firebase/firestore'
import type { Ingredient, IngredientCategory, PopulationType } from '../types'

export class IngredientService extends FirestoreService<Ingredient> {
  constructor() {
    super('ingredients')
  }

  // Get shared ingredients
  async getShared(): Promise<ServiceResult<Ingredient[]>> {
    return this.getAll([
      where('isShared', '==', true),
      orderBy('displayName', 'asc')
    ])
  }

  // Get ingredients by category
  async getByCategory(category: IngredientCategory): Promise<ServiceResult<Ingredient[]>> {
    return this.getAll([
      where('category', '==', category),
      orderBy('displayName', 'asc')
    ])
  }

  // Get ingredients by health system
  async getByHealthSystem(healthSystem: string): Promise<ServiceResult<Ingredient[]>> {
    return this.getAll([
      where('healthSystem', '==', healthSystem),
      orderBy('displayName', 'asc')
    ])
  }

  // Get ingredients by population type
  async getByPopulationType(populationType: PopulationType): Promise<ServiceResult<Ingredient[]>> {
    return this.getAll([
      where('populationType', '==', populationType),
      orderBy('displayName', 'asc')
    ])
  }

  // Search ingredients by keyname or display name
  async search(searchTerm: string): Promise<ServiceResult<Ingredient[]>> {
    // Firestore doesn't support full-text search natively
    // This would need to be implemented with a search service like Algolia
    // For now, we'll fetch all and filter client-side
    const result = await this.getAll([orderBy('displayName', 'asc')])
    
    if (result.data) {
      const filtered = result.data.filter(ingredient => 
        ingredient.keyname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      return { data: filtered }
    }
    
    return result
  }

  // Share an ingredient (make it available to all)
  async shareIngredient(ingredientId: string): Promise<ServiceResult<Ingredient>> {
    return this.update(ingredientId, { isShared: true })
  }

  // Unshare an ingredient
  async unshareIngredient(ingredientId: string): Promise<ServiceResult<Ingredient>> {
    return this.update(ingredientId, { isShared: false })
  }

  // Bulk create ingredients (useful for imports)
  async bulkCreate(ingredients: Omit<Ingredient, 'id'>[]): Promise<ServiceResult<Ingredient[]>> {
    try {
      const created: Ingredient[] = []
      
      for (const ingredient of ingredients) {
        const result = await this.create(ingredient)
        if (result.data) {
          created.push(result.data)
        } else if (result.error) {
          // Return partial results with error
          return {
            data: created,
            error: result.error
          }
        }
      }
      
      return { data: created }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Check if an ingredient keyname already exists
  async keynameExists(keyname: string, healthSystem?: string): Promise<boolean> {
    const constraints = [where('keyname', '==', keyname)]
    if (healthSystem) {
      constraints.push(where('healthSystem', '==', healthSystem))
    }
    
    const result = await this.getAll(constraints)
    return result.data ? result.data.length > 0 : false
  }
}

// Singleton instance
export const ingredientService = new IngredientService()