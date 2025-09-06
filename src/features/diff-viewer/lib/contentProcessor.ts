import DOMPurify from 'dompurify';
import { transform } from '@babel/standalone';

export interface ProcessedContent {
  html: string;
  code: string;
  raw: string;
  normalized: string;
  metadata: {
    format: 'html' | 'json' | 'text' | 'tpn-legacy';
    hasFormulas: boolean;
    hasDynamicContent: boolean;
    lineCount: number;
    charCount: number;
  };
}

export interface ProcessingOptions {
  renderHTML: boolean;
  syntaxHighlight: boolean;
  normalizeTPN: boolean;
  preserveWhitespace: boolean;
  maxLength?: number;
}

/**
 * Content processor for handling various content formats
 * Supports HTML rendering, code highlighting, and TPN legacy format conversion
 */
export class ContentProcessor {
  private static readonly DEFAULT_OPTIONS: ProcessingOptions = {
    renderHTML: true,
    syntaxHighlight: true,
    normalizeTPN: true,
    preserveWhitespace: false,
    maxLength: 5 * 1024 * 1024 // 5MB limit
  };

  private readonly cache = new Map<string, ProcessedContent>();
  private readonly cacheTimeout = 30 * 60 * 1000; // 30 minutes

  /**
   * Process content based on its format and options
   */
  async processContent(
    content: any,
    options: Partial<ProcessingOptions> = {}
  ): Promise<ProcessedContent> {
    const opts = { ...ContentProcessor.DEFAULT_OPTIONS, ...options };
    
    // Convert content to string if needed
    const rawContent = typeof content === 'string' 
      ? content 
      : JSON.stringify(content, null, 2);

    // Check cache
    const cacheKey = this.getCacheKey(rawContent, opts);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Check size limit
    if (opts.maxLength && rawContent.length > opts.maxLength) {
      throw new Error(`Content exceeds maximum length of ${opts.maxLength} bytes`);
    }

    const format = this.detectFormat(rawContent);
    const normalized = this.normalizeContent(rawContent, format, opts);
    
    const processed: ProcessedContent = {
      raw: rawContent,
      normalized,
      html: opts.renderHTML ? await this.renderHTML(normalized, format) : '',
      code: opts.syntaxHighlight ? this.highlightCode(normalized, format) : normalized,
      metadata: {
        format,
        hasFormulas: this.detectFormulas(rawContent),
        hasDynamicContent: this.detectDynamicContent(rawContent),
        lineCount: rawContent.split('\n').length,
        charCount: rawContent.length
      }
    };

    // Cache result
    this.cache.set(cacheKey, processed);
    setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

    return processed;
  }

  /**
   * Detect content format
   */
  private detectFormat(content: string): ProcessedContent['metadata']['format'] {
    // Check for TPN legacy format markers
    if (content.includes('{{') && content.includes('}}')) {
      return 'tpn-legacy';
    }

    // Check for HTML
    if (/<[^>]+>/.test(content)) {
      return 'html';
    }

    // Check for JSON
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      // Not JSON
    }

