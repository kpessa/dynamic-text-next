/**
 * Shared Configuration Constants
 * Application-wide constants and configuration
 */

export const APP_CONFIG = {
  name: 'Dynamic Text Editor',
  version: '1.0.0',
  description: 'Create and manage dynamic content with TPN advisor functions'
} as const

export const EDITOR_CONFIG = {
  defaultLanguage: 'javascript',
  tabSize: 2,
  theme: 'light',
  autoSave: {
    enabled: true,
    interval: 30000 // 30 seconds
  }
} as const

export const TPN_CONFIG = {
  populationTypes: ['Neonatal', 'Pediatric', 'Adolescent', 'Adult'] as const,
  defaultType: 'Adult' as const
} as const

export const ROUTES = {
  home: '/',
  editor: '/editor',
  settings: '/settings',
  login: '/login'
} as const

export const STORAGE_KEYS = {
  user: 'dt_user',
  preferences: 'dt_preferences',
  session: 'dt_session',
  recentFiles: 'dt_recent_files'
} as const