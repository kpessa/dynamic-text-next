import { describe, it, expect } from 'vitest'
import { UserModel } from './userModel'
import { UserRole } from '../types'
import type { User } from '../types'

describe('UserModel', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    isAnonymous: false,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    metadata: {
      role: UserRole.EDITOR,
      preferences: {
        theme: 'dark',
        autoSave: true
      }
    }
  }

  describe('displayName', () => {
    it('should return display name when available', () => {
      const model = new UserModel(mockUser)
      expect(model.displayName).toBe('Test User')
    })

    it('should return email when display name is not available', () => {
      const user = { ...mockUser, displayName: undefined }
      const model = new UserModel(user)
      expect(model.displayName).toBe('test@example.com')
    })

    it('should return Anonymous User when neither is available', () => {
      const user = { ...mockUser, displayName: undefined, email: undefined }
      const model = new UserModel(user)
      expect(model.displayName).toBe('Anonymous User')
    })
  })

  describe('initials', () => {
    it('should return initials from full name', () => {
      const model = new UserModel(mockUser)
      expect(model.initials).toBe('TU')
    })

    it('should return first two chars for single name', () => {
      const user = { ...mockUser, displayName: 'Admin' }
      const model = new UserModel(user)
      expect(model.initials).toBe('AD')
    })
  })

  describe('role checks', () => {
    it('should correctly check user role', () => {
      const model = new UserModel(mockUser)
      expect(model.hasRole(UserRole.EDITOR)).toBe(true)
      expect(model.hasRole(UserRole.ADMIN)).toBe(false)
    })

    it('should allow edit for editor role', () => {
      const model = new UserModel(mockUser)
      expect(model.canEdit()).toBe(true)
    })

    it('should allow edit for admin role', () => {
      const user = { ...mockUser, metadata: { ...mockUser.metadata, role: UserRole.ADMIN } }
      const model = new UserModel(user)
      expect(model.canEdit()).toBe(true)
      expect(model.canAdmin()).toBe(true)
    })
  })

  describe('preferences', () => {
    it('should get preference value', () => {
      const model = new UserModel(mockUser)
      expect(model.getPreference('theme')).toBe('dark')
      expect(model.getPreference('autoSave')).toBe(true)
    })

    it('should update preferences', () => {
      const model = new UserModel(mockUser)
      const updated = model.updatePreferences({ theme: 'light' })
      expect(updated.metadata?.preferences?.theme).toBe('light')
      expect(updated.metadata?.preferences?.autoSave).toBe(true)
    })
  })

  describe('createAnonymous', () => {
    it('should create anonymous user with defaults', () => {
      const user = UserModel.createAnonymous('anon-123')
      expect(user.id).toBe('anon-123')
      expect(user.isAnonymous).toBe(true)
      expect(user.metadata?.role).toBe(UserRole.VIEWER)
      expect(user.metadata?.preferences?.theme).toBe('system')
    })
  })
})