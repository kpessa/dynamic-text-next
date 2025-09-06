import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/shared/config/firebase'

let isInitialized = false
let currentUser: User | null = null

export async function initializeAnonymousAccess(): Promise<void> {
  if (!auth || isInitialized) {
    return
  }

  try {
    const result = await signInAnonymously(auth)
    currentUser = result.user
    isInitialized = true
    console.log('Anonymous access initialized')
    
    onAuthStateChanged(auth, (user) => {
      currentUser = user
      if (!user && isInitialized) {
        console.log('Anonymous session expired, re-authenticating...')
        signInAnonymously(auth).catch(console.error)
      }
    })
  } catch (error) {
    console.error('Anonymous auth failed:', error)
    throw error
  }
}

export function isAnonymousAuthActive(): boolean {
  return isInitialized && !!currentUser
}

export function getCurrentAnonymousUser(): User | null {
  return currentUser
}