import { FirestoreService, ServiceResult } from '@/shared/api/firestore/baseService'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/shared/config/firebase'
import type { Reference, ReferenceDocument, PopulationType } from '../types'

export class ReferenceService extends FirestoreService<Reference> {
  constructor() {
    super('references')
  }

  // Get references by health system
  async getByHealthSystem(healthSystem: string): Promise<ServiceResult<Reference[]>> {
    return this.getAll([
      where('healthSystem', '==', healthSystem),
      orderBy('updatedAt', 'desc')
    ])
  }

  // Get references by population type
  async getByPopulationType(populationType: PopulationType): Promise<ServiceResult<Reference[]>> {
    return this.getAll([
      where('populationType', '==', populationType),
      orderBy('updatedAt', 'desc')
    ])
  }

  // Get validated references only
  async getValidated(): Promise<ServiceResult<Reference[]>> {
    return this.getAll([
      where('validationStatus', '==', 'validated'),
      orderBy('validatedAt', 'desc')
    ])
  }

  // Get reference sections (subcollection)
  async getSections(referenceId: string): Promise<ServiceResult<ReferenceDocument[]>> {
    try {
      const sectionsRef = collection(db, 'references', referenceId, 'sections')
      const q = query(sectionsRef, orderBy('order', 'asc'))
      const snapshot = await getDocs(q)
      
      const sections: ReferenceDocument[] = []
      snapshot.forEach((doc) => {
        sections.push({
          id: doc.id,
          referenceId,
          ...doc.data()
        } as ReferenceDocument)
      })
      
      return { data: sections }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Add a section to a reference
  async addSection(
    referenceId: string,
    section: Omit<ReferenceDocument, 'id' | 'referenceId'>
  ): Promise<ServiceResult<ReferenceDocument>> {
    try {
      const sectionsRef = collection(db, 'references', referenceId, 'sections')
      const docRef = await addDoc(sectionsRef, {
        ...section,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      const newDoc = await getDoc(docRef)
      return {
        data: {
          id: docRef.id,
          referenceId,
          ...newDoc.data()
        } as ReferenceDocument
      }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Update a section
  async updateSection(
    referenceId: string,
    sectionId: string,
    data: Partial<ReferenceDocument>
  ): Promise<ServiceResult<ReferenceDocument>> {
    try {
      const sectionRef = doc(db, 'references', referenceId, 'sections', sectionId)
      await updateDoc(sectionRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
      
      const updatedDoc = await getDoc(sectionRef)
      return {
        data: {
          id: sectionId,
          referenceId,
          ...updatedDoc.data()
        } as ReferenceDocument
      }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Delete a section
  async deleteSection(referenceId: string, sectionId: string): Promise<ServiceResult<boolean>> {
    try {
      const sectionRef = doc(db, 'references', referenceId, 'sections', sectionId)
      await deleteDoc(sectionRef)
      return { data: true }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Validate a reference
  async validate(referenceId: string, validatedBy: string): Promise<ServiceResult<Reference>> {
    return this.update(referenceId, {
      validationStatus: 'validated',
      validatedAt: new Date().toISOString(),
      validatedBy
    })
  }

  // Archive a reference
  async archive(referenceId: string): Promise<ServiceResult<Reference>> {
    return this.update(referenceId, {
      validationStatus: 'archived'
    })
  }
}

// Singleton instance
export const referenceService = new ReferenceService()