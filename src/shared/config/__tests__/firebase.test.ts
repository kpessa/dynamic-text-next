import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isFirebaseInitialized, getFirebaseError } from '../firebase'

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'test-app' }))
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({ type: 'firestore' })),
  connectFirestoreEmulator: vi.fn()
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ type: 'auth' })),
  connectAuthEmulator: vi.fn()
}))

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({ type: 'storage' })),
  connectStorageEmulator: vi.fn()
}))

describe('Firebase Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete globalThis.__FIREBASE_EMULATOR_CONNECTED__
  })

  it('should check if Firebase is initialized', () => {
    const result = isFirebaseInitialized()
    expect(typeof result).toBe('boolean')
  })

  it('should handle Firebase errors properly', () => {
    const error = new Error('Test error')
    const result = getFirebaseError(error)
    expect(result).toBe('Test error')
  })

  it('should handle unknown errors', () => {
    const result = getFirebaseError('Unknown error')
    expect(result).toBe('An unknown Firebase error occurred')
  })

  it('should handle null errors', () => {
    const result = getFirebaseError(null)
    expect(result).toBe('An unknown Firebase error occurred')
  })
})