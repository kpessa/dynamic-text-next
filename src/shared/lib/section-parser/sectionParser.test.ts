import { describe, it, expect } from 'vitest'
import {
  parseTextIntoSections,
  convertParsedSectionsToSections,
  sectionsToText,
  hasDynamicSections,
  extractDynamicSections,
  validateDynamicSection,
  convertNotesToSections,
  sectionsToNotes
} from './sectionParser'

describe('Section Parser', () => {
  describe('parseTextIntoSections', () => {
    it('should parse static text only', () => {
      const text = 'This is static content\nWith multiple lines'
      const sections = parseTextIntoSections(text)
      
      expect(sections).toHaveLength(1)
      expect(sections[0].type).toBe('static')
      expect(sections[0].content).toBe(text)
    })
    
    it('should parse dynamic section with [f( and )] delimiters', () => {
      const text = '[f(\nreturn "Hello World"\n)]'
      const sections = parseTextIntoSections(text)
      
      expect(sections).toHaveLength(1)
      expect(sections[0].type).toBe('dynamic')
      expect(sections[0].content).toBe('return "Hello World"')
    })
    
    it('should parse mixed static and dynamic content', () => {
      const text = 'Static before\n[f(\nme.getValue("test")\n)]\nStatic after'
      const sections = parseTextIntoSections(text)
      
      expect(sections).toHaveLength(3)
      expect(sections[0].type).toBe('static')
      expect(sections[0].content).toBe('Static before\n')
      expect(sections[1].type).toBe('dynamic')
      expect(sections[1].content).toBe('me.getValue("test")')
      expect(sections[2].type).toBe('static')
      expect(sections[2].content).toBe('\nStatic after')
    })
    
    it('should handle multiple dynamic sections', () => {
      const text = '[f(\n"First"\n)]\nMiddle text\n[f(\n"Second"\n)]'
      const sections = parseTextIntoSections(text)
      
      expect(sections).toHaveLength(3)
      expect(sections[0].type).toBe('dynamic')
      expect(sections[1].type).toBe('static')
      expect(sections[2].type).toBe('dynamic')
    })
    
    it('should handle unclosed dynamic section', () => {
      const text = 'Before\n[f(\nreturn "Unclosed'
      const sections = parseTextIntoSections(text)
      
      expect(sections).toHaveLength(2)
      expect(sections[0].type).toBe('static')
      expect(sections[1].type).toBe('dynamic')
      expect(sections[1].content).toBe('\nreturn "Unclosed')
    })
  })
  
  describe('sectionsToText', () => {
    it('should convert sections back to text with delimiters', () => {
      const sections = [
        {
          id: '1',
          type: 'static' as const,
          name: 'Static 1',
          content: 'Static content',
          order: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'dynamic' as const,
          name: 'Dynamic 1',
          content: 'return "Dynamic"',
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      const text = sectionsToText(sections)
      expect(text).toBe('Static content\n[f(\nreturn "Dynamic"\n)]')
    })
  })
  
  describe('hasDynamicSections', () => {
    it('should detect dynamic sections', () => {
      expect(hasDynamicSections('Plain text')).toBe(false)
      expect(hasDynamicSections('Text with [f( dynamic )] section')).toBe(true)
    })
  })
  
  describe('extractDynamicSections', () => {
    it('should extract all dynamic section contents', () => {
      const text = 'Static\n[f(\nCode 1\n)]\nMore static\n[f(\nCode 2\n)]'
      const dynamics = extractDynamicSections(text)
      
      expect(dynamics).toHaveLength(2)
      expect(dynamics[0]).toBe('Code 1')
      expect(dynamics[1]).toBe('Code 2')
    })
  })
  
  describe('validateDynamicSection', () => {
    it('should validate valid JavaScript', () => {
      const result = validateDynamicSection('return me.getValue("test")')
      expect(result.valid).toBe(true)
    })
    
    it('should detect invalid JavaScript', () => {
      const result = validateDynamicSection('return me.getValue(')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
  
  describe('convertNotesToSections', () => {
    it('should convert NOTE array to sections', () => {
      const notes = [
        { TEXT: 'Static line 1' },
        { TEXT: 'Static line 2' },
        { TEXT: '[f(' },
        { TEXT: 'return "Dynamic"' },
        { TEXT: ')]' },
        { TEXT: 'Static line 3' }
      ]
      
      const sections = convertNotesToSections(notes)
      
      expect(sections).toHaveLength(3)
      expect(sections[0].type).toBe('static')
      expect(sections[0].content).toBe('Static line 1\nStatic line 2')
      expect(sections[1].type).toBe('dynamic')
      expect(sections[1].content).toBe('return "Dynamic"')
      expect(sections[2].type).toBe('static')
      expect(sections[2].content).toBe('Static line 3')
    })
    
    it('should handle dynamic section split across TEXT entries', () => {
      const notes = [
        { TEXT: '[f(' },
        { TEXT: 'const value = me.getValue("test")' },
        { TEXT: 'return value * 2' },
        { TEXT: ')]' }
      ]
      
      const sections = convertNotesToSections(notes)
      
      expect(sections).toHaveLength(1)
      expect(sections[0].type).toBe('dynamic')
      expect(sections[0].content).toBe('const value = me.getValue("test")\nreturn value * 2')
    })
  })
  
  describe('sectionsToNotes', () => {
    it('should convert sections to NOTE array', () => {
      const sections = [
        {
          id: '1',
          type: 'static' as const,
          name: 'Static',
          content: 'Line 1\nLine 2',
          order: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'dynamic' as const,
          name: 'Dynamic',
          content: 'return "Test"',
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      const notes = sectionsToNotes(sections)
      
      expect(notes).toEqual([
        { TEXT: 'Line 1' },
        { TEXT: 'Line 2' },
        { TEXT: '[f(' },
        { TEXT: 'return "Test"' },
        { TEXT: ')]' }
      ])
    })
  })
  
  describe('Real-world TPN examples', () => {
    it('should parse TPN dynamic expression', () => {
      const text = 'Dextrose: [f(\nme.maxP(me.getValue("dextrose"), 1)\n)] g/kg/day'
      const sections = parseTextIntoSections(text)
      
      expect(sections).toHaveLength(3)
      expect(sections[0].content).toBe('Dextrose: ')
      expect(sections[1].type).toBe('dynamic')
      expect(sections[1].content).toBe('me.maxP(me.getValue("dextrose"), 1)')
      expect(sections[2].content).toBe(' g/kg/day')
    })
    
    it('should handle complex TPN logic', () => {
      const text = `[f(
const glucose = me.getValue("glucose")
const conversion = me.pref("GLUCOSE_CONVERSION")
const result = glucose * conversion
return me.maxP(result, 2) + " mmol/L"
)]`
      
      const sections = parseTextIntoSections(text)
      
      expect(sections).toHaveLength(1)
      expect(sections[0].type).toBe('dynamic')
      expect(sections[0].content).toContain('const glucose')
      expect(sections[0].content).toContain('return me.maxP')
    })
  })
})