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
 * Handles delimiters that can span across multiple NOTE array elements
 */
export function parseNoteArrayToSections(noteArray: NoteItem[]): Section[] {
  if (!noteArray || !Array.isArray(noteArray)) {
    return []
  }

  // First, join all TEXT elements into a single string to handle multi-element delimiters
  const fullText = noteArray.map(note => note.TEXT || '').join('\n')
  
  const sections: Section[] = []
  let currentPos = 0
  
  while (currentPos < fullText.length) {
    // Look for the start of a dynamic section
    const dynamicStart = fullText.indexOf('[f(', currentPos)
    
    if (dynamicStart === -1) {
      // No more dynamic sections, rest is static
      const remainingText = fullText.substring(currentPos).trim()
      if (remainingText) {
        sections.push({
          id: `section-${sections.length}`,
          name: `Section ${sections.length + 1}`,
          type: 'static',
          content: remainingText,
          order: sections.length
        })
      }
      break
    }
    
    // Add any static content before the dynamic section
    if (dynamicStart > currentPos) {
      const staticText = fullText.substring(currentPos, dynamicStart).trim()
      if (staticText) {
        sections.push({
          id: `section-${sections.length}`,
          name: `Section ${sections.length + 1}`,
          type: 'static',
          content: staticText,
          order: sections.length
        })
      }
    }
    
    // Find the end of the dynamic section
    const dynamicEnd = fullText.indexOf(')]', dynamicStart)
    
    if (dynamicEnd === -1) {
      // Dynamic section doesn't close properly, treat rest as dynamic
      const dynamicText = fullText.substring(dynamicStart + 3).trim()
      if (dynamicText) {
        sections.push({
          id: `section-${sections.length}`,
          name: `Dynamic Section ${sections.length + 1}`,
          type: 'dynamic',
          content: dynamicText,
          order: sections.length
        })
      }
      break
    }
    
    // Extract dynamic content (between [f( and )])
    const dynamicContent = fullText.substring(dynamicStart + 3, dynamicEnd).trim()
    if (dynamicContent) {
      sections.push({
        id: `section-${sections.length}`,
        name: `Dynamic Section ${sections.length + 1}`,
        type: 'dynamic',
        content: dynamicContent,
        order: sections.length
      })
    }
    
    // Move position past the end delimiter
    currentPos = dynamicEnd + 2
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