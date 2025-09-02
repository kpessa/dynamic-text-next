/**
 * Session Entity Public API
 * Exports only intended public interfaces
 */

export type {
  Session,
  WorkspaceState,
  RecentFile,
  EditorState,
  SessionActivity
} from './types'

export { ActivityType } from './types'
export { SessionModel } from './model/sessionModel'