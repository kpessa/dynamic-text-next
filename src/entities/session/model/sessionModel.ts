/**
 * Session Entity Model
 * Business logic for session management
 */

import type { Session, WorkspaceState, RecentFile, SessionActivity, ActivityType } from '../types'

export class SessionModel {
  private activities: SessionActivity[] = []

  constructor(private session: Session) {}

  get isExpired(): boolean {
    return new Date() > this.session.expiresAt
  }

  get hasUnsavedChanges(): boolean {
    return this.session.workspace.unsavedChanges
  }

  get activeContent(): string | undefined {
    return this.session.workspace.activeContentId
  }

  updateActivity(): Session {
    return {
      ...this.session,
      lastActivityAt: new Date()
    }
  }

  extendSession(hours: number = 24): Session {
    const newExpiry = new Date()
    newExpiry.setHours(newExpiry.getHours() + hours)
    
    return {
      ...this.session,
      expiresAt: newExpiry,
      lastActivityAt: new Date()
    }
  }

  setActiveContent(contentId: string, title: string, contentType: 'TPN' | 'general'): Session {
    const recentFile: RecentFile = {
      id: contentId,
      title,
      lastOpened: new Date(),
      contentType
    }

    // Update recent files, keeping only last 10
    const updatedRecentFiles = [
      recentFile,
      ...this.session.workspace.recentFiles.filter(f => f.id !== contentId)
    ].slice(0, 10)

    return {
      ...this.session,
      workspace: {
        ...this.session.workspace,
        activeContentId: contentId,
        recentFiles: updatedRecentFiles
      },
      lastActivityAt: new Date()
    }
  }

  setUnsavedChanges(hasChanges: boolean): Session {
    return {
      ...this.session,
      workspace: {
        ...this.session.workspace,
        unsavedChanges: hasChanges
      }
    }
  }

  logActivity(type: ActivityType, details?: Record<string, unknown>): void {
    this.activities.push({
      type,
      timestamp: new Date(),
      details
    })
  }

  getRecentActivities(limit: number = 20): SessionActivity[] {
    return this.activities.slice(-limit)
  }

  clearWorkspace(): Session {
    return {
      ...this.session,
      workspace: {
        ...this.session.workspace,
        activeContentId: undefined,
        activeSectionId: undefined,
        unsavedChanges: false,
        editorState: undefined
      }
    }
  }

  static create(userId: string): Session {
    const now = new Date()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour default session

    return {
      id: `session-${Date.now()}`,
      userId,
      startedAt: now,
      lastActivityAt: now,
      expiresAt,
      workspace: {
        unsavedChanges: false,
        recentFiles: []
      }
    }
  }
}