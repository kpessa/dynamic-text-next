import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  QueryConstraint,
  Unsubscribe,
  serverTimestamp,
  addDoc,
  CollectionReference,
  DocumentReference,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore'
import { db } from '@/shared/config/firebase'

export interface ServiceError {
  code: string
  message: string
  originalError?: any
}

export interface ServiceResult<T> {
  data?: T
  error?: ServiceError
}

// Exponential backoff retry logic
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

// Base service class for Firestore operations
export class FirestoreService<T extends DocumentData> {
  protected collectionName: string
  protected collectionRef: CollectionReference<DocumentData>

  constructor(collectionName: string) {
    this.collectionName = collectionName
    this.collectionRef = collection(db, collectionName)
  }

  // Create a new document
  async create(data: Omit<T, 'id'>): Promise<ServiceResult<T>> {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await retryWithBackoff(() => 
        addDoc(this.collectionRef, docData)
      )
      
      const newDoc = await getDoc(docRef)
      return {
        data: { id: docRef.id, ...newDoc.data() } as T
      }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Get a single document by ID
  async getById(id: string): Promise<ServiceResult<T>> {
    try {
      const docRef = doc(this.collectionRef, id)
      const docSnap = await retryWithBackoff(() => getDoc(docRef))
      
      if (docSnap.exists()) {
        return {
          data: { id: docSnap.id, ...docSnap.data() } as T
        }
      } else {
        return {
          error: {
            code: 'not-found',
            message: `Document with ID ${id} not found`
          }
        }
      }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Get all documents with optional constraints
  async getAll(constraints: QueryConstraint[] = []): Promise<ServiceResult<T[]>> {
    try {
      const q = query(this.collectionRef, ...constraints)
      const querySnapshot = await retryWithBackoff(() => getDocs(q))
      
      const documents: T[] = []
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() } as T)
      })
      
      return { data: documents }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Update a document
  async update(id: string, data: Partial<T>): Promise<ServiceResult<T>> {
    try {
      const docRef = doc(this.collectionRef, id)
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      }
      
      await retryWithBackoff(() => updateDoc(docRef, updateData))
      
      const updatedDoc = await getDoc(docRef)
      return {
        data: { id: docRef.id, ...updatedDoc.data() } as T
      }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Delete a document
  async delete(id: string): Promise<ServiceResult<boolean>> {
    try {
      const docRef = doc(this.collectionRef, id)
      await retryWithBackoff(() => deleteDoc(docRef))
      return { data: true }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Subscribe to real-time updates for a collection
  subscribe(
    onUpdate: (data: T[]) => void,
    onError: (error: ServiceError) => void,
    constraints: QueryConstraint[] = []
  ): Unsubscribe {
    const q = query(this.collectionRef, ...constraints)
    
    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const documents: T[] = []
        snapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() } as T)
        })
        onUpdate(documents)
      },
      (error) => {
        onError(this.handleError(error))
      }
    )
  }

  // Subscribe to a single document
  subscribeToDocument(
    id: string,
    onUpdate: (data: T | null) => void,
    onError: (error: ServiceError) => void
  ): Unsubscribe {
    const docRef = doc(this.collectionRef, id)
    
    return onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          onUpdate({ id: snapshot.id, ...snapshot.data() } as T)
        } else {
          onUpdate(null)
        }
      },
      (error) => {
        onError(this.handleError(error))
      }
    )
  }

  // Handle Firestore errors
  protected handleError(error: any): ServiceError {
    console.error(`Firestore error in ${this.collectionName}:`, error)
    
    if (error?.code) {
      switch (error.code) {
        case 'permission-denied':
          return {
            code: error.code,
            message: 'You do not have permission to perform this operation',
            originalError: error
          }
        case 'not-found':
          return {
            code: error.code,
            message: 'The requested resource was not found',
            originalError: error
          }
        case 'unavailable':
          return {
            code: error.code,
            message: 'The service is currently unavailable. Please try again later',
            originalError: error
          }
        default:
          return {
            code: error.code,
            message: error.message || 'An unknown error occurred',
            originalError: error
          }
      }
    }
    
    return {
      code: 'unknown',
      message: 'An unexpected error occurred',
      originalError: error
    }
  }
}

// Helper function to create typed collection reference
export function createCollectionRef<T = DocumentData>(
  collectionName: string
): CollectionReference<T> {
  return collection(db, collectionName) as CollectionReference<T>
}

// Helper function to create typed document reference  
export function createDocRef<T = DocumentData>(
  collectionName: string,
  docId: string
): DocumentReference<T> {
  return doc(db, collectionName, docId) as DocumentReference<T>
}