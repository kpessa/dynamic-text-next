/**
 * Service for managing TPN configuration manifests in Firestore
 * Config manifests store references to ingredients and configuration settings
 */

import { FirestoreService, ServiceResult } from '@/shared/api/firestore/baseService'
import { 
  where, 
  orderBy,
  QueryConstraint,
  serverTimestamp
} from 'firebase/firestore'
import type { PopulationType } from '@/entities/ingredient/types'

/**
 * Source tracking for imported configurations
 */
export interface ConfigSource {
  /** Original file path or URL */
  path: string
  
  /** ISO timestamp of import */
  importedAt: string
  
  /** SHA256 hash of original content */
  sha256Hash?: string
  
  /** Original format type */
  originalFormat?: 'legacy' | 'v2' | 'tpn-full'
  
  /** Size in bytes of original file */
  fileSize?: number
  
  /** Import metadata */
  metadata?: Record<string, unknown>
}

/**
 * Configuration settings (FLEX-like values)
 */
export interface ConfigSettings {
  /** Whether FLEX mode is enabled */
  flexEnabled?: boolean
  
  /** Default population type */
  defaultPopulation?: PopulationType
  
  /** Maximum values configuration */
  maxValues?: Record<string, number>
  
  /** Minimum values configuration */
  minValues?: Record<string, number>
  
  /** Default values */
  defaults?: Record<string, unknown>
  
  /** FLEX configurations from original */
  flexConfigs?: Array<{
    name: string
    value: string
    comment?: string
  }>
  
  /** Custom application settings */
  customSettings?: Record<string, unknown>
}

/**
 * Main Config Manifest entity
 * Stores configuration metadata and references to ingredients
 */
export interface ConfigManifest {
  /** Firestore document ID */
  id: string
  
  /** Display name for the configuration */
  name: string
  
  /** Health system identifier */
  healthSystem: string
  
  /** Target population type */
  populationType: PopulationType
  
  /** References to ingredient document IDs */
  ingredientIds: string[]
  
  /** Original ingredient keynames for reference */
  ingredientKeynames?: string[]
  
  /** Configuration settings */
  settings?: ConfigSettings
  
  /** Source tracking information */
  source?: ConfigSource
  
  /** Configuration metadata */
  metadata?: {
    /** Version number */
    version?: string
    /** Creation timestamp */
    createdAt?: string
    /** Last update timestamp */
    updatedAt?: string
    /** Author/system */
    author?: string
    /** Description */
    description?: string
    /** Tags for categorization */
    tags?: string[]
    /** Number of ingredients */
    ingredientCount?: number
  }
  
  /** Whether this config is active/enabled */
  isActive?: boolean
  
  /** Whether this config is a reference/template */
  isReference?: boolean
  
  /** Firebase timestamps */
  createdAt?: ReturnType<typeof serverTimestamp>
  updatedAt?: ReturnType<typeof serverTimestamp>
}

export class ConfigManifestService extends FirestoreService<ConfigManifest> {
  constructor() {
    super('configs')
  }

