/**
 * Web Worker for secure code execution
 * Runs user code in isolated context with timeout
 */

// Message handler
self.onmessage = async function(e) {
  const { code, context, id } = e.data
  
  try {
    // Create safe context object
    const safeContext = {
      // TPN Values
      getValue: (key) => {
        if (context.values && key in context.values) {
          return context.values[key]
        }
        return undefined
      },
      hasValue: (key) => {
        return context.values && key in context.values
      },
      maxP: (value, precision = 2) => {
        if (typeof value !== 'number') return ''
        return value.toFixed(precision)
      },
      // Math functions
      Math: Math,
      // String functions
      String: String,
      Number: Number,
      Boolean: Boolean,
      // Array functions
      Array: Array,
      // Date (limited)
      Date: Date,
      // JSON
      JSON: JSON
    }

    // Create function from code
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
    const func = new AsyncFunction(
      ...Object.keys(safeContext),
      `
      "use strict";
      ${code}
      `
    )

    // Execute with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Code execution timeout (5s)')), 5000)
    })

    const executionPromise = func(...Object.values(safeContext))

    const result = await Promise.race([executionPromise, timeoutPromise])

    // Send success result
    self.postMessage({
      id,
      success: true,
      value: result
    })
  } catch (error) {
    // Send error result
    self.postMessage({
      id,
      success: false,
      error: error.message || 'Unknown error occurred'
    })
  }
}