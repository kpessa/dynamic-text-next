/**
 * Section Parser
 * Parses text content with [f( and )] delimiters into static and dynamic sections
 */

import type { Section } from '@/entities/section/types'

export interface ParsedSection {
  type: 'static' | 'dynamic'
  content: string
  startIndex?: number
  endIndex?: number
}

/**
 * Parse text content into sections based on [f( and )] delimiters
 * Dynamic sections are delimited by [f( and )]
 * Everything else is static content
 */
export function parseTextIntoSections(text: string): ParsedSection[] {
  const sections: ParsedSection[] = []
  let currentIndex = 0
  
  while (currentIndex < text.length) {
    // Look for the start of a dynamic section
    const dynamicStart = text.indexOf('[f(', currentIndex)
    
    if (dynamicStart === -1) {
      // No more dynamic sections, rest is static
      if (currentIndex < text.length) {
        const staticContent = text.substring(currentIndex)
        if (staticContent.trim()) {
          sections.push({
            type: 'static',
            content: staticContent,
            startIndex: currentIndex,
            endIndex: text.length
          })
        }
      }
      break
    }
    
    // Add static content before dynamic section
    if (dynamicStart > currentIndex) {
      const staticContent = text.substring(currentIndex, dynamicStart)
      if (staticContent.trim()) {
        sections.push({
          type: 'static',
          content: staticContent,
          startIndex: currentIndex,
          endIndex: dynamicStart
        })
      }
    }
    
    // Find the end of the dynamic section
    const dynamicEnd = text.indexOf(')]', dynamicStart)
    
    if (dynamicEnd === -1) {
      // Unclosed dynamic section - treat rest as dynamic
      const dynamicContent = text.substring(dynamicStart + 3) // Skip '[f('
      sections.push({
        type: 'dynamic',
        content: dynamicContent,
        startIndex: dynamicStart,
        endIndex: text.length
      })
      break
    }
    
    // Extract dynamic content (without delimiters)
    const dynamicContent = text.substring(dynamicStart + 3, dynamicEnd)
    sections.push({
      type: 'dynamic',
      content: dynamicContent.trim(),
      startIndex: dynamicStart,
      endIndex: dynamicEnd + 2 // Include ')]'
    })
    
    currentIndex = dynamicEnd + 2 // Move past ')]'
  }
  
  return sections
}

/**
 * Convert parsed sections to Section objects with proper IDs
 */
export function convertParsedSectionsToSections(
  parsedSections: ParsedSection[],
  baseId = 'section'
): Section[] {
  const now = new Date().toISOString()
  
  return parsedSections.map((parsed, index) => {
    const id = `${baseId}-${index + 1}`
    
    if (parsed.type === 'static') {
      return {
        id,
        type: 'static',
        name: `Static Section ${index + 1}`,
        content: parsed.content,
        order: index,
        createdAt: now,
        updatedAt: now
      }
    } else {
      return {
        id,
        type: 'dynamic',
        name: `Dynamic Section ${index + 1}`,
        content: parsed.content,
        order: index,
        createdAt: now,
        updatedAt: now,
        testCases: []
      }
    }
  })
}

/**
 * Convert sections back to text with [f( and )] delimiters
 */
export function sectionsToText(sections: Section[]): string {
  return sections
    .sort((a, b) => a.order - b.order)
    .map(section => {
      if (section.type === 'static') {
        return section.content
      } else {
        // Wrap dynamic content in delimiters
        return `[f(\n${section.content}\n)]`
      }
    })
    .join('\n')
}

/**
 * Check if text contains dynamic section markers
 */
export function hasDynamicSections(text: string): boolean {
  return text.includes('[f(')
}

/**
 * Extract all dynamic sections from text
 */
export function extractDynamicSections(text: string): string[] {
  const sections = parseTextIntoSections(text)
  return sections
    .filter(s => s.type === 'dynamic')
    .map(s => s.content)
}

/**
 * Validate dynamic section syntax
 */
export function validateDynamicSection(code: string): { valid: boolean; error?: string } {
  try {
    // Basic syntax check - try to create a function
    new Function('me', code)
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JavaScript syntax'
    }
  }
}

/**
 * Convert NOTE array format to sections
 * Compatible with parent project's format
 */
export function convertNotesToSections(notes: Array<{ TEXT: string }>): Section[] {
  const sections: Section[] = []
  let currentStaticContent = ''
  let inDynamicBlock = false
  let dynamicContent = ''
  let sectionId = 1
  const now = new Date().toISOString()
  
  notes.forEach(note => {
    if (!note.TEXT) return
    
    const text = note.TEXT
    
    if (text.includes('[f(')) {
      // Save any accumulated static content
      if (currentStaticContent.trim() && !inDynamicBlock) {
        sections.push({
          id: `section-${sectionId++}`,
          type: 'static',
          name: `Static Section ${sectionId}`,
          content: currentStaticContent.trim(),
          order: sections.length,
          createdAt: now,
          updatedAt: now
        })
        currentStaticContent = ''
      }
      
      inDynamicBlock = true
      // Remove the [f( marker from the text
      const afterMarker = text.split('[f(')[1] || ''
      dynamicContent = afterMarker
    } else if (inDynamicBlock) {
      if (text.includes(')]')) {
        // End of dynamic block
        const beforeMarker = text.split(')]')[0] || ''
        dynamicContent += (dynamicContent ? '\n' : '') + beforeMarker
        
        sections.push({
          id: `section-${sectionId++}`,
          type: 'dynamic',
          name: `Dynamic Section ${sectionId}`,
          content: dynamicContent.trim(),
          order: sections.length,
          createdAt: now,
          updatedAt: now,
          testCases: []
        })
        
        inDynamicBlock = false
        dynamicContent = ''
        
        // Check for static content after )]
        const afterMarker = text.split(')]')[1] || ''
        if (afterMarker.trim()) {
          currentStaticContent = afterMarker
        }
      } else {
        // Continue accumulating dynamic content
        dynamicContent += (dynamicContent ? '\n' : '') + text
      }
    } else {
      // Accumulate static content
      currentStaticContent += (currentStaticContent ? '\n' : '') + text
    }
  })
  
  // Save any remaining content
  if (currentStaticContent.trim()) {
    sections.push({
      id: `section-${sectionId++}`,
      type: 'static',
      name: `Static Section ${sectionId}`,
      content: currentStaticContent.trim(),
      order: sections.length,
      createdAt: now,
      updatedAt: now
    })
  }
  
  if (dynamicContent.trim()) {
    sections.push({
      id: `section-${sectionId++}`,
      type: 'dynamic',
      name: `Dynamic Section ${sectionId}`,
      content: dynamicContent.trim(),
      order: sections.length,
      createdAt: now,
      updatedAt: now,
      testCases: []
    })
  }
  
  return sections
}

/**
 * Convert sections to NOTE array format
 * Compatible with parent project's format
 */
export function sectionsToNotes(sections: Section[]): Array<{ TEXT: string }> {
  const notes: Array<{ TEXT: string }> = []
  
  sections
    .sort((a, b) => a.order - b.order)
    .forEach(section => {
      if (section.type === 'static') {
        // Split static content by newlines
        const lines = section.content.split('\n')
        lines.forEach(line => {
          notes.push({ TEXT: line })
        })
      } else {
        // Dynamic section with delimiters
        notes.push({ TEXT: '[f(' })
        const lines = section.content.split('\n')
        lines.forEach(line => {
          notes.push({ TEXT: line })
        })
        notes.push({ TEXT: ')]' })
      }
    })
  
  return notes
}