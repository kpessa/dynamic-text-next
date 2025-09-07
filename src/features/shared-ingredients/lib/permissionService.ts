import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import { IngredientPermissions, PermissionLevel } from '@/entities/shared-ingredient';

export class PermissionService {
  private static instance: PermissionService;

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  async checkPermission(
    ingredientId: string,
    userId: string,
    action: PermissionLevel
  ): Promise<boolean> {
    const ingredientDoc = await getDoc(doc(db, 'sharedIngredients', ingredientId));
    if (!ingredientDoc.exists()) return false;
    
    const permissions = ingredientDoc.data().permissions as IngredientPermissions;
    if (!permissions) return false;
    
    // Check scope first
    if (permissions.scope === 'public' && action === 'view') return true;
    
    // Check direct permission
    if (permissions[action].includes(userId)) return true;
    
    // Check role-based permission
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some(role => permissions[action].includes(role));
  }

  private async getUserRoles(userId: string): Promise<string[]> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return [];
    return userDoc.data().roles || [];
  }

  async grantPermission(
    ingredientId: string,
    userId: string,
    level: PermissionLevel
  ): Promise<void> {
    const ingredientRef = doc(db, 'sharedIngredients', ingredientId);
    const ingredientDoc = await getDoc(ingredientRef);
    
    if (!ingredientDoc.exists()) throw new Error('Ingredient not found');
    
    const permissions = ingredientDoc.data().permissions as IngredientPermissions;
    if (!permissions[level].includes(userId)) {
      permissions[level].push(userId);
      await this.updatePermissions(ingredientId, permissions);
    }
  }

  async revokePermission(
    ingredientId: string,
    userId: string,
    level: PermissionLevel
  ): Promise<void> {
    const ingredientRef = doc(db, 'sharedIngredients', ingredientId);
    const ingredientDoc = await getDoc(ingredientRef);
    
    if (!ingredientDoc.exists()) throw new Error('Ingredient not found');
    
    const permissions = ingredientDoc.data().permissions as IngredientPermissions;
    permissions[level] = permissions[level].filter(id => id !== userId);
    await this.updatePermissions(ingredientId, permissions);
  }

  private async updatePermissions(
    ingredientId: string,
    permissions: IngredientPermissions
  ): Promise<void> {
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'sharedIngredients', ingredientId), { permissions });
  }
}