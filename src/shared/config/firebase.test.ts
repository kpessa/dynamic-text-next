import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Firebase modules
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

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({ type: 'functions' })),
  connectFunctionsEmulator: vi.fn()
}))

describe('Firebase Configuration', () => {
  const originalEnv = process.env
  const originalWindow = global.window

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    // @ts-ignore
    delete global.__FIREBASE_EMULATOR_CONNECTED__
  })

  afterEach(() => {
    process.env = originalEnv
    global.window = originalWindow
    vi.clearAllMocks()
  })

  it('should initialize Firebase services including Functions', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key'
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-auth-domain'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id'
    
    const { app, db, auth, storage, functions } = await import('./firebase')
    
    expect(app).toBeDefined()
    expect(db).toBeDefined()
    expect(auth).toBeDefined()
    expect(storage).toBeDefined()
    expect(functions).toBeDefined()
  })

  it('should connect to emulators when enabled', async () => {
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR = 'true'
    
    const { connectFirestoreEmulator } = await import('firebase/firestore')
    const { connectAuthEmulator } = await import('firebase/auth')
    const { connectStorageEmulator } = await import('firebase/storage')
    const { connectFunctionsEmulator } = await import('firebase/functions')
    
    await import('./firebase')
    
    expect(connectFirestoreEmulator).toHaveBeenCalledWith(
      expect.any(Object),
      'localhost',
      8080
    )
    expect(connectAuthEmulator).toHaveBeenCalledWith(
      expect.any(Object),
      'http://localhost:9099'
    )
    expect(connectStorageEmulator).toHaveBeenCalledWith(
      expect.any(Object),
      'localhost',
      9199
    )
    expect(connectFunctionsEmulator).toHaveBeenCalledWith(
      expect.any(Object),
      'localhost',
      5001
    )
  })

  it('should handle initialization errors gracefully', async () => {
    const { initializeApp } = await import('firebase/app')
    const mockError = new Error('Firebase init failed')
    vi.mocked(initializeApp).mockImplementationOnce(() => {
      throw mockError
    })
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    await import('./firebase')
    
    expect(consoleSpy).toHaveBeenCalledWith('Firebase initialization error:', mockError)
    
    consoleSpy.mockRestore()
  })

  it('should not initialize on server side', async () => {
    // @ts-ignore
    delete global.window
    
    const { initializeApp } = await import('firebase/app')
    
    vi.resetModules()
    await import('./firebase')
    
    expect(initializeApp).not.toHaveBeenCalled()
    
    global.window = originalWindow
  })
})