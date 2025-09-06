import { describe, it, expect, beforeEach } from 'vitest';
import { createTextFormatters } from './textFormatters';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Setup JSDOM for DOMPurify
const window = new JSDOM('').window;
(global as any).window = window;
(global as any).document = window.document;
(global as any).DOMPurify = DOMPurify(window);

describe('Text Formatters', () => {
  let formatters: ReturnType<typeof createTextFormatters>;

  beforeEach(() => {
    formatters = createTextFormatters();
  });

  describe('redText', () => {
    it('should format text in red', () => {
      const result = formatters.redText('Critical');
      expect(result).toContain('color: #ef4444');
      expect(result).toContain('Critical');
    });

    it('should handle numbers', () => {
      const result = formatters.redText(42);
      expect(result).toContain('42');
    });

    it('should escape HTML to prevent injection', () => {
      const result = formatters.redText('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  describe('greenText', () => {
    it('should format text in green', () => {
      const result = formatters.greenText('Success');
      expect(result).toContain('color: #10b981');
      expect(result).toContain('Success');
    });
  });

  describe('blueText', () => {
    it('should format text in blue', () => {
      const result = formatters.blueText('Information');
      expect(result).toContain('color: #3b82f6');
      expect(result).toContain('Information');
    });
  });

  describe('boldText', () => {
    it('should format text in bold', () => {
      const result = formatters.boldText('Important');
      expect(result).toBe('<strong>Important</strong>');
    });

    it('should escape HTML content', () => {
      const result = formatters.boldText('<em>test</em>');
      expect(result).toContain('&lt;em&gt;');
      expect(result).not.toContain('<em>');
    });
  });

  describe('italicText', () => {
    it('should format text in italics', () => {
      const result = formatters.italicText('Emphasis');
      expect(result).toBe('<em>Emphasis</em>');
    });
  });

  describe('underlineText', () => {
    it('should format text with underline', () => {
      const result = formatters.underlineText('Underlined');
      expect(result).toBe('<u>Underlined</u>');
    });
  });

  describe('highlightText', () => {
    it('should highlight text with default color', () => {
      const result = formatters.highlightText('Note');
      expect(result).toContain('background-color: #fef3c7');
      expect(result).toContain('Note');
    });

    it('should highlight text with custom color', () => {
      const result = formatters.highlightText('Alert', '#ffcccc');
      expect(result).toContain('background-color: #ffcccc');
    });

    it('should validate color format', () => {
      const result = formatters.highlightText('Test', 'invalid-color');
      expect(result).toContain('background-color: #fef3c7'); // Default color
    });

    it('should accept named colors', () => {
      const result = formatters.highlightText('Test', 'yellow');
      expect(result).toContain('background-color: yellow');
    });
  });
});