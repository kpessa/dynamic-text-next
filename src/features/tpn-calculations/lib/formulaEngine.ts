import { FormulaParser } from './formulaParser'
import { VariableResolver } from './variableResolver'
import { FormulaValidator } from './formulaValidator'
import { UnitConverter } from '../../../shared/lib/unitConverter'

export interface CalculationResult {
  value?: number
  error?: string
  cached?: boolean
  warnings?: string[]
}

export interface CalculationOptions {
  defaults?: Record<string, any>
  skipValidation?: boolean
  skipCache?: boolean
}

interface CacheEntry {
  value: number
  timestamp: number
}

export class FormulaEngine {
  private parser: FormulaParser
  private resolver: VariableResolver
  private validator: FormulaValidator
  private converter: UnitConverter
  private cache: Map<string, CacheEntry>
  private cacheMaxAge: number = 5 * 60 * 1000 // 5 minutes
  private cacheMaxSize: number = 1000

  constructor() {
    this.parser = new FormulaParser()
    this.resolver = new VariableResolver()
    this.validator = new FormulaValidator()
    this.converter = new UnitConverter()
    this.cache = new Map()
  }

  /**
   * Calculate a single formula
   */
  async calculate(
    formula: string,
    context: Record<string, any> = {},
    options: CalculationOptions = {}
  ): Promise<CalculationResult> {
    try {
      // Create enhanced context with unit converter
      const enhancedContext = {
        ...context,
        ...options.defaults,
        convert: (value: number, from: string, to: string) => {
          return this.converter.convert(value, from, to)
        }
      }

      // Validation
      if (!options.skipValidation) {
        const validation = this.validator.validate(formula, enhancedContext)
        if (!validation.isValid) {
          return {
            error: validation.errors[0]?.message || 'Invalid formula',
            warnings: validation.warnings.map(w => w.message)
          }
        }
      }

      // Check cache
      if (!options.skipCache) {
        const cacheKey = this.getCacheKey(formula, enhancedContext)
        const cached = this.getFromCache(cacheKey)
        if (cached !== undefined) {
          return { value: cached, cached: true }
        }
      }

      // Calculate
      const value = this.parser.evaluate(formula, enhancedContext)

      // Cache result
      if (!options.skipCache) {
        const cacheKey = this.getCacheKey(formula, enhancedContext)
        this.addToCache(cacheKey, value)
      }

      return { value, cached: false }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  /**
   * Calculate multiple formulas with dependency resolution
   */
  async calculateBatch(
    formulas: Map<string, string>,
    context: Record<string, any> = {},
    options: CalculationOptions = {}
  ): Promise<Map<string, CalculationResult>> {
    const results = new Map<string, CalculationResult>()

    // Validate for circular dependencies
    const validation = this.validator.validateFormulas(formulas)
    if (!validation.isValid) {
      // Return error for all formulas
      for (const [name] of formulas) {
        results.set(name, { error: 'Circular dependency detected' })
      }
      return results
    }

    // Build dependency graph
    const dependencies = this.buildDependencyGraph(formulas)
    
    // Topological sort
    const sortedNames = this.topologicalSort(dependencies)

    // Create extended context with formula results
    const extendedContext = { ...context }

    // Calculate in dependency order
    for (const name of sortedNames) {
      const formula = formulas.get(name)
      if (!formula) continue

      const result = await this.calculate(formula, extendedContext, options)
      results.set(name, result)

      // Add successful results to context for dependent formulas
      if (result.value !== undefined) {
        extendedContext[name] = result.value
      }
    }

    return results
  }

  /**
   * Clear the calculation cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size
  }


  /**
   * Build dependency graph from formulas
   */
  private buildDependencyGraph(formulas: Map<string, string>): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>()

    for (const [name, formula] of formulas) {
      const variables = this.resolver.extractVariables(formula)
      const dependencies = new Set<string>()

      for (const variable of variables) {
        // Check if variable is another formula
        if (formulas.has(variable)) {
          dependencies.add(variable)
        }
      }

      graph.set(name, dependencies)
    }

    return graph
  }

  /**
   * Topological sort for dependency resolution
   */
  private topologicalSort(graph: Map<string, Set<string>>): string[] {
    const sorted: string[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (node: string): void => {
      if (visited.has(node)) return
      if (visiting.has(node)) {
        throw new Error(`Circular dependency detected at ${node}`)
      }

      visiting.add(node)

      const dependencies = graph.get(node) || new Set()
      for (const dep of dependencies) {
        visit(dep)
      }

      visiting.delete(node)
      visited.add(node)
      sorted.push(node)
    }

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        visit(node)
      }
    }

    return sorted
  }

  /**
   * Generate cache key
   */
  private getCacheKey(formula: string, context: Record<string, any>): string {
    // Extract variables used in formula
    const variables = this.resolver.extractVariables(formula)
    
    // Build context subset with only used variables
    const relevantContext: Record<string, any> = {}
    for (const variable of variables) {
      const value = this.resolver.resolve(variable, context)
      if (value !== undefined) {
        relevantContext[variable] = value
      }
    }

    // Create stable key
    return `${formula}::${JSON.stringify(relevantContext, Object.keys(relevantContext).sort())}`
  }

  /**
   * Get value from cache
   */
  private getFromCache(key: string): number | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    // Check if expired
    if (Date.now() - entry.timestamp > this.cacheMaxAge) {
      this.cache.delete(key)
      return undefined
    }

    return entry.value
  }

  /**
   * Add value to cache
   */
  private addToCache(key: string, value: number): void {
    // Enforce max size (simple LRU)
    if (this.cache.size >= this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }
}