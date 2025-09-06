import type { 
  Ingredient, 
  BulkOperation, 
  BulkOperationResult,
  ReferenceRange
} from '@/entities/ingredient/types'
import { ingredientService } from '@/entities/ingredient/model/ingredientService'
import { enhancedIngredientService } from './ingredientService'
import { writeBatch, doc } from 'firebase/firestore'
import { db } from '@/shared/config/firebase'

export class BulkOperationsService {
  // Execute bulk operation
  async executeBulk(operation: BulkOperation): Promise<BulkOperationResult> {
    // Dry run mode - just validate without making changes
    if (operation.options?.dryRun) {
      return this.dryRunOperation(operation)
    }

    switch (operation.type) {
      case 'update':
        return this.bulkUpdate(operation)
      case 'delete':
        return this.bulkDelete(operation)
      case 'validate':
        return this.bulkValidate(operation)
      case 'export':
        return this.bulkExport(operation)
      default:
        return {
          success: false,
          processed: 0,
          failed: 0,
          errors: [{ id: 'general', error: 'Unknown operation type' }]
        }
    }
  }

  // Bulk update ingredients
  private async bulkUpdate(operation: BulkOperation): Promise<BulkOperationResult> {
    if (!operation.changes) {
      return {
        success: false,
        processed: 0,
        failed: 0,
        errors: [{ id: 'general', error: 'No changes specified for update' }]
      }
    }

    const errors: Array<{ id: string; error: string }> = []
    let processed = 0
    let failed = 0

    if (operation.options?.transaction) {
      // Use Firestore batch for atomic updates
      const batch = writeBatch(db)

      try {
        for (const id of operation.ingredientIds) {
          const docRef = doc(db, 'ingredients', id)
          const updates = {
            ...operation.changes,
            updatedAt: new Date().toISOString()
          }

          // Validate if not skipped
          if (!operation.options?.skipValidation) {
            const existing = await ingredientService.getById(id)
            if (!existing.data) {
              errors.push({ id, error: 'Ingredient not found' })
              failed++
              continue
            }

            const merged = { ...existing.data, ...updates }
            const validation = await enhancedIngredientService.validateIngredient(merged, false)
            
            if (!validation.valid) {
              errors.push({ id, error: validation.errors.join('; ') })
              failed++
              continue
            }
          }

          batch.update(docRef, updates)
          processed++
        }

        if (processed > 0) {
          await batch.commit()
        }

        return {
          success: failed === 0,
          processed,
          failed,
          errors
        }
      } catch (error) {
        return {
          success: false,
          processed: 0,
          failed: operation.ingredientIds.length,
          errors: [{
            id: 'batch',
            error: error instanceof Error ? error.message : 'Batch update failed'
          }]
        }
      }
    } else {
      // Non-transactional updates
      for (const id of operation.ingredientIds) {
        try {
          if (!operation.options?.skipValidation) {
            const result = await enhancedIngredientService.updateWithValidation(
              id,
              operation.changes
            )
            
            if (result.error) {
              const errorMessage = typeof result.error === 'string' ? result.error : result.error.message
              errors.push({ id, error: errorMessage })
              failed++
            } else {
              processed++
            }
          } else {
            const result = await ingredientService.update(id, {
              ...operation.changes,
              updatedAt: new Date().toISOString()
            })
            
            if (result.error) {
              const errorMessage = typeof result.error === 'string' ? result.error : result.error.message
              errors.push({ id, error: errorMessage })
              failed++
            } else {
              processed++
            }
          }
        } catch (error) {
          errors.push({
            id,
            error: error instanceof Error ? error.message : 'Update failed'
          })
          failed++
        }
      }

      return {
        success: failed === 0,
        processed,
        failed,
        errors
      }
    }
  }

  // Bulk delete ingredients
  private async bulkDelete(operation: BulkOperation): Promise<BulkOperationResult> {
    const errors: Array<{ id: string; error: string }> = []
    let processed = 0
    let failed = 0

    if (operation.options?.transaction) {
      // Use Firestore batch for atomic deletes
      const batch = writeBatch(db)

      try {
        for (const id of operation.ingredientIds) {
          const docRef = doc(db, 'ingredients', id)
          batch.delete(docRef)
          processed++
        }

        await batch.commit()

        return {
          success: true,
          processed,
          failed: 0,
          errors: []
        }
      } catch (error) {
        return {
          success: false,
          processed: 0,
          failed: operation.ingredientIds.length,
          errors: [{
            id: 'batch',
            error: error instanceof Error ? error.message : 'Batch delete failed'
          }]
        }
      }
    } else {
      // Non-transactional deletes
      for (const id of operation.ingredientIds) {
        try {
          const result = await ingredientService.delete(id)
          
          if (result.error) {
            const errorMessage = typeof result.error === 'string' ? result.error : result.error.message
            errors.push({ id, error: errorMessage })
            failed++
          } else {
            processed++
          }
        } catch (error) {
          errors.push({
            id,
            error: error instanceof Error ? error.message : 'Delete failed'
          })
          failed++
        }
      }

      return {
        success: failed === 0,
        processed,
        failed,
        errors
      }
    }
  }

