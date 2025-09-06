import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyzeAccessResults } from '../testAccess'
import type { AccessTestResult } from '../testAccess'

describe('Firestore Access Testing', () => {
  describe('analyzeAccessResults', () => {
    it('should detect when all operations require authentication', () => {
      const results: AccessTestResult[] = [
        { operation: 'read', success: false, requiresAuth: true },
        { operation: 'write', success: false, requiresAuth: true }
      ]
      
      const analysis = analyzeAccessResults(results)
      expect(analysis.needsAuth).toBe(true)
      expect(analysis.summary).toContain('All operations require authentication')
    })

    it('should detect when some operations require authentication', () => {
      const results: AccessTestResult[] = [
        { operation: 'read', success: true, requiresAuth: false },
        { operation: 'write', success: false, requiresAuth: true }
      ]
      
      const analysis = analyzeAccessResults(results)
      expect(analysis.needsAuth).toBe(true)
      expect(analysis.summary).toContain('Some operations require authentication')
    })

    it('should detect when no authentication is needed', () => {
      const results: AccessTestResult[] = [
        { operation: 'read', success: true, requiresAuth: false },
        { operation: 'write', success: true, requiresAuth: false }
      ]
      
      const analysis = analyzeAccessResults(results)
      expect(analysis.needsAuth).toBe(false)
      expect(analysis.summary).toContain('accessible without authentication')
    })

    it('should detect configuration errors', () => {
      const results: AccessTestResult[] = [
        { operation: 'read', success: false, requiresAuth: false, error: 'Network error' },
        { operation: 'write', success: false, requiresAuth: false, error: 'Network error' }
      ]
      
      const analysis = analyzeAccessResults(results)
      expect(analysis.needsAuth).toBe(false)
      expect(analysis.summary).toContain('Check Firebase configuration')
    })
  })
})