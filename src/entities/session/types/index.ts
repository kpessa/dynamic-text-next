/**
 * Session Entity Types
 * Domain model for session and workspace state
 */

export interface Session {
  id: string
  userId: string
  startedAt: Date
  lastActivityAt: Date
  expiresAt: Date
  workspace: WorkspaceState
}

export interface WorkspaceState {
  activeContentId?: string
  activeSectionId?: string
  unsavedChanges: boolean
  recentFiles: RecentFile[]
  editorState?: EditorState
}

export interface RecentFile {
  id: string
  title: string
  lastOpened: Date
  contentType: 'TPN' | 'general'
}

export interface EditorState {
  cursorPosition?: {
    line: number
    column: number
  }
  scrollPosition?: {
    x: number
    y: number
  }
  selectedText?: string
  expandedSections?: string[]
}

export interface SessionActivity {
  type: ActivityType
  timestamp: Date
  details?: Record<string, unknown>
}

export enum ActivityType {
  FILE_OPENED = 'file_opened',
  FILE_SAVED = 'file_saved',
  SECTION_ADDED = 'section_added',
  SECTION_EDITED = 'section_edited',
  SECTION_DELETED = 'section_deleted',
  TEST_RUN = 'test_run',
  EXPORT = 'export',
  SHARE = 'share'
}