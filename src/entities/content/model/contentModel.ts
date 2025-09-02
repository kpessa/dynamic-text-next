/**
 * Content Entity Model
 * Business logic for content operations
 */

import type { ContentSection, TestCase, ContentVersion, DynamicContent } from '../types'

export class ContentModel {
  constructor(private content: DynamicContent) {}

  get sectionCount(): number {
    return this.content.sections.length
  }

  get hasTestCases(): boolean {
    return this.content.sections.some(s => s.testCases && s.testCases.length > 0)
  }

  get isPublished(): boolean {
    return this.content.metadata.isPublished
  }

  getSectionById(id: string): ContentSection | undefined {
    return this.content.sections.find(s => s.id === id)
  }

  getSectionsByType(type: 'html' | 'javascript'): ContentSection[] {
    return this.content.sections.filter(s => s.type === type)
  }

  addSection(section: Omit<ContentSection, 'id' | 'createdAt' | 'updatedAt'>): DynamicContent {
    const newSection: ContentSection = {
      ...section,
      id: `section-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return {
      ...this.content,
      sections: [...this.content.sections, newSection],
      metadata: {
        ...this.content.metadata,
        updatedAt: new Date()
      }
    }
  }

  updateSection(id: string, updates: Partial<ContentSection>): DynamicContent {
    return {
      ...this.content,
      sections: this.content.sections.map(s => 
        s.id === id 
          ? { ...s, ...updates, updatedAt: new Date() }
          : s
      ),
      metadata: {
        ...this.content.metadata,
        updatedAt: new Date()
      }
    }
  }

  removeSection(id: string): DynamicContent {
    return {
      ...this.content,
      sections: this.content.sections.filter(s => s.id !== id),
      metadata: {
        ...this.content.metadata,
        updatedAt: new Date()
      }
    }
  }

  reorderSections(sectionIds: string[]): DynamicContent {
    const orderedSections = sectionIds
      .map((id, index) => {
        const section = this.getSectionById(id)
        return section ? { ...section, order: index } : null
      })
      .filter((s): s is ContentSection => s !== null)

    return {
      ...this.content,
      sections: orderedSections,
      metadata: {
        ...this.content.metadata,
        updatedAt: new Date()
      }
    }
  }

  addTestCase(sectionId: string, testCase: Omit<TestCase, 'id'>): DynamicContent {
    const newTestCase: TestCase = {
      ...testCase,
      id: `test-${Date.now()}`
    }

    return {
      ...this.content,
      sections: this.content.sections.map(s => 
        s.id === sectionId
          ? {
              ...s,
              testCases: [...(s.testCases || []), newTestCase],
              updatedAt: new Date()
            }
          : s
      ),
      metadata: {
        ...this.content.metadata,
        updatedAt: new Date()
      }
    }
  }

  createVersion(sectionId: string, userId: string, changelog?: string): ContentVersion {
    const section = this.getSectionById(sectionId)
    if (!section) {
      throw new Error(`Section ${sectionId} not found`)
    }

    const existingVersions = this.content.versions.filter(v => v.sectionId === sectionId)
    const nextVersion = existingVersions.length + 1

    return {
      id: `version-${Date.now()}`,
      sectionId,
      version: nextVersion,
      content: section.content,
      changelog,
      createdAt: new Date(),
      createdBy: userId
    }
  }

  static createEmpty(userId: string, title: string): DynamicContent {
    const now = new Date()
    return {
      sections: [],
      metadata: {
        title,
        isPublished: false,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        lastEditedBy: userId
      },
      versions: []
    }
  }
}