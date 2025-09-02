/**
 * User Entity Types
 * Domain model for user-related data structures
 */

export interface User {
  id: string
  email?: string
  displayName?: string
  photoURL?: string
  isAnonymous: boolean
  createdAt: Date
  lastLoginAt: Date
  metadata?: UserMetadata
}

export interface UserMetadata {
  healthSystem?: string
  role?: UserRole
  preferences?: UserPreferences
}

export enum UserRole {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  ADMIN = 'admin'
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  defaultIngredientType?: 'TPN' | 'general'
  autoSave: boolean
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}