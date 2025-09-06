import DOMPurify from 'dompurify';

export interface TextFormatters {
  redText: (text: string | number) => string;
  greenText: (text: string | number) => string;
  blueText: (text: string | number) => string;
  boldText: (text: string | number) => string;
  italicText: (text: string | number) => string;
  underlineText: (text: string | number) => string;
  highlightText: (text: string | number, color?: string) => string;
}

export function createTextFormatters(): TextFormatters {
  const sanitizeHtml = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['span', 'strong', 'em', 'u', 'mark'],
      ALLOWED_ATTR: ['style', 'class']
    });
  };

  const escapeHtml = (text: string | number): string => {
    const str = String(text);
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  return {
    redText: (text: string | number): string => {
      const escaped = escapeHtml(text);
      return sanitizeHtml(`<span style="color: #ef4444;">${escaped}</span>`);
    },

    greenText: (text: string | number): string => {
      const escaped = escapeHtml(text);
      return sanitizeHtml(`<span style="color: #10b981;">${escaped}</span>`);
    },

    blueText: (text: string | number): string => {
      const escaped = escapeHtml(text);
      return sanitizeHtml(`<span style="color: #3b82f6;">${escaped}</span>`);
    },

    boldText: (text: string | number): string => {
      const escaped = escapeHtml(text);
      return sanitizeHtml(`<strong>${escaped}</strong>`);
    },

    italicText: (text: string | number): string => {
      const escaped = escapeHtml(text);
      return sanitizeHtml(`<em>${escaped}</em>`);
    },

    underlineText: (text: string | number): string => {
      const escaped = escapeHtml(text);
      return sanitizeHtml(`<u>${escaped}</u>`);
    },

    highlightText: (text: string | number, color: string = '#fef3c7'): string => {
      const escaped = escapeHtml(text);
      // Validate color to prevent CSS injection
      const safeColor = /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^[a-zA-Z]+$/.test(color) 
        ? color 
        : '#fef3c7';
      return sanitizeHtml(
        `<mark style="background-color: ${safeColor}; padding: 2px 4px; border-radius: 2px;">${escaped}</mark>`
      );
    }
  };
}

export const textFormatterDocumentation = [
  {
    name: 'redText',
    category: 'Text Formatting',
    description: 'Formats text in red color',
    parameters: [
      { name: 'text', type: 'string | number', required: true, description: 'Text to format' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.redText("Critical")', result: '<span style="color: #ef4444;">Critical</span>' }
    ]
  },
  {
    name: 'greenText',
    category: 'Text Formatting',
    description: 'Formats text in green color',
    parameters: [
      { name: 'text', type: 'string | number', required: true, description: 'Text to format' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.greenText("Success")', result: '<span style="color: #10b981;">Success</span>' }
    ]
  },
  {
    name: 'blueText',
    category: 'Text Formatting',
    description: 'Formats text in blue color',
    parameters: [
      { name: 'text', type: 'string | number', required: true, description: 'Text to format' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.blueText("Information")', result: '<span style="color: #3b82f6;">Information</span>' }
    ]
  },
  {
    name: 'boldText',
    category: 'Text Formatting',
    description: 'Formats text in bold',
    parameters: [
      { name: 'text', type: 'string | number', required: true, description: 'Text to format' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.boldText("Important")', result: '<strong>Important</strong>' }
    ]
  },
  {
    name: 'italicText',
    category: 'Text Formatting',
    description: 'Formats text in italics',
    parameters: [
      { name: 'text', type: 'string | number', required: true, description: 'Text to format' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.italicText("Emphasis")', result: '<em>Emphasis</em>' }
    ]
  },
  {
    name: 'underlineText',
    category: 'Text Formatting',
    description: 'Formats text with underline',
    parameters: [
      { name: 'text', type: 'string | number', required: true, description: 'Text to format' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.underlineText("Underlined")', result: '<u>Underlined</u>' }
    ]
  },
  {
    name: 'highlightText',
    category: 'Text Formatting',
    description: 'Highlights text with a background color',
    parameters: [
      { name: 'text', type: 'string | number', required: true, description: 'Text to highlight' },
      { name: 'color', type: 'string', required: false, description: 'Background color (hex or name)', defaultValue: '#fef3c7' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.highlightText("Note")', result: '<mark style="background-color: #fef3c7;">Note</mark>' },
      { code: 'kpt.highlightText("Alert", "#ffcccc")', result: '<mark style="background-color: #ffcccc;">Alert</mark>' }
    ]
  }
];