import DOMPurify from 'dompurify';
import { 
  KPTNamespace, 
  FunctionRegistry, 
  FunctionDocumentation,
  KPTFunctionCategory
} from '../types';
import { createTextFormatters } from './textFormatters';
import { createNumberFormatters } from './numberFormatters';
import { createTPNFormatters } from './tpnFormatters';
import { createConditionalDisplay } from './conditionalDisplay';
import { createRangeCheckers } from './rangeCheckers';
import { createHTMLBuilders } from './htmlBuilders';
import { createUtilityFunctions } from './utilityFunctions';

export class KPTNamespaceFactory {
  private registry: FunctionRegistry = {};
  private documentation: Map<string, FunctionDocumentation> = new Map();
  private categories: Map<string, KPTFunctionCategory> = new Map();

  constructor() {
    this.initializeCategories();
  }

  private initializeCategories(): void {
    const categories: KPTFunctionCategory[] = [
      {
        name: 'Text Formatting',
        description: 'Functions for styling and formatting text',
        functions: ['redText', 'greenText', 'blueText', 'boldText', 'italicText', 'underlineText', 'highlightText'],
        icon: '✏️'
      },
      {
        name: 'Number Formatting',
        description: 'Functions for formatting numbers and currencies',
        functions: ['roundTo', 'formatNumber', 'formatPercent', 'formatCurrency'],
        icon: '🔢'
      },
      {
        name: 'TPN Formatting',
        description: 'Specialized formatters for TPN calculations',
        functions: ['formatWeight', 'formatVolume', 'formatDose', 'formatConcentration', 'formatInfusionRate', 'formatOsmolarity'],
        icon: '💊'
      },
      {
        name: 'Conditional Display',
        description: 'Functions for conditional content display',
        functions: ['showIf', 'hideIf', 'whenAbove', 'whenBelow', 'whenInRange'],
        icon: '🔀'
      },
      {
        name: 'Range Checking',
        description: 'Functions for checking values against ranges',
        functions: ['checkRange', 'isNormal', 'isCritical', 'getRangeStatus'],
        icon: '📊'
      },
      {
        name: 'HTML Builders',
        description: 'Functions for creating HTML elements',
        functions: ['createTable', 'createList', 'createAlert', 'createCard', 'createProgress'],
        icon: '🏗️'
      },
      {
        name: 'Utilities',
        description: 'General utility functions',
        functions: ['capitalize', 'pluralize', 'abbreviate'],
        icon: '🔧'
      }
    ];

    categories.forEach(cat => this.categories.set(cat.name, cat));
  }

  public createNamespace(): KPTNamespace {
    const textFormatters = createTextFormatters();
    const numberFormatters = createNumberFormatters();
    const tpnFormatters = createTPNFormatters();
    const conditionalDisplay = createConditionalDisplay();
    const rangeCheckers = createRangeCheckers();
    const htmlBuilders = createHTMLBuilders();
    const utilityFunctions = createUtilityFunctions();

    const namespace: KPTNamespace = {
      ...textFormatters,
      ...numberFormatters,
      ...tpnFormatters,
      ...conditionalDisplay,
      ...rangeCheckers,
      ...htmlBuilders,
      ...utilityFunctions
    };

    // Register all functions
    Object.entries(namespace).forEach(([name, func]) => {
      this.registry[name] = func as Function;
    });

    return namespace;
  }

  public registerCustomFunction(name: string, func: Function): void {
    if (this.registry[name]) {
      throw new Error(`Function ${name} already exists in namespace`);
    }
    this.registry[name] = func;
  }

  public unregisterFunction(name: string): void {
    delete this.registry[name];
  }

  public getFunction(name: string): Function | undefined {
    return this.registry[name];
  }

  public getAllFunctions(): string[] {
    return Object.keys(this.registry);
  }

  public getCategory(categoryName: string): KPTFunctionCategory | undefined {
    return this.categories.get(categoryName);
  }

  public getAllCategories(): KPTFunctionCategory[] {
    return Array.from(this.categories.values());
  }

  public addDocumentation(doc: FunctionDocumentation): void {
    this.documentation.set(doc.name, doc);
  }

  public getDocumentation(functionName: string): FunctionDocumentation | undefined {
    return this.documentation.get(functionName);
  }

  public generateDocumentationHTML(): string {
    const categories = this.getAllCategories();
    let html = '<div class="kpt-documentation">';
    
    categories.forEach(category => {
      html += `
        <div class="kpt-category">
          <h2>${category.icon || ''} ${category.name}</h2>
          <p>${category.description}</p>
          <div class="kpt-functions">`;
      
      category.functions.forEach(funcName => {
        const doc = this.documentation.get(funcName);
        if (doc) {
          html += `
            <div class="kpt-function">
              <h3>${doc.name}</h3>
              <p>${doc.description}</p>
              <code>${this.generateFunctionSignature(doc)}</code>
            </div>`;
        }
      });
      
      html += `
          </div>
        </div>`;
    });
    
    html += '</div>';
    return DOMPurify.sanitize(html);
  }

  private generateFunctionSignature(doc: FunctionDocumentation): string {
    const params = doc.parameters
      .map(p => `${p.name}${p.required ? '' : '?'}: ${p.type}`)
      .join(', ');
    return `${doc.name}(${params}): ${doc.returnType}`;
  }

  public injectIntoContext(context: any): any {
    const namespace = this.createNamespace();
    return {
      ...context,
      kpt: namespace
    };
  }
}

// Singleton instance
let instance: KPTNamespaceFactory | null = null;

export function getKPTNamespaceFactory(): KPTNamespaceFactory {
  if (!instance) {
    instance = new KPTNamespaceFactory();
  }
  return instance;
}

export function createKPTNamespace(): KPTNamespace {
  return getKPTNamespaceFactory().createNamespace();
}

export function injectKPTNamespace(context: any): any {
  return getKPTNamespaceFactory().injectIntoContext(context);
}