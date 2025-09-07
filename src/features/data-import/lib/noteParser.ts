/**
 * NOTE Parser
 * Converts NOTE array from TPN configs into static and dynamic sections
 */

import type { Section } from '@/entities/section/types'

export interface NoteItem {
  TEXT: string
  TYPE?: string
}

/**
 * Parse NOTE array into sections
 * Detects [f( and )] delimiters to create dynamic sections
 */
export function parseNoteArrayToSections(noteArray: NoteItem[]): Section[] {
  if (!noteArray || !Array.isArray(noteArray)) {
    return []
  }

  const sections: Section[] = []
  let currentSection: Section | null = null
  let inDynamicSection = false
  let dynamicContent: string[] = []
  let staticContent: string[] = []

  for (let i = 0; i < noteArray.length; i++) {
    const note = noteArray[i]
    const text = note.TEXT || ''

    // Check for dynamic section start
    if (text === '[f(' || text.includes('[f(')) {
      // Save any accumulated static content
      if (staticContent.length > 0) {
        sections.push({
          id: `section-${sections.length}`,
          name: `Section ${sections.length + 1}`,
          type: 'static',
          content: staticContent.join('\n'),
          order: sections.length
        })
        staticContent = []
      }

      inDynamicSection = true
      
      // Handle case where [f( is part of a larger string
      if (text !== '[f(') {
        const parts = text.split('[f(')
        if (parts[0]) {
          sections.push({
            id: `section-${sections.length}`,
            name: `Section ${sections.length + 1}`,
            type: 'static',
            content: parts[0],
            order: sections.length
          })
        }
        if (parts[1]) {
          dynamicContent.push(parts[1])
        }
      }
      continue
    }

    // Check for dynamic section end
    if (text === ')]' || text.includes(')]')) {
      if (inDynamicSection) {
        // Handle case where )] is part of a larger string
        if (text !== ')]') {
          const parts = text.split(')]')
          if (parts[0]) {
            dynamicContent.push(parts[0])
          }
        }

        // Create dynamic section
        if (dynamicContent.length > 0) {
          sections.push({
            id: `section-${sections.length}`,
            name: `Dynamic Section ${sections.length + 1}`,
            type: 'dynamic',
            content: dynamicContent.join('\n'),
            order: sections.length
          })
          dynamicContent = []
        }

        inDynamicSection = false

        // Handle remaining text after )]
        if (text !== ')]') {
          const parts = text.split(')]')
          if (parts[1]) {
            staticContent.push(parts[1])
          }
        }
      } else {
        staticContent.push(text)
      }
      continue
    }

    // Regular text
    if (inDynamicSection) {
      dynamicContent.push(text)
    } else {
      staticContent.push(text)
    }
  }

  // Handle any remaining content
  if (dynamicContent.length > 0) {
    sections.push({
      id: `section-${sections.length}`,
      name: `Dynamic Section ${sections.length + 1}`,
      type: 'dynamic',
      content: dynamicContent.join('\n'),
      order: sections.length
    })
  }

  if (staticContent.length > 0) {
    sections.push({
      id: `section-${sections.length}`,
      name: `Section ${sections.length + 1}`,
      type: 'static',
      content: staticContent.join('\n'),
      order: sections.length
    })
  }

  return sections
}

/**
 * Convert sections back to NOTE array format
 */
export function sectionsToNoteArray(sections: Section[]): NoteItem[] {
  const notes: NoteItem[] = []

  sections.forEach(section => {
    if (section.type === 'dynamic') {
      notes.push({ TEXT: '[f(' })
      
      const lines = section.content.split('\n')
      lines.forEach(line => {
        notes.push({ TEXT: line })
      })
      
      notes.push({ TEXT: ')]' })
    } else {
      const lines = section.content.split('\n')
      lines.forEach(line => {
        notes.push({ TEXT: line })
      })
    }
  })

  return notes
}

/**
 * Extract a preview of the NOTE content
 */
export function getNotePreview(noteArray: NoteItem[], maxLength: number = 100): string {
  if (!noteArray || !Array.isArray(noteArray)) {
    return ''
  }

  const fullText = noteArray.map(note => note.TEXT || '').join(' ')
  
  if (fullText.length <= maxLength) {
    return fullText
  }

  return fullText.substring(0, maxLength) + '...'
}

/**
 * Check if NOTE array contains dynamic sections
 */
export function hasDynamicSections(noteArray: NoteItem[]): boolean {
  if (!noteArray || !Array.isArray(noteArray)) {
    return false
  }

  return noteArray.some(note => 
    note.TEXT === '[f(' || 
    note.TEXT === ')]' ||
    note.TEXT?.includes('[f(') ||
    note.TEXT?.includes(')]')
  )
}

/**
 * Count sections in NOTE array
 */
export function countSections(noteArray: NoteItem[]): { static: number; dynamic: number } {
  const sections = parseNoteArrayToSections(noteArray)
  
  return {
    static: sections.filter(s => s.type === 'static').length,
    dynamic: sections.filter(s => s.type === 'dynamic').length
  }
}