  /**
   * Create a new config manifest with ingredient references
   * @param manifest - Config manifest to create
   * @param originalContent - Optional original file content for hash generation
   * @param domain - Optional domain (defaults to 'main')
   * @param subdomain - Optional subdomain (defaults to 'build')
   */
  async createManifest(
    manifest: Omit<ConfigManifest, 'id'>,
    originalContent?: string,
    domain: string = 'main',
    subdomain: string = 'build'
  ): Promise<ServiceResult<ConfigManifest>> {
    // Generate SHA256 hash if content provided
    if (originalContent && manifest.source) {
      manifest.source.sha256Hash = this.generateHash(originalContent)
      manifest.source.fileSize = new Blob([originalContent]).size
    }

    // Add metadata
    const enrichedManifest = {
      ...manifest,
      metadata: {
        ...manifest.metadata,
        ingredientCount: manifest.ingredientIds.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      isActive: true
    }

    // Create document ID using naming convention: <health-system>-<domain>-<subdomain>-<population>
    const healthSystem = manifest.healthSystem.toLowerCase().replace(/\s+/g, '-')
    const population = manifest.populationType.toLowerCase()
    const documentId = `${healthSystem}-${domain}-${subdomain}-${population}`

    return this.createWithId(documentId, enrichedManifest)
  }

  /**
   * Get configs by health system
   */
  async getByHealthSystem(healthSystem: string): Promise<ServiceResult<ConfigManifest[]>> {
    return this.getAll([
      where('healthSystem', '==', healthSystem),
      orderBy('name', 'asc')
    ])
  }

  /**
   * Get configs by population type
   */
  async getByPopulationType(populationType: PopulationType): Promise<ServiceResult<ConfigManifest[]>> {
    return this.getAll([
      where('populationType', '==', populationType),
      orderBy('name', 'asc')
    ])
  }

  /**
   * Get reference configs (templates)
   */
  async getReferenceConfigs(): Promise<ServiceResult<ConfigManifest[]>> {
    return this.getAll([
      where('isReference', '==', true),
      orderBy('healthSystem', 'asc'),
      orderBy('populationType', 'asc')
    ])
  }

  /**
   * Get active configs
   */
  async getActiveConfigs(): Promise<ServiceResult<ConfigManifest[]>> {
    return this.getAll([
      where('isActive', '==', true),
      orderBy('updatedAt', 'desc')
    ])
  }

  /**
   * Search configs by name or health system
   */
  async searchConfigs(searchTerm: string): Promise<ServiceResult<ConfigManifest[]>> {
    // Firestore doesn't support full-text search natively
    // Fetch all and filter client-side
    const result = await this.getAll([orderBy('name', 'asc')])
    
    if (result.data) {
      const filtered = result.data.filter(config => 
        config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.healthSystem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.metadata?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.metadata?.tags?.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      return { data: filtered }
    }
    
    return result
  }

  /**
   * Add ingredients to a config
   */
  async addIngredients(
    configId: string, 
    ingredientIds: string[],
    ingredientKeynames?: string[]
  ): Promise<ServiceResult<ConfigManifest>> {
    const configResult = await this.getById(configId)
    
    if (!configResult.data) {
      return {
        error: {
          code: 'not-found',
          message: `Config ${configId} not found`
        }
      }
    }

    const config = configResult.data
    const updatedIngredientIds = [...new Set([...config.ingredientIds, ...ingredientIds])]
    const updatedKeynames = ingredientKeynames ? 
      [...new Set([...(config.ingredientKeynames || []), ...ingredientKeynames])] :
      config.ingredientKeynames

    return this.update(configId, {
      ingredientIds: updatedIngredientIds,
      ingredientKeynames: updatedKeynames,
      metadata: {
        ...config.metadata,
        ingredientCount: updatedIngredientIds.length,
        updatedAt: new Date().toISOString()
      }
    })
  }

  /**
   * Remove ingredients from a config
   */
  async removeIngredients(
    configId: string, 
    ingredientIds: string[]
  ): Promise<ServiceResult<ConfigManifest>> {
    const configResult = await this.getById(configId)
    
    if (!configResult.data) {
      return {
        error: {
          code: 'not-found',
          message: `Config ${configId} not found`
        }
      }
    }

    const config = configResult.data
    const ingredientIdSet = new Set(ingredientIds)
    const updatedIngredientIds = config.ingredientIds.filter(id => !ingredientIdSet.has(id))

    return this.update(configId, {
      ingredientIds: updatedIngredientIds,
      metadata: {
        ...config.metadata,
        ingredientCount: updatedIngredientIds.length,
        updatedAt: new Date().toISOString()
      }
    })
  }

  /**
   * Clone a config manifest
   */
  async cloneConfig(
    configId: string,
    newName: string,
    modifications?: Partial<ConfigManifest>
  ): Promise<ServiceResult<ConfigManifest>> {
    const originalResult = await this.getById(configId)
    
    if (!originalResult.data) {
      return {
        error: {
          code: 'not-found',
          message: `Config ${configId} not found`
        }
      }
    }

    const original = originalResult.data
    const cloned: Omit<ConfigManifest, 'id'> = {
      ...original,
      name: newName,
      ...modifications,
      source: {
        ...original.source,
        path: `cloned-from:${configId}`,
        importedAt: new Date().toISOString(),
        metadata: {
          clonedFrom: configId,
          originalName: original.name
        }
      },
      metadata: {
        ...original.metadata,
        ...modifications?.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: `Cloned from ${original.name}`
      },
      isReference: false // Clones are not references by default
    }

    // id field is already excluded by using Omit<ConfigManifest, 'id'>

    return this.create(cloned)
  }

  /**
   * Check if a config with the same name and health system exists
   */
  async configExists(
    name: string, 
    healthSystem: string,
    populationType?: PopulationType
  ): Promise<boolean> {
    const constraints: QueryConstraint[] = [
      where('name', '==', name),
      where('healthSystem', '==', healthSystem)
    ]
    
    if (populationType) {
      constraints.push(where('populationType', '==', populationType))
    }
    
    const result = await this.getAll(constraints)
    return result.data ? result.data.length > 0 : false
  }

  /**
   * Get configs that reference a specific ingredient
   */
  async getConfigsByIngredient(ingredientId: string): Promise<ServiceResult<ConfigManifest[]>> {
    return this.getAll([
      where('ingredientIds', 'array-contains', ingredientId),
      orderBy('name', 'asc')
    ])
  }

  /**
   * Update config settings (FLEX values)
   */
  async updateSettings(
    configId: string,
    settings: ConfigSettings
  ): Promise<ServiceResult<ConfigManifest>> {
    return this.update(configId, {
      settings: settings,
      metadata: {
        updatedAt: new Date().toISOString()
      }
    } as Partial<ConfigManifest>)
  }

  /**
   * Mark config as active/inactive
   */
  async setActiveStatus(
    configId: string,
    isActive: boolean
  ): Promise<ServiceResult<ConfigManifest>> {
    return this.update(configId, { isActive })
  }

  /**
   * Generate SHA256 hash of content
   */
  private generateHash(content: string): string {
    // For browser environment, we'll use a simple hash
    // In production, consider using SubtleCrypto API
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  }

  /**
   * Get statistics for configs
   */
  async getConfigStats(): Promise<{
    total: number
    byHealthSystem: Record<string, number>
    byPopulation: Record<string, number>
    active: number
    reference: number
  }> {
    const result = await this.getAll()
    
    if (!result.data) {
      return {
        total: 0,
        byHealthSystem: {},
        byPopulation: {},
        active: 0,
        reference: 0
      }
    }

    const configs = result.data
    const stats = {
      total: configs.length,
      byHealthSystem: {} as Record<string, number>,
      byPopulation: {} as Record<string, number>,
      active: configs.filter(c => c.isActive).length,
      reference: configs.filter(c => c.isReference).length
    }

    configs.forEach(config => {
      // Count by health system
      stats.byHealthSystem[config.healthSystem] = 
        (stats.byHealthSystem[config.healthSystem] || 0) + 1
      
      // Count by population
      stats.byPopulation[config.populationType] = 
        (stats.byPopulation[config.populationType] || 0) + 1
    })

    return stats
  }
}

// Singleton instance
export const configManifestService = new ConfigManifestService()