  // Bulk validate ingredients
  private async bulkValidate(operation: BulkOperation): Promise<BulkOperationResult> {
    const errors: Array<{ id: string; error: string }> = []
    let processed = 0
    let failed = 0

    for (const id of operation.ingredientIds) {
      try {
        const result = await ingredientService.getById(id)
        
        if (!result.data) {
          errors.push({ id, error: 'Ingredient not found' })
          failed++
          continue
        }

        const validation = await enhancedIngredientService.validateIngredient(
          result.data,
          false // Don't check uniqueness for existing ingredients
        )

        if (!validation.valid) {
          errors.push({ id, error: validation.errors.join('; ') })
          failed++
        } else {
          processed++
        }
      } catch (error) {
        errors.push({
          id,
          error: error instanceof Error ? error.message : 'Validation failed'
        })
        failed++
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
      errors
    }
  }

  // Bulk export ingredients (returns IDs of successfully exported)
  private async bulkExport(operation: BulkOperation): Promise<BulkOperationResult> {
    const errors: Array<{ id: string; error: string }> = []
    let processed = 0
    let failed = 0

    for (const id of operation.ingredientIds) {
      try {
        const result = await ingredientService.getById(id)
        
        if (!result.data) {
          errors.push({ id, error: 'Ingredient not found' })
          failed++
        } else {
          processed++
        }
      } catch (error) {
        errors.push({
          id,
          error: error instanceof Error ? error.message : 'Export check failed'
        })
        failed++
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
      errors
    }
  }

  // Dry run operation to preview results
  private async dryRunOperation(operation: BulkOperation): Promise<BulkOperationResult> {
    const errors: Array<{ id: string; error: string }> = []
    let processed = 0
    let failed = 0

    for (const id of operation.ingredientIds) {
      try {
        const result = await ingredientService.getById(id)
        
        if (!result.data) {
          errors.push({ id, error: 'Ingredient not found' })
          failed++
          continue
        }

        if (operation.type === 'update' && operation.changes) {
          const merged = { ...result.data, ...operation.changes }
          const validation = await enhancedIngredientService.validateIngredient(merged, false)
          
          if (!validation.valid) {
            errors.push({ id, error: validation.errors.join('; ') })
            failed++
          } else {
            processed++
          }
        } else {
          processed++
        }
      } catch (error) {
        errors.push({
          id,
          error: error instanceof Error ? error.message : 'Dry run failed'
        })
        failed++
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
      errors
    }
  }

  // Bulk update reference ranges
  async bulkUpdateReferenceRanges(
    ingredientIds: string[],
    ranges: ReferenceRange[],
    mergeStrategy: 'replace' | 'merge' | 'keep-existing' = 'merge'
  ): Promise<BulkOperationResult> {
    const errors: Array<{ id: string; error: string }> = []
    let processed = 0
    let failed = 0

    for (const id of ingredientIds) {
      try {
        const existing = await ingredientService.getById(id)
        
        if (!existing.data) {
          errors.push({ id, error: 'Ingredient not found' })
          failed++
          continue
        }

        let newRanges: ReferenceRange[] = []

        switch (mergeStrategy) {
          case 'replace':
            newRanges = ranges
            break
          case 'keep-existing':
            newRanges = existing.data.referenceRanges
            break
          case 'merge':
            // Merge existing with new, preferring new for conflicts
            const merged = [...existing.data.referenceRanges]
            ranges.forEach(newRange => {
              const existingIndex = merged.findIndex(
                r => r.populationType === newRange.populationType
              )
              if (existingIndex >= 0) {
                merged[existingIndex] = newRange
              } else {
                merged.push(newRange)
              }
            })
            newRanges = merged
            break
        }

        const result = await ingredientService.update(id, {
          referenceRanges: newRanges,
          updatedAt: new Date().toISOString()
        })

        if (result.error) {
          const errorMessage = typeof result.error === 'string' ? result.error : result.error.message
          errors.push({ id, error: errorMessage })
          failed++
        } else {
          processed++
        }
      } catch (error) {
        errors.push({
          id,
          error: error instanceof Error ? error.message : 'Range update failed'
        })
        failed++
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
      errors
    }
  }

  // Bulk share/unshare ingredients
  async bulkShareStatus(
    ingredientIds: string[],
    isShared: boolean
  ): Promise<BulkOperationResult> {
    return this.executeBulk({
      type: 'update',
      ingredientIds,
      changes: { isShared },
      options: { transaction: true }
    })
  }

  // Bulk update health system
  async bulkUpdateHealthSystem(
    ingredientIds: string[],
    healthSystem: string
  ): Promise<BulkOperationResult> {
    return this.executeBulk({
      type: 'update',
      ingredientIds,
      changes: { healthSystem },
      options: { transaction: true }
    })
  }

  // Bulk update category
  async bulkUpdateCategory(
    ingredientIds: string[],
    category: Ingredient['category']
  ): Promise<BulkOperationResult> {
    return this.executeBulk({
      type: 'update',
      ingredientIds,
      changes: { category },
      options: { transaction: true }
    })
  }

  // Bulk update type
  async bulkUpdateType(
    ingredientIds: string[],
    type: Ingredient['type']
  ): Promise<BulkOperationResult> {
    return this.executeBulk({
      type: 'update',
      ingredientIds,
      changes: { type },
      options: { transaction: true }
    })
  }

  // Calculate operation impact
  async calculateImpact(operation: BulkOperation): Promise<{
    totalIngredients: number
    affectedIngredients: number
    percentageAffected: number
    estimatedTime: number // in seconds
  }> {
    const allIngredientsResult = await ingredientService.getAll()
    const totalIngredients = allIngredientsResult.data?.length || 0
    const affectedIngredients = operation.ingredientIds.length
    const percentageAffected = totalIngredients > 0 
      ? (affectedIngredients / totalIngredients) * 100 
      : 0

    // Estimate time based on operation type and count
    let timePerItem = 0.1 // seconds
    if (operation.type === 'update') timePerItem = 0.2
    if (operation.type === 'validate') timePerItem = 0.15
    if (operation.options?.skipValidation === false) timePerItem += 0.1

    const estimatedTime = affectedIngredients * timePerItem

    return {
      totalIngredients,
      affectedIngredients,
      percentageAffected,
      estimatedTime
    }
  }
}

// Export singleton instance
export const bulkOperationsService = new BulkOperationsService()