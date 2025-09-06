import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
}

let app: ReturnType<typeof initializeApp>
let db: ReturnType<typeof getFirestore>
let auth: ReturnType<typeof getAuth>
let storage: ReturnType<typeof getStorage>
let functions: ReturnType<typeof getFunctions>

const isEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
const isServer = typeof window === 'undefined'

if (!isServer) {
  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
    storage = getStorage(app)
    functions = getFunctions(app)

    if (isEmulator && !globalThis.__FIREBASE_EMULATOR_CONNECTED__) {
      connectFirestoreEmulator(db, 'localhost', 8080)
      connectAuthEmulator(auth, 'http://localhost:9099')
      connectStorageEmulator(storage, 'localhost', 9199)
      connectFunctionsEmulator(functions, 'localhost', 5001)
      globalThis.__FIREBASE_EMULATOR_CONNECTED__ = true
      console.log('Connected to Firebase emulators')
    }

    console.log('Firebase initialized successfully')
  } catch (error) {
    console.error('Firebase initialization error:', error)
  }
}

declare global {
  var __FIREBASE_EMULATOR_CONNECTED__: boolean | undefined
}

export { app, db, auth, storage, functions }

export const isFirebaseInitialized = () => {
  return !isServer && !!app
}

export const getFirebaseError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown Firebase error occurred'
}