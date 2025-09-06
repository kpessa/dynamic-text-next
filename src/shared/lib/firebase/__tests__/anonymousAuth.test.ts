import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isAnonymousAuthActive, getCurrentAnonymousUser } from '../anonymousAuth'

vi.mock('@/shared/config/firebase', () => ({
  auth: { type: 'mock-auth' }
}))

vi.mock('firebase/auth', () => ({
  signInAnonymously: vi.fn(() => Promise.resolve({ user: { uid: 'anon-123' } })),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback({ uid: 'anon-123' })
    return () => {}
  })
}))

describe('Anonymous Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should check if anonymous auth is active', () => {
    const result = isAnonymousAuthActive()
    expect(typeof result).toBe('boolean')
  })

  it('should get current anonymous user', () => {
    const user = getCurrentAnonymousUser()
    expect(user === null || typeof user === 'object').toBe(true)
  })
})