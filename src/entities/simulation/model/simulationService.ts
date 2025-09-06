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
import type { TPNSimulation, SimulationSection } from '../types'

export class SimulationService extends FirestoreService<TPNSimulation> {
  constructor() {
    super('tpnSimulations')
  }

  // Get simulations by advisor type
  async getByAdvisorType(advisorType: string): Promise<ServiceResult<TPNSimulation[]>> {
    return this.getAll([
      where('advisorType', '==', advisorType),
      orderBy('updatedAt', 'desc')
    ])
  }

  // Get simulations by health system
  async getByHealthSystem(healthSystem: string): Promise<ServiceResult<TPNSimulation[]>> {
    return this.getAll([
      where('healthSystem', '==', healthSystem),
      orderBy('updatedAt', 'desc')
    ])
  }

  // Get sections for a simulation (subcollection)
  async getSections(simulationId: string): Promise<ServiceResult<SimulationSection[]>> {
    try {
      const sectionsRef = collection(db, 'tpnSimulations', simulationId, 'sections')
      const q = query(sectionsRef, orderBy('order', 'asc'))
      const snapshot = await getDocs(q)
      
      const sections: SimulationSection[] = []
      snapshot.forEach((doc) => {
        sections.push({
          id: doc.id,
          simulationId,
          ...doc.data()
        } as SimulationSection)
      })
      
      return { data: sections }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Add a section to a simulation
  async addSection(
    simulationId: string,
    section: Omit<SimulationSection, 'id' | 'simulationId'>
  ): Promise<ServiceResult<SimulationSection>> {
    try {
      const sectionsRef = collection(db, 'tpnSimulations', simulationId, 'sections')
      const docRef = await addDoc(sectionsRef, {
        ...section,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      const newDoc = await getDoc(docRef)
      return {
        data: {
          id: docRef.id,
          simulationId,
          ...newDoc.data()
        } as SimulationSection
      }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Update a section
  async updateSection(
    simulationId: string,
    sectionId: string,
    data: Partial<SimulationSection>
  ): Promise<ServiceResult<SimulationSection>> {
    try {
      const sectionRef = doc(db, 'tpnSimulations', simulationId, 'sections', sectionId)
      await updateDoc(sectionRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
      
      const updatedDoc = await getDoc(sectionRef)
      return {
        data: {
          id: sectionId,
          simulationId,
          ...updatedDoc.data()
        } as SimulationSection
      }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Delete a section
  async deleteSection(simulationId: string, sectionId: string): Promise<ServiceResult<boolean>> {
    try {
      const sectionRef = doc(db, 'tpnSimulations', simulationId, 'sections', sectionId)
      await deleteDoc(sectionRef)
      return { data: true }
    } catch (error) {
      return {
        error: this.handleError(error)
      }
    }
  }

  // Run test cases for a simulation
  async runTests(simulationId: string): Promise<ServiceResult<TPNSimulation>> {
    // This would integrate with the test runner
    // For now, just return the simulation
    return this.getById(simulationId)
  }
}

// Singleton instance
export const simulationService = new SimulationService()