import { describe, it, expect, beforeEach } from 'vitest';
import { ContentProcessor } from '../contentProcessor';

describe('ContentProcessor', () => {
  let processor: ContentProcessor;

  beforeEach(() => {
    processor = new ContentProcessor();
    processor.clearCache();
  });

  describe('processContent', () => {
    it('should process plain text content', async () => {
      const content = 'Hello World\nThis is a test';
      const result = await processor.processContent(content);

      expect(result.raw).toBe(content);
      expect(result.metadata.format).toBe('text');
      expect(result.metadata.lineCount).toBe(2);
      expect(result.metadata.charCount).toBe(content.length);
      expect(result.html).toContain('<pre>');
    });

    it('should process JSON content', async () => {
      const content = JSON.stringify({ name: 'test', value: 123 }, null, 2);
      const result = await processor.processContent(content);

      expect(result.metadata.format).toBe('json');
      expect(result.code).toContain('json-key');
      expect(result.code).toContain('json-number');
      expect(result.normalized).toBe(content); // Already formatted
    });

    it('should process HTML content', async () => {
      const content = '<div>Hello <strong>World</strong></div>';
      const result = await processor.processContent(content);

      expect(result.metadata.format).toBe('html');
      expect(result.html).toContain('<div>');
      expect(result.html).toContain('<strong>');
    });

    it('should detect TPN legacy format', async () => {
      const content = 'Value: {{variable}} and {{#if condition}}yes{{/if}}';
      const result = await processor.processContent(content);

      expect(result.metadata.format).toBe('tpn-legacy');
      expect(result.normalized).toContain('${variable}');
      expect(result.normalized).toContain('${condition ? `yes` : ""}');
    });

    it('should enforce size limit', async () => {
      const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
      
      await expect(
        processor.processContent(largeContent, { maxLength: 1024 })
      ).rejects.toThrow('exceeds maximum length');
    });

    it('should cache processed content', async () => {
      const content = 'Test content';
      
      const result1 = await processor.processContent(content);
      const result2 = await processor.processContent(content);

      expect(result1).toBe(result2); // Same reference = cached
    });
  });

  describe('format detection', () => {
    it('should detect formulas in content', async () => {
      const cases = [
        '${value + 10}',
        'kpt.calculate(formula)',
        '{{price * quantity}}',
        '=A1+B1'
      ];

      for (const content of cases) {
        const result = await processor.processContent(content);
        expect(result.metadata.hasFormulas).toBe(true);
      }
    });

    it('should detect dynamic content', async () => {
      const cases = [
        '${variable}',
        '{{template}}',
        'kpt.format(value)',
        '<script>alert(1)</script>',
        '<div onclick="doSomething()">'
      ];

      for (const content of cases) {
        const result = await processor.processContent(content);
        expect(result.metadata.hasDynamicContent).toBe(true);
      }
    });
  });

  describe('content normalization', () => {
    it('should normalize whitespace', async () => {
      const content = 'Line 1  \nLine 2\r\n\n\n\nLine 3   ';
      const result = await processor.processContent(content, {
        preserveWhitespace: false
      });

      expect(result.normalized).toBe('Line 1\nLine 2\n\nLine 3');
    });

    it('should preserve whitespace when requested', async () => {
      const content = 'Line 1  \nLine 2   ';
      const result = await processor.processContent(content, {
        preserveWhitespace: true
      });

      expect(result.normalized).toContain('  ');
    });

    it('should sort JSON keys for consistent comparison', async () => {
      const content = JSON.stringify({ z: 1, a: 2, m: { y: 3, b: 4 } });
      const result = await processor.processContent(content);

      const parsed = JSON.parse(result.normalized);
      const keys = Object.keys(parsed);
      expect(keys).toEqual(['a', 'm', 'z']);
      
      const nestedKeys = Object.keys(parsed.m);
      expect(nestedKeys).toEqual(['b', 'y']);
    });

    it('should convert TPN legacy format', async () => {
      const content = '{{name}} costs ${{price}} - {{#if inStock}}Available{{/if}}';
      const result = await processor.processContent(content, {
        normalizeTPN: true
      });

      expect(result.normalized).toContain('${name}');
      expect(result.normalized).toContain('${price}');
      expect(result.normalized).toContain('${inStock ? `Available` : ""}');
    });
  });

  describe('HTML rendering', () => {
    it('should sanitize HTML to prevent XSS', async () => {
      const maliciousContent = '<script>alert("XSS")</script><div>Safe</div>';
      const result = await processor.processContent(maliciousContent);

      expect(result.html).not.toContain('<script>');
      expect(result.html).toContain('<div>Safe</div>');
    });

    it('should escape HTML in code blocks', async () => {
      const content = '<div>HTML & "quotes"</div>';
      const result = await processor.processContent(content, {
        renderHTML: false,
        syntaxHighlight: true
      });

      expect(result.code).toContain('&lt;div&gt;');
      expect(result.code).toContain('&amp;');
      expect(result.code).toContain('&quot;');
    });
  });

  describe('syntax highlighting', () => {
    it('should apply JSON syntax highlighting', async () => {
      const content = '{"key": "value", "number": 42, "bool": true}';
      const result = await processor.processContent(content);

      expect(result.code).toContain('class="json-key"');
      expect(result.code).toContain('class="json-string"');
      expect(result.code).toContain('class="json-number"');
      expect(result.code).toContain('class="json-boolean"');
    });

    it('should add language class for code blocks', async () => {
      const jsonContent = '{"test": true}';
      const htmlContent = '<div>test</div>';
      
      const jsonResult = await processor.processContent(jsonContent);
      const htmlResult = await processor.processContent(htmlContent);

      expect(jsonResult.code).toContain('language-json');
      expect(htmlResult.code).toContain('language-html');
    });
  });

  describe('cache management', () => {
    it('should track cache statistics', async () => {
      const content1 = 'Test 1';
      const content2 = 'Test 2';

      await processor.processContent(content1);
      await processor.processContent(content2);

      const stats = processor.getCacheStats();
      expect(stats.entries).toBe(2);
      expect(stats.size).toBe(content1.length + content2.length);
    });

    it('should clear cache', async () => {
      await processor.processContent('Test');
      
      let stats = processor.getCacheStats();
      expect(stats.entries).toBe(1);

      processor.clearCache();
      
      stats = processor.getCacheStats();
      expect(stats.entries).toBe(0);
    });
  });
});