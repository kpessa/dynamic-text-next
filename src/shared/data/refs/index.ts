/**
 * Reference TPN Configurations
 * These are example configurations from different health systems and populations
 */

// Import schema
import schema from './schema.json'

// Config file mappings
export const configFiles = {
  adolescent: {
    'build-main-choc': () => import('./adolescent-build-main-choc.json'),
    'cert-east-uhs': () => import('./adolescent-cert-east-uhs.json')
  },
  adult: {
    'cert-east-uhs': () => import('./adult-cert-east-uhs.json')
  },
  child: {
    'build-main-choc': () => import('./child-build-main-choc.json'),
    'cert-east-uhs': () => import('./child-cert-east-uhs.json')
  },
  neo: {
    'build-main-choc': () => import('./neo-build-main-choc.json'),
    'cert-east-uhs': () => import('./neo-cert-east-uhs.json')
  }
} as const

export type PopulationType = keyof typeof configFiles
export type ConfigKey<T extends PopulationType> = keyof typeof configFiles[T]

/**
 * Load a specific configuration file
 */
export async function loadConfig<T extends PopulationType>(
  population: T,
  config: ConfigKey<T>
): Promise<any> {
  const loader = configFiles[population][config]
  if (!loader) {
    throw new Error(`Config not found: ${population}/${config}`)
  }
  const module = await loader()
  return module.default || module
}

/**
 * Get all available configurations
 */
export function getAvailableConfigs() {
  const results: Array<{
    population: string
    healthSystem: string
    domain: string
    subdomain: string
    key: string
  }> = []

  Object.entries(configFiles).forEach(([population, configMap]) => {
    Object.keys(configMap).forEach(key => {
      const [domain, subdomain, healthSystem] = key.split('-')
      results.push({
        population,
        healthSystem: healthSystem || '',
        domain: domain || '',
        subdomain: subdomain || '',
        key: `${population}/${key}`
      })
    })
  })

  return results
}

/**
 * Parse health system and domain from filename
 */
export function parseConfigFilename(filename: string) {
  // Format: population-domain-subdomain-healthsystem.json
  // e.g., adolescent-build-main-choc.json
  const parts = filename.replace('.json', '').split('-')
  
  return {
    population: parts[0],
    domain: parts[1],
    subdomain: parts[2],
    healthSystem: parts[3]?.toUpperCase() || ''
  }
}

export { schema }

// Type for the TPN configuration structure based on schema
export interface TPNConfiguration {
  healthSystem?: string
  domain?: string
  subdomain?: string
  version?: string
  INGREDIENT: Array<{
    KEYNAME: string
    DISPLAY: string
    MNEMONIC?: string
    UOM_DISP?: string
    TYPE?: 'Macronutrient' | 'Micronutrient' | 'Additive' | 'Salt' | 'Diluent' | 'Other'
    OSMO_RATIO?: number
    EDITMODE?: string
    PRECISION?: number
    NOTE?: Array<{
      TEXT: string
    }>
    [key: string]: any
  }>
}