    return 'text';
  }

  /**
   * Normalize content for accurate comparison
   */
  private normalizeContent(
    content: string,
    format: ProcessedContent['metadata']['format'],
    options: ProcessingOptions
  ): string {
    let normalized = content;

    // Handle TPN legacy format
    if (format === 'tpn-legacy' && options.normalizeTPN) {
      normalized = this.convertTPNLegacy(normalized);
    }

    // Normalize whitespace
    if (!options.preserveWhitespace) {
      // Normalize line endings
      normalized = normalized.replace(/\r\n/g, '\n');
      
      // Trim trailing whitespace from lines
      normalized = normalized
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n');
      
      // Remove multiple blank lines
      normalized = normalized.replace(/\n{3,}/g, '\n\n');
    }

    // Sort JSON keys for consistent comparison
    if (format === 'json') {
      try {
        const parsed = JSON.parse(normalized);
        normalized = JSON.stringify(this.sortObjectKeys(parsed), null, 2);
      } catch {
        // Keep original if parsing fails
      }
    }

    return normalized;
  }

  /**
   * Convert TPN legacy format to modern format
   */
  private convertTPNLegacy(content: string): string {
    // Replace TPN template syntax with modern equivalents
    let converted = content;
    
    // Convert legacy conditionals FIRST (before converting variables)
    converted = converted.replace(/\{\{#if\s+([^}]+)\}\}(.*?)\{\{\/if\}\}/g, '${$1 ? `$2` : ""}');
    
    // Convert {{variable}} to ${variable} (but not conditionals)
    converted = converted.replace(/\{\{(?!#if|\/if)([^}]+)\}\}/g, '${$1}');
    
    // Convert legacy function calls
    converted = converted.replace(/\$tpn\.([a-zA-Z]+)\(/g, 'kpt.$1(');
    
    return converted;
  }

  /**
   * Render content as HTML with sanitization
   */
  private async renderHTML(
    content: string,
    format: ProcessedContent['metadata']['format']
  ): Promise<string> {
    let html = content;

    // Convert based on format
    switch (format) {
      case 'json':
        html = `<pre><code class="language-json">${this.escapeHtml(content)}</code></pre>`;
        break;
      
      case 'tpn-legacy':
        // Transform dynamic content using Babel
        try {
          const transformed = await this.transformDynamicContent(content);
          html = `<div class="tpn-content">${transformed}</div>`;
        } catch (error) {
          console.error('Failed to transform TPN content:', error);
          html = `<pre><code>${this.escapeHtml(content)}</code></pre>`;
        }
        break;
      
      case 'html':
        // Already HTML, just sanitize
        break;
      
      default:
        // Plain text
        html = `<pre>${this.escapeHtml(content)}</pre>`;
    }

    // Sanitize HTML
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['style'],
      ADD_ATTR: ['class', 'style'],
      ALLOW_DATA_ATTR: true
    });
  }

  /**
   * Transform dynamic content using Babel
   */
  private async transformDynamicContent(content: string): Promise<string> {
    try {
      const code = `
        const render = () => {
          const template = \`${content}\`;
          return template;
        };
        render();
      `;

      const result = transform(code, {
        presets: ['env'],
        filename: 'dynamic-content.js'
      });

      // Execute in sandboxed environment
      const func = new Function('kpt', result.code!);
      const kptNamespace = this.createKPTNamespace();
      
      return func(kptNamespace);
    } catch (error) {
      console.error('Dynamic content transformation failed:', error);
      return this.escapeHtml(content);
    }
  }

  /**
   * Create KPT namespace for dynamic content
   */
  private createKPTNamespace(): Record<string, any> {
    return {
      calculate: (formula: string) => `[Formula: ${formula}]`,
      format: (value: any, format: string) => `[Formatted: ${value}]`,
      lookup: (key: string) => `[Lookup: ${key}]`,
      conditional: (condition: boolean, trueVal: any, falseVal: any) =>
        condition ? trueVal : falseVal
    };
  }

  /**
   * Apply syntax highlighting to code
   */
  private highlightCode(
    content: string,
    format: ProcessedContent['metadata']['format']
  ): string {
    // Map format to language
    const languageMap: Record<string, string> = {
      'json': 'json',
      'html': 'html',
      'tpn-legacy': 'javascript',
      'text': 'plaintext'
    };

    const language = languageMap[format] || 'plaintext';
    
    // Apply basic highlighting (in production, use a library like Prism.js)
    let highlighted = this.escapeHtml(content);
    
    if (language === 'json') {
      // Order matters: process values before keys
      
      // Highlight booleans
      highlighted = highlighted.replace(
        /:\s*(true|false)(?=[,\s}])/g,
        ': <span class="json-boolean">$1</span>'
      );
      
      // Highlight numbers
      highlighted = highlighted.replace(
        /:\s*(-?\d+(?:\.\d+)?)(?=[,\s}])/g,
        ': <span class="json-number">$1</span>'
      );
      
      // Highlight string values
      highlighted = highlighted.replace(
        /:\s*&quot;([^&]*)&quot;/g,
        ': <span class="json-string">&quot;$1&quot;</span>'
      );
      
      // Highlight keys (anything before a colon)
      highlighted = highlighted.replace(
        /&quot;([^&]+)&quot;:/g,
        '<span class="json-key">&quot;$1&quot;</span>:'
      );
    }
    
    return `<pre><code class="language-${language}">${highlighted}</code></pre>`;
  }

  /**
   * Detect if content contains formulas
   */
  private detectFormulas(content: string): boolean {
    const formulaPatterns = [
      /\$\{[^}]*[+\-*/][^}]*\}/,  // Math operations
      /kpt\.\w+\([^)]*\)/,         // KPT function calls
      /\{\{[^}]*[+\-*/][^}]*\}\}/, // Legacy TPN formulas
      /=\s*[A-Z]+\d+/              // Spreadsheet-like references
    ];
    
    return formulaPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Detect if content contains dynamic elements
   */
  private detectDynamicContent(content: string): boolean {
    const dynamicPatterns = [
      /\$\{[^}]+\}/,        // Template literals
      /\{\{[^}]+\}\}/,      // Handlebars/TPN syntax
      /kpt\.\w+/,           // KPT namespace
      /<script[^>]*>/i,     // Script tags
      /on\w+\s*=/i          // Event handlers
    ];
    
    return dynamicPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Sort object keys recursively for consistent comparison
   */
  private sortObjectKeys(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort();
    
    for (const key of keys) {
      sorted[key] = this.sortObjectKeys(obj[key]);
    }
    
    return sorted;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    
    return text.replace(/[&<>"']/g, char => escapeMap[char]);
  }

  /**
   * Generate cache key for processed content
   */
  private getCacheKey(content: string, options: ProcessingOptions): string {
    const optionString = JSON.stringify(options);
    const contentHash = this.simpleHash(content);
    return `${contentHash}-${this.simpleHash(optionString)}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: number } {
    let totalSize = 0;
    this.cache.forEach(value => {
      totalSize += value.raw.length;
    });
    
    return {
      size: totalSize,
      entries: this.cache.size
    };
  }
}

// Export singleton instance
export const contentProcessor = new ContentProcessor();