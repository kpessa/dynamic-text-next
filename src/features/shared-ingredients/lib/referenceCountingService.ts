import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import { SharedIngredient } from '@/entities/shared-ingredient';

export interface ReferenceInfo {
  id: string;
  name: string;
  type: string;
  userId?: string;
  timestamp?: Date;
}

export interface OrphanReport {
  orphanedIngredients: string[];
  totalOrphans: number;
  lastChecked: Date;
}

export class ReferenceCountingService {
  private static instance: ReferenceCountingService;
  private readonly COLLECTION_NAME = 'sharedIngredients';
  private readonly REFERENCES_COLLECTION = 'references';

  private constructor() {}

  static getInstance(): ReferenceCountingService {
    if (!ReferenceCountingService.instance) {
      ReferenceCountingService.instance = new ReferenceCountingService();
    }
    return ReferenceCountingService.instance;
  }

  async updateReferenceCount(ingredientId: string): Promise<number> {
    try {
      // Count all documents that reference this ingredient
      const referencesQuery = query(
        collection(db, this.REFERENCES_COLLECTION),
        where('ingredientIds', 'array-contains', ingredientId)
      );

      const snapshot = await getDocs(referencesQuery);
      const count = snapshot.size;

      // Collect reference information
      const references: ReferenceInfo[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unnamed',
          type: data.type || 'document',
          userId: data.userId,
          timestamp: data.updatedAt?.toDate()
        };
      });

      // Update the ingredient's usage statistics
      await updateDoc(doc(db, this.COLLECTION_NAME, ingredientId), {
        'usage.referenceCount': count,
        'usage.lastUsed': serverTimestamp(),
        'usage.references': references
      });

      return count;
    } catch (error) {
      console.error('Error updating reference count:', error);
      throw error;
    }
  }

  async batchUpdateReferenceCounts(ingredientIds: string[]): Promise<Map<string, number>> {
    const counts = new Map<string, number>();

    // Process in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < ingredientIds.length; i += batchSize) {
      const batch = ingredientIds.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (id) => {
          const count = await this.updateReferenceCount(id);
          counts.set(id, count);
        })
      );
    }

    return counts;
  }

  async canDelete(ingredientId: string): Promise<boolean> {
    try {
      const ingredientDoc = await getDoc(doc(db, this.COLLECTION_NAME, ingredientId));
      
      if (!ingredientDoc.exists()) {
        return false;
      }

      const data = ingredientDoc.data();
      const referenceCount = data.usage?.referenceCount || 0;
      
      // Can only delete if no references exist
      return referenceCount === 0;
    } catch (error) {
      console.error('Error checking if ingredient can be deleted:', error);
      return false;
    }
  }

  async findOrphans(): Promise<string[]> {
    try {
      const orphansQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('usage.referenceCount', '==', 0)
      );

      const snapshot = await getDocs(orphansQuery);
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error finding orphaned ingredients:', error);
      return [];
    }
  }

  async generateOrphanReport(): Promise<OrphanReport> {
    const orphanedIngredients = await this.findOrphans();
    
    return {
      orphanedIngredients,
      totalOrphans: orphanedIngredients.length,
      lastChecked: new Date()
    };
  }

  async cleanupOrphans(
    dryRun: boolean = true,
    excludeIds: string[] = []
  ): Promise<{
    deleted: string[];
    skipped: string[];
    errors: string[];
  }> {
    const orphans = await this.findOrphans();
    const toDelete = orphans.filter(id => !excludeIds.includes(id));
    
    const result = {
      deleted: [] as string[],
      skipped: excludeIds,
      errors: [] as string[]
    };

    if (!dryRun) {
      for (const id of toDelete) {
        try {
          // Additional check before deletion
          const canDelete = await this.canDelete(id);
          if (canDelete) {
            // Mark as inactive instead of hard delete
            await updateDoc(doc(db, this.COLLECTION_NAME, id), {
              isActive: false,
              'metadata.deletedAt': serverTimestamp()
            });
            result.deleted.push(id);
          } else {
            result.skipped.push(id);
          }
        } catch (error) {
          console.error(`Error deleting orphan ${id}:`, error);
          result.errors.push(id);
        }
      }
    } else {
      // Dry run - just return what would be deleted
      result.deleted = toDelete;
    }

    return result;
  }

  async trackUsage(
    ingredientId: string,
    referenceId: string,
    action: 'add' | 'remove'
  ): Promise<void> {
    try {
      const ingredientRef = doc(db, this.COLLECTION_NAME, ingredientId);
      const ingredientDoc = await getDoc(ingredientRef);
      
      if (!ingredientDoc.exists()) {
        throw new Error(`Ingredient ${ingredientId} not found`);
      }

      const data = ingredientDoc.data();
      let references = data.usage?.references || [];
      
      if (action === 'add') {
        // Add reference if not already present
        if (!references.find((r: ReferenceInfo) => r.id === referenceId)) {
          references.push({
            id: referenceId,
            name: `Reference ${referenceId}`,
            type: 'document',
            timestamp: new Date()
          });
        }
      } else {
        // Remove reference
        references = references.filter((r: ReferenceInfo) => r.id !== referenceId);
      }

      await updateDoc(ingredientRef, {
        'usage.references': references,
        'usage.referenceCount': references.length,
        'usage.lastUsed': serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking usage:', error);
      throw error;
    }
  }

  async getUsageAnalytics(ingredientId: string): Promise<{
    totalReferences: number;
    uniqueUsers: number;
    lastUsed: Date | null;
    usageByType: Map<string, number>;
    trend: 'increasing' | 'stable' | 'decreasing';
  }> {
    try {
      const ingredientDoc = await getDoc(doc(db, this.COLLECTION_NAME, ingredientId));
      
      if (!ingredientDoc.exists()) {
        throw new Error(`Ingredient ${ingredientId} not found`);
      }

      const data = ingredientDoc.data();
      const references = data.usage?.references || [];
      const referenceCount = data.usage?.referenceCount || 0;
      
      // Calculate unique users
      const uniqueUsers = new Set(
        references
          .map((r: ReferenceInfo) => r.userId)
          .filter((id: string | undefined) => id)
      ).size;

      // Calculate usage by type
      const usageByType = new Map<string, number>();
      references.forEach((ref: ReferenceInfo) => {
        const count = usageByType.get(ref.type) || 0;
        usageByType.set(ref.type, count + 1);
      });

      // Simple trend calculation (would need historical data for real trend)
      const trend = referenceCount > 0 ? 'stable' : 'decreasing';

      return {
        totalReferences: referenceCount,
        uniqueUsers,
        lastUsed: data.usage?.lastUsed?.toDate() || null,
        usageByType,
        trend
      };
    } catch (error) {
      console.error('Error getting usage analytics:', error);
      throw error;
    }
  }

  async getMostUsedIngredients(limit: number = 10): Promise<Array<{
    id: string;
    name: string;
    referenceCount: number;
  }>> {
    try {
      const ingredientsQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(ingredientsQuery);
      
      const ingredients = snapshot.docs
        .map(doc => ({
          id: doc.id,
          name: doc.data().displayName || doc.data().keyname,
          referenceCount: doc.data().usage?.referenceCount || 0
        }))
        .sort((a, b) => b.referenceCount - a.referenceCount)
        .slice(0, limit);

      return ingredients;
    } catch (error) {
      console.error('Error getting most used ingredients:', error);
      return [];
    }
  }
}