/**
 * Service for transforming between Section format and NOTE array format
 * Section format: Used in the editor UI for rich editing
 * NOTE array format: Schema-compliant format for TPN configurations ({ TEXT: "" } objects)
 * 
 * Adapted from parent project for Next.js/TypeScript architecture
 */

import { parseNoteArrayToSections } from './noteParser'

export interface NoteObject {
  TEXT: string
  TYPE?: string  // Optional type field for categorization
}

export interface Section {
  id: string
  name?: string
  type: 'static' | 'dynamic'  // static = text, dynamic = JavaScript code
  content: string
  order?: number
  isExpanded?: boolean
  testCases?: Array<{
    id: string
    variables: Record<string, any>
    expected: string
  }>
  metadata?: {
    sourceIngredient?: string
    originalIndex?: number
    [key: string]: any
  }
}

export class NoteTransformService {
  /**
   * Converts an array of Sections to a NOTE array format
   * @param sections - Array of Section objects from the editor
   * @returns Array of { TEXT: string } objects for TPN schema compliance
   */
  sectionsToNoteArray(sections: Section[]): NoteObject[] {
    if (!sections || sections.length === 0) {
      return []
    }

    // Sort sections by order if specified
    const sortedSections = [...sections].sort((a, b) => 
      (a.order ?? 0) - (b.order ?? 0)
    )

    // Transform each section's content to a NOTE object
    return sortedSections.map(section => ({
      TEXT: this.extractSectionContent(section),
      ...(section.type === 'dynamic' ? { TYPE: 'DYNAMIC' } : {})
    }))
  }

  /**
   * Converts a NOTE array to Section format for editing
   * @param noteArray - Array of { TEXT: string } objects from TPN config
   * @param ingredientKey - The key name of the ingredient these notes belong to
   * @returns Array of Section objects for the editor
   */
  noteArrayToSections(noteArray: NoteObject[] | undefined, ingredientKey: string): Section[] {
    if (!noteArray || noteArray.length === 0) {
      return []
    }

    // Use the proper parser that handles [f( and )] delimiters correctly
    // This will join all TEXT elements and split at the correct boundaries
    return parseNoteArrayToSections(noteArray)
  }

  /**
   * Extracts the content from a section based on its type
   * @param section - Section object to extract content from
   * @returns The text content of the section
   */
  private extractSectionContent(section: Section): string {
    // Return the content, preserving code formatting for dynamic sections
    return section.content || ''
  }

  /**
   * Creates a Section object from a NOTE object
   * @param note - NOTE object containing TEXT field
   * @param ingredientKey - The key name of the ingredient
   * @param index - Index of the note in the array
   * @returns Section object for the editor
   */
  private createSectionFromNote(
    note: NoteObject, 
    ingredientKey: string, 
    index: number
  ): Section {
    const content = note.TEXT || ''
    
    // Check explicit type or detect if content looks like JavaScript code
    const isDynamic = note.TYPE === 'DYNAMIC' || this.isLikelyDynamicContent(content)
    
    return {
      id: `${ingredientKey}_note_${index}_${Date.now()}`,
      name: `Section ${index + 1}`,
      type: isDynamic ? 'dynamic' : 'static',
      content: content,
      order: index,
      isExpanded: false,
      metadata: {
        sourceIngredient: ingredientKey,
        originalIndex: index
      }
    }
  }

  /**
   * Determines if content is likely dynamic (JavaScript) code
   * @param content - Text content to analyze
   * @returns true if content appears to be JavaScript code
   */
  private isLikelyDynamicContent(content: string): boolean {
    if (!content) return false
    
    // Check for common JavaScript patterns
    const jsPatterns = [
      /\bfunction\s*\(/,           // function declarations
      /\bconst\s+\w+\s*=/,        // const declarations
      /\blet\s+\w+\s*=/,          // let declarations
      /\bvar\s+\w+\s*=/,          // var declarations
      /\bif\s*\(/,                // if statements
      /\bfor\s*\(/,               // for loops
      /\bwhile\s*\(/,             // while loops
      /\breturn\s+/,              // return statements
      /\bme\./,                   // TPN-specific object access
      /=>/,                       // Arrow functions
      /\{\s*\n/,                  // Opening braces with newline (code blocks)
      /\/\/.+/,                   // Single-line comments
      /\/\*[\s\S]*?\*\//,        // Multi-line comments
      /\bconsole\./,              // Console statements
      /\bMath\./,                 // Math operations
    ]
    
    return jsPatterns.some(pattern => pattern.test(content))
  }

  /**
   * Validates that a NOTE array is properly formatted
   * @param noteArray - Array to validate
   * @returns true if valid NOTE array format
   */
  validateNoteArray(noteArray: any): noteArray is NoteObject[] {
    if (!Array.isArray(noteArray)) {
      return false
    }
    
    return noteArray.every(item => 
      typeof item === 'object' &&
      item !== null &&
      'TEXT' in item &&
      typeof item.TEXT === 'string'
    )
  }

  /**
   * Merges imported NOTE arrays with existing sections
   * @param existingSections - Current sections in the editor
   * @param importedNotes - NOTE array from imported config
   * @param ingredientKey - The ingredient key for context
   * @param strategy - Merge strategy: 'replace' | 'append' | 'merge'
   * @returns Merged array of sections
   */
  mergeWithExisting(
    existingSections: Section[], 
    importedNotes: NoteObject[], 
    ingredientKey: string,
    strategy: 'replace' | 'append' | 'merge' = 'replace'
  ): Section[] {
    // Convert imported notes to sections
    const newSections = this.noteArrayToSections(importedNotes, ingredientKey)
    
    switch (strategy) {
      case 'replace':
        return newSections
        
      case 'append':
        // Append new sections, updating their order
        const maxOrder = Math.max(...existingSections.map(s => s.order ?? 0))
        return [
          ...existingSections,
          ...newSections.map((s, i) => ({
            ...s,
            order: maxOrder + i + 1
          }))
        ]
        
      case 'merge':
        // Smart merge: Keep dynamic sections from existing, replace static
        const dynamicExisting = existingSections.filter(s => s.type === 'dynamic')
        const staticNew = newSections.filter(s => s.type === 'static')
        return [...dynamicExisting, ...staticNew].sort((a, b) => 
          (a.order ?? 0) - (b.order ?? 0)
        )
        
      default:
        return newSections
    }
  }

  /**
   * Extracts test cases from dynamic sections
   * @param sections - Array of sections
   * @returns Combined test cases from all dynamic sections
   */
  extractTestCases(sections: Section[]): Array<{
    sectionId: string
    testCases: NonNullable<Section['testCases']>
  }> {
    return sections
      .filter(s => s.type === 'dynamic' && s.testCases && s.testCases.length > 0)
      .map(s => ({
        sectionId: s.id,
        testCases: s.testCases!
      }))
  }

  /**
   * Counts the number of dynamic vs static sections
   * @param sections - Array of sections
   * @returns Count breakdown
   */
  getSectionStats(sections: Section[]): {
    total: number
    dynamic: number
    static: number
    withTests: number
  } {
    return {
      total: sections.length,
      dynamic: sections.filter(s => s.type === 'dynamic').length,
      static: sections.filter(s => s.type === 'static').length,
      withTests: sections.filter(s => s.testCases && s.testCases.length > 0).length
    }
  }
}

// Export singleton instance
export const noteTransformService = new NoteTransformService()