/**
 * User Entity Model
 * Business logic for user operations
 */

import type { User, UserPreferences } from '../types'
import { UserRole } from '../types'

export class UserModel {
  constructor(private user: User) {}

  get displayName(): string {
    return this.user.displayName || this.user.email || 'Anonymous User'
  }

  get initials(): string {
    const name = this.displayName
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  hasRole(role: UserRole): boolean {
    return this.user.metadata?.role === role
  }

  canEdit(): boolean {
    return this.hasRole(UserRole.EDITOR) || this.hasRole(UserRole.ADMIN)
  }

  canAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN)
  }

  getPreference<K extends keyof UserPreferences>(key: K): UserPreferences[K] | undefined {
    return this.user.metadata?.preferences?.[key]
  }

  updatePreferences(updates: Partial<UserPreferences>): User {
    return {
      ...this.user,
      metadata: {
        ...this.user.metadata,
        preferences: {
          ...this.user.metadata?.preferences,
          ...updates
        }
      }
    }
  }

  static createAnonymous(id: string): User {
    const now = new Date()
    return {
      id,
      isAnonymous: true,
      createdAt: now,
      lastLoginAt: now,
      metadata: {
        role: UserRole.VIEWER,
        preferences: {
          theme: 'system',
          autoSave: true
        }
      }
    }
  }
}