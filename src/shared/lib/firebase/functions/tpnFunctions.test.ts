import { describe, it, expect } from 'vitest'
import {
  calculateTPNValues,
  validateIngredients,
  optimizeFormula,
  compareFormulas,
} from './tpnFunctions'

describe('tpnFunctions', () => {
  it('should export calculateTPNValues function caller', () => {
    expect(calculateTPNValues).toBeDefined()
    expect(calculateTPNValues).toHaveProperty('call')
    expect(calculateTPNValues).toHaveProperty('callWithRetry')
    expect(calculateTPNValues).toHaveProperty('callWithTimeout')
    expect(typeof calculateTPNValues.call).toBe('function')
    expect(typeof calculateTPNValues.callWithRetry).toBe('function')
    expect(typeof calculateTPNValues.callWithTimeout).toBe('function')
  })

  it('should export validateIngredients function caller', () => {
    expect(validateIngredients).toBeDefined()
    expect(validateIngredients).toHaveProperty('call')
    expect(validateIngredients).toHaveProperty('callWithRetry')
    expect(validateIngredients).toHaveProperty('callWithTimeout')
    expect(typeof validateIngredients.call).toBe('function')
    expect(typeof validateIngredients.callWithRetry).toBe('function')
    expect(typeof validateIngredients.callWithTimeout).toBe('function')
  })

  it('should export optimizeFormula function caller', () => {
    expect(optimizeFormula).toBeDefined()
    expect(optimizeFormula).toHaveProperty('call')
    expect(optimizeFormula).toHaveProperty('callWithRetry')
    expect(optimizeFormula).toHaveProperty('callWithTimeout')
    expect(typeof optimizeFormula.call).toBe('function')
    expect(typeof optimizeFormula.callWithRetry).toBe('function')
    expect(typeof optimizeFormula.callWithTimeout).toBe('function')
  })

  it('should export compareFormulas function caller', () => {
    expect(compareFormulas).toBeDefined()
    expect(compareFormulas).toHaveProperty('call')
    expect(compareFormulas).toHaveProperty('callWithRetry')
    expect(compareFormulas).toHaveProperty('callWithTimeout')
    expect(typeof compareFormulas.call).toBe('function')
    expect(typeof compareFormulas.callWithRetry).toBe('function')
    expect(typeof compareFormulas.callWithTimeout).toBe('function')
  })
})