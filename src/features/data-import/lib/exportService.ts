/**
 * Export Service
 * Handles exporting sections to NOTE format with [f( and )] delimiters
 * Compatible with the parent Svelte Dynamic Text project
 */

import type { Section } from '@/entities/section/types'
import { sectionsToNotes, parseTextIntoSections, convertParsedSectionsToSections } from '@/shared/lib/section-parser'

export interface ExportOptions {
  format?: 'note' | 'sections' | 'config'
  ingredient?: string
  display?: string
  healthSystem?: string
  populationType?: string
  domain?: string
  subdomain?: string
  version?: string
}

/**
 * Export sections as NOTE format (compatible with parent project)
 */
export function exportAsNoteFormat(
  sections: Section[],
  options: ExportOptions = {}
): any {
  const noteArray = sectionsToNotes(sections)
  
  if (options.format === 'config') {
    // Full configuration format
    return {
      healthSystem: options.healthSystem || 'UNKNOWN',
      domain: options.domain || 'unknown',
      subdomain: options.subdomain || 'prod',
      version: options.version || 'adult',
      INGREDIENT: [{
        KEYNAME: options.ingredient || 'unknown',
        DISPLAY: options.display || options.ingredient || 'Unknown',
        TYPE: 'NORMAL',
        NOTE: noteArray,
        EDITMODE: 'Custom',
        PRECISION: 2
      }]
    }
  } else if (options.format === 'sections') {
    // Just the sections array (for debugging)
    return sections
  } else {
    // Default NOTE format - single ingredient
    return {
      KEYNAME: options.ingredient || 'unknown',
      DISPLAY: options.display || options.ingredient || 'Unknown',
      TYPE: 'NORMAL',
      NOTE: noteArray,
      EDITMODE: 'Custom',
      PRECISION: 2
    }
  }
}

/**
 * Export a single text field that may contain [f( )] delimiters
 * This parses the text and exports it properly
 */
export function exportTextWithDynamicSections(
  text: string,
  options: ExportOptions = {}
): any {
  // Parse the text to find dynamic sections
  const parsedSections = parseTextIntoSections(text)
  const sections = convertParsedSectionsToSections(parsedSections)
  
  return exportAsNoteFormat(sections, options)
}

/**
 * Download exported data as JSON file
 */
export function downloadAsJson(
  data: any,
  filename: string = 'export'
): void {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Copy exported data to clipboard
 */
export async function copyToClipboard(data: any): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(data, null, 2)
    await navigator.clipboard.writeText(jsonString)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Generate filename based on export options
 */
export function generateFilename(options: ExportOptions): string {
  const parts: string[] = []
  
  if (options.populationType) {
    parts.push(options.populationType.toLowerCase())
  }
  
  if (options.healthSystem) {
    parts.push(options.healthSystem.toLowerCase().replace(/\s+/g, '-'))
  }
  
  if (options.ingredient) {
    parts.push(options.ingredient.toLowerCase().replace(/\s+/g, '-'))
  }
  
  if (options.format === 'note') {
    parts.push('NOTE')
  }
  
  return parts.length > 0 ? parts.join('-') : 'export'
}

/**
 * Validate export data before download
 */
export function validateExportData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data) {
    errors.push('No data to export')
    return { valid: false, errors }
  }
  
  // Check for NOTE format
  if (data.NOTE && Array.isArray(data.NOTE)) {
    if (data.NOTE.length === 0) {
      errors.push('NOTE array is empty')
    }
    
    // Validate NOTE structure
    const invalidNotes = data.NOTE.filter((note: any) => 
      !note || typeof note !== 'object' || !('TEXT' in note) || typeof note.TEXT !== 'string'
    )
    
    if (invalidNotes.length > 0) {
      errors.push(`${invalidNotes.length} invalid NOTE entries found`)
    }
  }
  
  // Check for INGREDIENT array format
  if (data.INGREDIENT && Array.isArray(data.INGREDIENT)) {
    if (data.INGREDIENT.length === 0) {
      errors.push('INGREDIENT array is empty')
    }
    
    data.INGREDIENT.forEach((ing: any, index: number) => {
      if (!ing.KEYNAME) {
        errors.push(`Ingredient ${index + 1} missing KEYNAME`)
      }
      if (!ing.DISPLAY) {
        errors.push(`Ingredient ${index + 1} missing DISPLAY`)
      }
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}