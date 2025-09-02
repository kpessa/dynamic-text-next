/**
 * User Entity Public API
 * Exports only intended public interfaces
 */

export type { 
  User, 
  UserMetadata, 
  UserPreferences,
  AuthState 
} from './types'

export { UserRole } from './types'
export { UserModel } from './model/userModel'