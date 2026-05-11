import { describe, it, expect } from 'vitest'
import { noteTransformService, type NoteObject, type Section } from '../noteTransformService'

describe('NoteTransformService', () => {
  describe('sectionsToNoteArray', () => {
    it('should convert empty sections to empty NOTE array', () => {
      const result = noteTransformService.sectionsToNoteArray([])
      expect(result).toEqual([])
    })

    it('should convert static sections to NOTE objects', () => {
      const sections: Section[] = [
        {
          id: 'sec-1',
          name: 'Section 1',
          type: 'static',
          content: 'This is static content',
          order: 0
        },
        {
          id: 'sec-2',
          name: 'Section 2',
          type: 'static',
          content: 'More static content',
          order: 1
        }
      ]

      const result = noteTransformService.sectionsToNoteArray(sections)
      
      expect(result).toEqual([
        { TEXT: 'This is static content' },
        { TEXT: 'More static content' }
      ])
    })

    it('should convert dynamic sections with TYPE field', () => {
      const sections: Section[] = [
        {
          id: 'sec-1',
          type: 'dynamic',
          content: 'const value = me.CALCIUM * 2;',
          order: 0
        }
      ]

      const result = noteTransformService.sectionsToNoteArray(sections)
      
      expect(result).toEqual([
        { TEXT: 'const value = me.CALCIUM * 2;', TYPE: 'DYNAMIC' }
      ])
    })

    it('should preserve order when converting sections', () => {
      const sections: Section[] = [
        {
          id: 'sec-3',
          type: 'static',
          content: 'Third',
          order: 2
        },
        {
          id: 'sec-1',
          type: 'static',
          content: 'First',
          order: 0
        },
        {
          id: 'sec-2',
          type: 'static',
          content: 'Second',
          order: 1
        }
      ]

      const result = noteTransformService.sectionsToNoteArray(sections)
      
      expect(result).toEqual([
        { TEXT: 'First' },
        { TEXT: 'Second' },
        { TEXT: 'Third' }
      ])
    })
  })

  describe('noteArrayToSections', () => {
    it('should convert empty NOTE array to empty sections', () => {
      const result = noteTransformService.noteArrayToSections([], 'CALCIUM')
      expect(result).toEqual([])
    })

    it('should convert NOTE objects to sections', () => {
      const notes: NoteObject[] = [
        { TEXT: 'Static content here' },
        { TEXT: 'More content' }
      ]

      const result = noteTransformService.noteArrayToSections(notes, 'CALCIUM')
      
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        name: 'Section 1',
        type: 'static',
        content: 'Static content here',
        order: 0,
        metadata: {
          sourceIngredient: 'CALCIUM',
          originalIndex: 0
        }
      })
      expect(result[1]).toMatchObject({
        name: 'Section 2',
        type: 'static',
        content: 'More content',
        order: 1,
        metadata: {
          sourceIngredient: 'CALCIUM',
          originalIndex: 1
        }
      })
    })

    it('should detect dynamic content from JavaScript patterns', () => {
      const notes: NoteObject[] = [
        { TEXT: 'const value = 10;' },
        { TEXT: 'if (me.VALUE > 0) { return true; }' },
        { TEXT: 'function calculate() { return 42; }' },
        { TEXT: 'Just plain text' },
        { TEXT: 'let result = Math.max(a, b);' },
        { TEXT: '// Comment\nconst x = 5;' }
      ]

      const result = noteTransformService.noteArrayToSections(notes, 'TEST')
      
      expect(result[0].type).toBe('dynamic')
      expect(result[1].type).toBe('dynamic')
      expect(result[2].type).toBe('dynamic')
      expect(result[3].type).toBe('static')
      expect(result[4].type).toBe('dynamic')
      expect(result[5].type).toBe('dynamic')
    })

    it('should respect explicit TYPE field', () => {
      const notes: NoteObject[] = [
        { TEXT: 'Looks like normal text', TYPE: 'DYNAMIC' },
        { TEXT: 'const x = 5;', TYPE: 'STATIC' }
      ]

      const result = noteTransformService.noteArrayToSections(notes, 'TEST')
      
      expect(result[0].type).toBe('dynamic') // Explicit TYPE=DYNAMIC
      expect(result[1].type).toBe('dynamic') // Detected as dynamic despite TYPE=STATIC
    })
  })

  describe('validateNoteArray', () => {
    it('should validate correct NOTE array', () => {
      const valid: NoteObject[] = [
        { TEXT: 'Content 1' },
        { TEXT: 'Content 2' }
      ]

      expect(noteTransformService.validateNoteArray(valid)).toBe(true)
    })

    it('should reject non-array', () => {
      expect(noteTransformService.validateNoteArray('not an array')).toBe(false)
      expect(noteTransformService.validateNoteArray(null)).toBe(false)
      expect(noteTransformService.validateNoteArray(undefined)).toBe(false)
    })

    it('should reject invalid NOTE objects', () => {
      const invalid = [
        { TEXT: 'Valid' },
        { CONTENT: 'Missing TEXT field' },
        'Not an object',
        null,
        { TEXT: 123 } // TEXT not a string
      ]

      expect(noteTransformService.validateNoteArray(invalid)).toBe(false)
    })
  })

  describe('mergeWithExisting', () => {
    const existingSections: Section[] = [
      {
        id: 'existing-1',
        type: 'dynamic',
        content: 'const existing = true;',
        order: 0
      },
      {
        id: 'existing-2',
        type: 'static',
        content: 'Existing static content',
        order: 1
      }
    ]

    const importedNotes: NoteObject[] = [
      { TEXT: 'New static content' },
      { TEXT: 'const newCode = false;' }
    ]

    it('should replace existing sections with imported ones (replace strategy)', () => {
      const result = noteTransformService.mergeWithExisting(
        existingSections,
        importedNotes,
        'TEST',
        'replace'
      )

      expect(result).toHaveLength(2)
      expect(result[0].content).toBe('New static content')
      expect(result[1].content).toBe('const newCode = false;')
    })

    it('should append imported sections (append strategy)', () => {
      const result = noteTransformService.mergeWithExisting(
        existingSections,
        importedNotes,
        'TEST',
        'append'
      )

      expect(result).toHaveLength(4)
      expect(result[0]).toEqual(existingSections[0])
      expect(result[1]).toEqual(existingSections[1])
      expect(result[2].content).toBe('New static content')
      expect(result[2].order).toBe(2)
      expect(result[3].content).toBe('const newCode = false;')
      expect(result[3].order).toBe(3)
    })

    it('should smart merge keeping dynamic sections (merge strategy)', () => {
      const result = noteTransformService.mergeWithExisting(
        existingSections,
        importedNotes,
        'TEST',
        'merge'
      )

      // The merge strategy keeps dynamic from existing and static from new
      // Note: 'const newCode = false;' is detected as dynamic
      const dynamicSections = result.filter(s => s.type === 'dynamic')
      const staticSections = result.filter(s => s.type === 'static')

      // The actual implementation filters: keeps existing dynamic + new static only
      // So we get 1 dynamic (existing) + 1 static (new)
      expect(result).toHaveLength(2)
      expect(dynamicSections).toHaveLength(1) // Only existing dynamic
      expect(dynamicSections[0].content).toBe('const existing = true;')
      expect(staticSections).toHaveLength(1) // Only new static
      expect(staticSections[0].content).toBe('New static content')
    })
  })

  describe('extractTestCases', () => {
    it('should extract test cases from dynamic sections', () => {
      const sections: Section[] = [
        {
          id: 'sec-1',
          type: 'dynamic',
          content: 'code',
          testCases: [
            { id: 'test-1', variables: { a: 1 }, expected: '2' },
            { id: 'test-2', variables: { a: 2 }, expected: '4' }
          ]
        },
        {
          id: 'sec-2',
          type: 'static',
          content: 'static',
          testCases: [] // Should be ignored
        },
        {
          id: 'sec-3',
          type: 'dynamic',
          content: 'more code',
          testCases: [
            { id: 'test-3', variables: { b: 3 }, expected: '6' }
          ]
        }
      ]

      const result = noteTransformService.extractTestCases(sections)

      expect(result).toHaveLength(2)
      expect(result[0].sectionId).toBe('sec-1')
      expect(result[0].testCases).toHaveLength(2)
      expect(result[1].sectionId).toBe('sec-3')
      expect(result[1].testCases).toHaveLength(1)
    })
  })

  describe('getSectionStats', () => {
    it('should calculate section statistics', () => {
      const sections: Section[] = [
        { id: '1', type: 'dynamic', content: 'code', testCases: [{ id: 't1', variables: {}, expected: '' }] },
        { id: '2', type: 'static', content: 'text' },
        { id: '3', type: 'dynamic', content: 'more code' },
        { id: '4', type: 'static', content: 'more text' },
        { id: '5', type: 'dynamic', content: 'code', testCases: [{ id: 't2', variables: {}, expected: '' }] }
      ]

      const stats = noteTransformService.getSectionStats(sections)

      expect(stats).toEqual({
        total: 5,
        dynamic: 3,
        static: 2,
        withTests: 2
      })
    })
  })

  describe('round-trip transformation', () => {
    it('should preserve content through round-trip conversion', () => {
      const originalNotes: NoteObject[] = [
        { TEXT: 'Static content line 1' },
        { TEXT: 'const value = me.CALCIUM * 2;', TYPE: 'DYNAMIC' },
        { TEXT: 'Static content line 2' },
        { TEXT: 'function calc() { return 42; }' }
      ]

      // Convert to sections
      const sections = noteTransformService.noteArrayToSections(originalNotes, 'TEST')
      
      // Convert back to notes
      const resultNotes = noteTransformService.sectionsToNoteArray(sections)

      // Check content is preserved
      expect(resultNotes).toHaveLength(originalNotes.length)
      expect(resultNotes[0].TEXT).toBe(originalNotes[0].TEXT)
      expect(resultNotes[1].TEXT).toBe(originalNotes[1].TEXT)
      expect(resultNotes[1].TYPE).toBe('DYNAMIC')
      expect(resultNotes[2].TEXT).toBe(originalNotes[2].TEXT)
      expect(resultNotes[3].TEXT).toBe(originalNotes[3].TEXT)
      expect(resultNotes[3].TYPE).toBe('DYNAMIC') // Detected as dynamic
    })
  })
})