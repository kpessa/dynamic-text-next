/**
 * Content Entity Types
 * Domain model for dynamic content structures
 */

export interface ContentSection {
  id: string
  title: string
  type: 'html' | 'javascript'
  content: string
  order: number
  createdAt: Date
  updatedAt: Date
  testCases?: TestCase[]
}

export interface TestCase {
  id: string
  name: string
  variables: Record<string, unknown>
  expectedOutput?: string
  description?: string
}

export interface ContentVersion {
  id: string
  sectionId: string
  version: number
  content: string
  changelog?: string
  createdAt: Date
  createdBy: string
}

export interface ContentHash {
  hash: string
  content: string
  occurrences: number
  sections: string[] // section IDs using this content
}

export interface DynamicContent {
  sections: ContentSection[]
  metadata: ContentMetadata
  versions: ContentVersion[]
}

export interface ContentMetadata {
  title: string
  description?: string
  tags?: string[]
  ingredientType?: 'TPN' | 'general'
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastEditedBy: string
}