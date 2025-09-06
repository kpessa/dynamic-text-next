import DOMPurify from 'dompurify';
import { AlertType } from '../types';

export interface HTMLBuilders {
  createTable: (data: Array<Array<string | number>>, headers?: string[]) => string;
  createList: (items: Array<string | number>, ordered?: boolean) => string;
  createAlert: (message: string, type?: AlertType) => string;
  createCard: (title: string, content: string, footer?: string) => string;
  createProgress: (value: number, max: number, label?: string) => string;
}

export function createHTMLBuilders(): HTMLBuilders {
  const sanitize = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'ul', 'ol', 'li',
        'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'em', 'u', 'mark', 'br'
      ],
      ALLOWED_ATTR: ['class', 'style', 'role', 'aria-label', 'aria-valuenow', 'aria-valuemin', 'aria-valuemax']
    });
  };

  const escapeHtml = (text: string | number): string => {
    const str = String(text);
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  return {
    createTable: (data: Array<Array<string | number>>, headers?: string[]): string => {
      if (!data || data.length === 0) {
        return '';
      }

      let html = '<table class="kpt-table" style="border-collapse: collapse; width: 100%;">';
      
      // Add headers if provided
      if (headers && headers.length > 0) {
        html += '<thead><tr style="background-color: #f3f4f6;">';
        headers.forEach(header => {
          html += `<th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">${escapeHtml(header)}</th>`;
        });
        html += '</tr></thead>';
      }
      
      // Add data rows
      html += '<tbody>';
      data.forEach((row, rowIndex) => {
        const bgColor = rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb';
        html += `<tr style="background-color: ${bgColor};">`;
        row.forEach(cell => {
          html += `<td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(cell)}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      
      return sanitize(html);
    },

    createList: (items: Array<string | number>, ordered: boolean = false): string => {
      if (!items || items.length === 0) {
        return '';
      }

      const tag = ordered ? 'ol' : 'ul';
      let html = `<${tag} class="kpt-list" style="margin: 8px 0; padding-left: 20px;">`;
      
      items.forEach(item => {
        html += `<li style="margin: 4px 0;">${escapeHtml(item)}</li>`;
      });
      
      html += `</${tag}>`;
      
      return sanitize(html);
    },

    createAlert: (message: string, type: AlertType = 'info'): string => {
      const colors = {
        info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
        warning: { bg: '#fed7aa', border: '#f97316', text: '#9a3412' },
        error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
        success: { bg: '#d1fae5', border: '#10b981', text: '#065f46' }
      };
      
      const color = colors[type] || colors.info;
      
      const html = `
        <div class="kpt-alert kpt-alert-${type}" style="
          padding: 12px 16px;
          background-color: ${color.bg};
          border-left: 4px solid ${color.border};
          color: ${color.text};
          border-radius: 4px;
          margin: 8px 0;
        ">
          ${escapeHtml(message)}
        </div>
      `;
      
      return sanitize(html);
    },

    createCard: (title: string, content: string, footer?: string): string => {
      let html = `
        <div class="kpt-card" style="
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          margin: 8px 0;
        ">
      `;
      
      // Card header
      if (title) {
        html += `
          <div class="kpt-card-header" style="
            padding: 12px 16px;
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            font-weight: 600;
          ">
            ${escapeHtml(title)}
          </div>
        `;
      }
      
      // Card content
      html += `
        <div class="kpt-card-content" style="padding: 16px;">
          ${content} <!-- Content might contain HTML, so don't escape -->
        </div>
      `;
      
      // Card footer
      if (footer) {
        html += `
          <div class="kpt-card-footer" style="
            padding: 12px 16px;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
          ">
            ${footer} <!-- Footer might contain HTML, so don't escape -->
          </div>
        `;
      }
      
      html += '</div>';
      
      return sanitize(html);
    },

    createProgress: (value: number, max: number, label?: string): string => {
      const percentage = Math.min(100, Math.max(0, (value / max) * 100));
      const displayValue = percentage.toFixed(0);
      
      let html = '<div class="kpt-progress" style="margin: 8px 0;">';
      
      // Add label if provided
      if (label) {
        html += `
          <div class="kpt-progress-label" style="margin-bottom: 4px; font-size: 14px;">
            ${escapeHtml(label)}
          </div>
        `;
      }
      
      // Progress bar container
      html += `
        <div class="kpt-progress-bar" style="
          width: 100%;
          height: 20px;
          background-color: #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        ">
          <div class="kpt-progress-fill" style="
            width: ${displayValue}%;
            height: 100%;
            background-color: #3b82f6;
            transition: width 0.3s ease;
          " role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}">
          </div>
          <span style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 12px;
            font-weight: 600;
            color: ${percentage > 50 ? '#ffffff' : '#374151'};
          ">
            ${displayValue}%
          </span>
        </div>
      `;
      
      html += '</div>';
      
      return sanitize(html);
    }
  };
}

export const htmlBuilderDocumentation = [
  {
    name: 'createTable',
    category: 'HTML Builders',
    description: 'Creates an HTML table from data',
    parameters: [
      { name: 'data', type: 'Array<Array<string|number>>', required: true, description: 'Table data rows' },
      { name: 'headers', type: 'string[]', required: false, description: 'Table headers' }
    ],
    returnType: 'string',
    examples: [
      { 
        code: 'kpt.createTable([["A", 1], ["B", 2]], ["Name", "Value"])', 
        result: '<table>...</table>' 
      }
    ]
  },
  {
    name: 'createList',
    category: 'HTML Builders',
    description: 'Creates an HTML list',
    parameters: [
      { name: 'items', type: 'Array<string|number>', required: true, description: 'List items' },
      { name: 'ordered', type: 'boolean', required: false, description: 'Use ordered list', defaultValue: false }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.createList(["Item 1", "Item 2"])', result: '<ul><li>Item 1</li><li>Item 2</li></ul>' },
      { code: 'kpt.createList(["First", "Second"], true)', result: '<ol><li>First</li><li>Second</li></ol>' }
    ]
  },
  {
    name: 'createAlert',
    category: 'HTML Builders',
    description: 'Creates an alert/notification box',
    parameters: [
      { name: 'message', type: 'string', required: true, description: 'Alert message' },
      { name: 'type', type: 'AlertType', required: false, description: 'Alert type', defaultValue: 'info' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.createAlert("Information", "info")', result: '<div class="kpt-alert">...</div>' },
      { code: 'kpt.createAlert("Error!", "error")', result: '<div class="kpt-alert kpt-alert-error">...</div>' }
    ]
  },
  {
    name: 'createCard',
    category: 'HTML Builders',
    description: 'Creates a card component',
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'Card title' },
      { name: 'content', type: 'string', required: true, description: 'Card content (can contain HTML)' },
      { name: 'footer', type: 'string', required: false, description: 'Card footer (can contain HTML)' }
    ],
    returnType: 'string',
    examples: [
      { 
        code: 'kpt.createCard("Title", "Content", "Footer")', 
        result: '<div class="kpt-card">...</div>' 
      }
    ]
  },
  {
    name: 'createProgress',
    category: 'HTML Builders',
    description: 'Creates a progress bar',
    parameters: [
      { name: 'value', type: 'number', required: true, description: 'Current value' },
      { name: 'max', type: 'number', required: true, description: 'Maximum value' },
      { name: 'label', type: 'string', required: false, description: 'Progress label' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.createProgress(75, 100)', result: '<div class="kpt-progress">...75%...</div>' },
      { code: 'kpt.createProgress(50, 100, "Loading")', result: '<div>Loading...50%...</div>' }
    ]
  }
];