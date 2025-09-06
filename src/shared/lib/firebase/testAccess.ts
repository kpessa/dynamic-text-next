import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc,
  getDocs,
  query,
  limit 
} from 'firebase/firestore'
import { db } from '@/shared/config/firebase'

export interface AccessTestResult {
  operation: string
  success: boolean
  requiresAuth: boolean
  error?: string
}

export async function testFirestoreAccess(): Promise<AccessTestResult[]> {
  const results: AccessTestResult[] = []
  
  if (!db) {
    return [{
      operation: 'initialization',
      success: false,
      requiresAuth: false,
      error: 'Firestore not initialized'
    }]
  }

  // Test 1: Read from a collection
  try {
    const testCollection = collection(db, 'test-access')
    const q = query(testCollection, limit(1))
    await getDocs(q)
    
    results.push({
      operation: 'read-collection',
      success: true,
      requiresAuth: false
    })
  } catch (error: any) {
    results.push({
      operation: 'read-collection',
      success: false,
      requiresAuth: error.code === 'permission-denied',
      error: error.message
    })
  }

  // Test 2: Read a specific document
  try {
    const testDoc = doc(db, 'test-access', 'test-doc')
    await getDoc(testDoc)
    
    results.push({
      operation: 'read-document',
      success: true,
      requiresAuth: false
    })
  } catch (error: any) {
    results.push({
      operation: 'read-document',
      success: false,
      requiresAuth: error.code === 'permission-denied',
      error: error.message
    })
  }

  // Test 3: Write a new document
  try {
    const testCollection = collection(db, 'test-access')
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Testing write access'
    }
    await addDoc(testCollection, testData)
    
    results.push({
      operation: 'write-new-document',
      success: true,
      requiresAuth: false
    })
  } catch (error: any) {
    results.push({
      operation: 'write-new-document',
      success: false,
      requiresAuth: error.code === 'permission-denied',
      error: error.message
    })
  }

  // Test 4: Update existing document
  try {
    const testDoc = doc(db, 'test-access', 'test-update')
    const testData = {
      updated: true,
      timestamp: new Date().toISOString()
    }
    await setDoc(testDoc, testData)
    
    results.push({
      operation: 'update-document',
      success: true,
      requiresAuth: false
    })
  } catch (error: any) {
    results.push({
      operation: 'update-document',
      success: false,
      requiresAuth: error.code === 'permission-denied',
      error: error.message
    })
  }

  return results
}

export function analyzeAccessResults(results: AccessTestResult[]): {
  needsAuth: boolean
  summary: string
} {
  const authRequired = results.some(r => r.requiresAuth)
  const allFailed = results.every(r => !r.success)
  
  let summary = ''
  
  if (allFailed && authRequired) {
    summary = 'All operations require authentication. Anonymous auth needed.'
  } else if (authRequired) {
    summary = 'Some operations require authentication. Partial anonymous auth may be needed.'
  } else if (allFailed) {
    summary = 'Operations failed but not due to auth. Check Firebase configuration.'
  } else {
    summary = 'Firestore accessible without authentication.'
  }
  
  return {
    needsAuth: authRequired,
    summary
  }
}