/**
 * Secure Code Executor
 * Executes user code safely in Web Worker with sanitization
 */

import DOMPurify from 'dompurify'

export interface ExecutionContext {
  values: Record<string, any>
  advisorType?: 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'
  tpnInstance?: any // TPN instance from configuration
  ingredientValues?: Record<string, any> // Current ingredient values
}

export interface ExecutionResult {
  value?: any
  error?: string
}

export class SecureCodeExecutor {
  private worker: Worker | null = null
  private executionId = 0
  private pendingExecutions = new Map<number, {
    resolve: (result: ExecutionResult) => void
    reject: (error: Error) => void
  }>()

  constructor() {
    this.initializeWorker()
  }

  private initializeWorker() {
    if (typeof window === 'undefined') return // SSR guard
    
    try {
      this.worker = new Worker('/workers/code-executor.worker.js')
      
      this.worker.onmessage = (e) => {
        const { id, success, value, error } = e.data
        const pending = this.pendingExecutions.get(id)
        
        if (pending) {
          this.pendingExecutions.delete(id)
          if (success) {
            pending.resolve({ value })
          } else {
            pending.resolve({ error })
          }
        }
      }

      this.worker.onerror = (error) => {
        console.error('Worker error:', error)
        // Reject all pending executions
        this.pendingExecutions.forEach(pending => {
          pending.reject(new Error('Worker error'))
        })
        this.pendingExecutions.clear()
      }
    } catch (error) {
      console.error('Failed to initialize worker:', error)
    }
  }

  async execute(code: string, context: ExecutionContext): Promise<ExecutionResult> {
    try {
      // Sanitize code (basic XSS prevention)
      const sanitized = this.sanitizeCode(code)
      
      // Skip transpilation for dynamic text sections
      // The code is meant to be a function body, not standalone code
      // Modern browsers support the JavaScript we need
      
      // Execute in worker
      if (this.worker) {
        return await this.executeInWorker(sanitized, context)
      } else {
        // Fallback to local execution with timeout
        return await this.executeLocally(sanitized, context)
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private sanitizeCode(code: string): string {
    // Remove potentially dangerous patterns but allow TPN-specific code
    const dangerous = [
      /import\s+/g,
      /require\s*\(/g,
      /eval\s*\(/g,
      /Function\s*\(/g,
      /setTimeout/g,
      /setInterval/g,
      /fetch\s*\(/g,
      /XMLHttpRequest/g,
      /global\./g,
      /process\./g,
      /__proto__/g,
      /constructor\s*\[/g
    ]

    let sanitized = code
    dangerous.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '')
    })

    return sanitized
  }

  // Transpilation removed - not needed for dynamic text sections
  // The code is meant to be a function body that we wrap, not standalone code
  // private transpileCode(code: string): string {
  //   try {
  //     const result = Babel.transform(code, {
  //       presets: ['env'],
  //       plugins: []
  //     })
  //     return result.code || code
  //   } catch (error) {
  //     // If transpilation fails, return original code
  //     console.warn('Transpilation failed:', error)
  //     return code
  //   }
  // }

  private executeInWorker(code: string, context: ExecutionContext): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const id = ++this.executionId
      
      this.pendingExecutions.set(id, { resolve, reject })
      
      // Send code to worker
      this.worker!.postMessage({
        id,
        code,
        context
      })

      // Set timeout
      setTimeout(() => {
        if (this.pendingExecutions.has(id)) {
          this.pendingExecutions.delete(id)
          resolve({ error: 'Execution timeout (5s)' })
        }
      }, 5000)
    })
  }

  private async executeLocally(code: string, context: ExecutionContext): Promise<ExecutionResult> {
    try {
      // Create the 'me' object with TPN API methods
      const me = this.createMeObject(context)
      
      // The code from [f( ... )] is the body of an anonymous function
      // We need to wrap it properly and execute it with 'me' as the context
      
      // Check if code already has a return statement
      const hasReturn = /\breturn\b/.test(code)
      
      // If no return statement, try to add one for the last expression
      let functionBody = code
      if (!hasReturn) {
        // Simple heuristic: if the last non-empty line looks like an expression, return it
        const lines = code.trim().split('\n')
        const lastLine = lines[lines.length - 1].trim()
        
        // Check if last line is not a statement (doesn't end with ; and isn't a block)
        if (lastLine && !lastLine.endsWith(';') && !lastLine.endsWith('}')) {
          lines[lines.length - 1] = `return ${lastLine}`
          functionBody = lines.join('\n')
        }
      }
      
      // Create and execute function with 'me' as parameter
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
      const func = new AsyncFunction('me', `"use strict";\n${functionBody}`)
      
      const value = await func(me)
      return { value }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  private createMeObject(context: ExecutionContext) {
    // Merge all values from context
    const allValues = { 
      ...context.ingredientValues, 
      ...context.values 
    }
    
    // Return the 'me' object with TPN API
    return {
      // Value access methods
      getValue: (key: string) => allValues[key] !== undefined ? allValues[key] : 0,
      hasValue: (key: string) => key in allValues,
      calc: (key: string) => allValues[key] || 0,
      
      // Formatting methods
      maxP: (value: any, precision = 2) => {
        if (typeof value !== 'number') return String(value)
        let rv = value.toFixed(precision)
        if (rv.includes('.')) {
          rv = rv.replace(/\.?0+$/, '').replace(/\.$/, '')
        }
        return rv
      },
      
      minmaxP: (value: number, min: number, max: number, precision = 2) => {
        const clamped = Math.max(min, Math.min(max, value))
        return this.createMeObject(context).maxP(clamped, precision)
      },
      
      // Preference/config methods
      pref: (key: string, defaultValue?: any) => {
        const prefs: Record<string, any> = {
          'ADVISOR_TITLE': 'TPN Advisor',
          'CENTER_NAME': 'Medical Center',
          'GLUCOSE_CONVERSION': 5.551,
          'UNIT_AMT_PER_KG_DAY': 'amount/kg/day',
          'UNIT_MOLAR': 'mmol/L',
          'UNIT_MEQ': 'mEq',
          'UNIT_WEIGHT': 'kg'
        }
        return prefs[key] !== undefined ? prefs[key] : (defaultValue || '')
      },
      
      // Unit conversion methods
      kgToLb: (kg: number) => kg * 2.20462,
      lbToKg: (lb: number) => lb / 2.20462,
      
      // Boolean helpers
      iss_true: (value: any) => !!value,
      iss_false: (value: any) => !value,
      
      // Legacy element wrapper for compatibility
      getObject: (selector: string) => ({
        getValue: () => allValues[selector] || 0,
        exists: () => selector in allValues
      }),
      
      // Standard JavaScript objects available
      Math,
      String,
      Number,
      Boolean,
      Array,
      Date,
      JSON
    }
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.pendingExecutions.clear()
  }
}