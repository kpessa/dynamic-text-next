import { GetServerSidePropsContext, GetStaticPropsContext } from 'next'
import { simulationService } from '@/entities/simulation/model/simulationService'
import { referenceService } from '@/entities/reference/model/referenceService'
import { ingredientService } from '@/entities/ingredient/model/ingredientService'
import type { TPNSimulation } from '@/entities/simulation/types'
import type { Reference } from '@/entities/reference/types'
import type { Ingredient } from '@/entities/ingredient/types'

interface SSRResult<T> {
  props: T
  revalidate?: number
}

// Helper for fetching simulations server-side
export async function fetchSimulationsSSR(
  context?: GetServerSidePropsContext
): Promise<SSRResult<{ simulations: TPNSimulation[], error?: string }>> {
  try {
    const result = await simulationService.getAll()
    
    if (result.error) {
      return {
        props: {
          simulations: [],
          error: result.error.message
        }
      }
    }
    
    return {
      props: {
        simulations: result.data || []
      }
    }
  } catch (error) {
    console.error('Error fetching simulations:', error)
    return {
      props: {
        simulations: [],
        error: 'Failed to fetch simulations'
      }
    }
  }
}

// Helper for fetching references server-side
export async function fetchReferencesSSR(
  context?: GetServerSidePropsContext
): Promise<SSRResult<{ references: Reference[], error?: string }>> {
  try {
    const result = await referenceService.getAll()
    
    if (result.error) {
      return {
        props: {
          references: [],
          error: result.error.message
        }
      }
    }
    
    return {
      props: {
        references: result.data || []
      }
    }
  } catch (error) {
    console.error('Error fetching references:', error)
    return {
      props: {
        references: [],
        error: 'Failed to fetch references'
      }
    }
  }
}

// Helper for fetching ingredients server-side
export async function fetchIngredientsSSR(
  context?: GetServerSidePropsContext
): Promise<SSRResult<{ ingredients: Ingredient[], error?: string }>> {
  try {
    const result = await ingredientService.getAll()
    
    if (result.error) {
      return {
        props: {
          ingredients: [],
          error: result.error.message
        }
      }
    }
    
    return {
      props: {
        ingredients: result.data || []
      }
    }
  } catch (error) {
    console.error('Error fetching ingredients:', error)
    return {
      props: {
        ingredients: [],
        error: 'Failed to fetch ingredients'
      }
    }
  }
}

// Helper for static generation with revalidation
export async function fetchSimulationsStatic(
  context?: GetStaticPropsContext
): Promise<SSRResult<{ simulations: TPNSimulation[], error?: string }>> {
  const result = await fetchSimulationsSSR()
  return {
    ...result,
    revalidate: 3600 // Revalidate every hour
  }
}

export async function fetchReferencesStatic(
  context?: GetStaticPropsContext
): Promise<SSRResult<{ references: Reference[], error?: string }>> {
  const result = await fetchReferencesSSR()
  return {
    ...result,
    revalidate: 3600 // Revalidate every hour
  }
}

export async function fetchIngredientsStatic(
  context?: GetStaticPropsContext
): Promise<SSRResult<{ ingredients: Ingredient[], error?: string }>> {
  const result = await fetchIngredientsSSR()
  return {
    ...result,
    revalidate: 3600 // Revalidate every hour
  }
}

// Combined data fetching for pages that need multiple collections
export async function fetchAllDataSSR(
  context?: GetServerSidePropsContext
): Promise<SSRResult<{
  simulations: TPNSimulation[]
  references: Reference[]
  ingredients: Ingredient[]
  error?: string
}>> {
  try {
    const [simResult, refResult, ingResult] = await Promise.all([
      simulationService.getAll(),
      referenceService.getAll(),
      ingredientService.getAll()
    ])
    
    const errors = [
      simResult.error?.message,
      refResult.error?.message,
      ingResult.error?.message
    ].filter(Boolean)
    
    return {
      props: {
        simulations: simResult.data || [],
        references: refResult.data || [],
        ingredients: ingResult.data || [],
        error: errors.length > 0 ? errors.join(', ') : undefined
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return {
      props: {
        simulations: [],
        references: [],
        ingredients: [],
        error: 'Failed to fetch data'
      }
    }
  }
}