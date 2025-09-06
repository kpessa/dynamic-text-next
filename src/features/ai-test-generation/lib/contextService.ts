import { 
  PopulationType, 
  TPNAdvisorType,
  IngredientData,
  AITestRequest 
} from '../types';

export interface MockMeInterface {
  getValue: (key: string) => any;
  setValue: (key: string, value: any) => void;
  calculate: (formula: string) => number;
  format: (value: any, format: string) => string;
}

export interface TPNContext {
  advisorType: TPNAdvisorType;
  populationType: PopulationType;
  ingredients: IngredientData[];
  mockMe?: MockMeInterface;
  kptFunctions?: KPTFunctionDefinition[];
  historicalPatterns?: TestPattern[];
}

export interface KPTFunctionDefinition {
  name: string;
  category: string;
  description: string;
  signature: string;
  examples: string[];
  returnType: string;
}

export interface TestPattern {
  pattern: string;
  frequency: number;
  lastUsed: Date;
  successRate: number;
  variables: string[];
}

export interface EnhancedContext {
  populationRanges: PopulationRanges;
  ingredientRanges: Record<string, IngredientRange>;
  kptFunctions: KPTFunctionDefinition[];
  mockMeContext: string;
  historicalInsights: string[];
  medicalGuidelines: string[];
}

export interface PopulationRanges {
  weight: { min: number; max: number; unit: string };
  height: { min: number; max: number; unit: string };
  age: { min: number; max: number; unit: string };
  dailyNeeds: Record<string, { min: number; max: number; unit: string }>;
}

export interface IngredientRange {
  name: string;
  category: string;
  minDose: number;
  maxDose: number;
  unit: string;
  populationSpecific: Record<PopulationType, { min: number; max: number }>;
}

export class ContextEnhancementService {
  private readonly populationData: Record<PopulationType, PopulationRanges>;
  private readonly kptFunctionLibrary: KPTFunctionDefinition[];
  private historicalPatterns: Map<string, TestPattern>;

  constructor() {
    this.populationData = this.initializePopulationData();
    this.kptFunctionLibrary = this.initializeKPTFunctions();
    this.historicalPatterns = new Map();
  }

  enhanceRequest(
    request: AITestRequest,
    additionalContext?: Partial<TPNContext>
  ): AITestRequest {
    const context = this.buildContext(request, additionalContext);
    const enhancedContent = this.injectContextIntoContent(
      request.sectionContent,
      context
    );

    return {
      ...request,
      sectionContent: enhancedContent,
      tpnContext: request.tpnContext ? {
        ...request.tpnContext,
        ...additionalContext
      } : undefined
    };
  }

  buildContext(
    request: AITestRequest,
    additionalContext?: Partial<TPNContext>
  ): EnhancedContext {
    const populationType = request.tpnContext?.populationType || 'ADULT';
    const ingredients = request.tpnContext?.ingredients || [];
    
    return {
      populationRanges: this.populationData[populationType],
      ingredientRanges: this.buildIngredientRanges(ingredients, populationType),
      kptFunctions: this.getRelevantKPTFunctions(request.sectionContent),
      mockMeContext: this.buildMockMeContext(request.existingVariables),
      historicalInsights: this.getHistoricalInsights(request.sectionContent),
      medicalGuidelines: this.getMedicalGuidelines(populationType)
    };
  }

  private injectContextIntoContent(
    content: string,
    context: EnhancedContext
  ): string {
    const contextHeader = `
/* Enhanced Medical Context
 * Population Ranges:
 *   Weight: ${context.populationRanges.weight.min}-${context.populationRanges.weight.max} ${context.populationRanges.weight.unit}
 *   Age: ${context.populationRanges.age.min}-${context.populationRanges.age.max} ${context.populationRanges.age.unit}
 * 
 * Available KPT Functions:
${context.kptFunctions.map(f => ` *   - ${f.name}: ${f.description}`).join('\n')}
 * 
 * MockMe Interface:
${context.mockMeContext}
 * 
 * Medical Guidelines:
${context.medicalGuidelines.map(g => ` *   - ${g}`).join('\n')}
 */

${content}`;

    return contextHeader;
  }

  private initializePopulationData(): Record<PopulationType, PopulationRanges> {
    return {
      NEO: {
        weight: { min: 0.5, max: 5, unit: 'kg' },
        height: { min: 35, max: 60, unit: 'cm' },
        age: { min: 0, max: 0.08, unit: 'years' },
        dailyNeeds: {
          calories: { min: 50, max: 120, unit: 'kcal/kg/day' },
          protein: { min: 1.5, max: 4, unit: 'g/kg/day' },
          lipids: { min: 0.5, max: 3, unit: 'g/kg/day' },
          glucose: { min: 4, max: 12, unit: 'mg/kg/min' },
          sodium: { min: 2, max: 4, unit: 'mEq/kg/day' },
          potassium: { min: 1, max: 3, unit: 'mEq/kg/day' },
          calcium: { min: 50, max: 140, unit: 'mg/kg/day' },
          phosphorus: { min: 30, max: 80, unit: 'mg/kg/day' }
        }
      },
      CHILD: {
        weight: { min: 5, max: 30, unit: 'kg' },
        height: { min: 60, max: 150, unit: 'cm' },
        age: { min: 0.08, max: 12, unit: 'years' },
        dailyNeeds: {
          calories: { min: 40, max: 100, unit: 'kcal/kg/day' },
          protein: { min: 1, max: 3, unit: 'g/kg/day' },
          lipids: { min: 1, max: 3, unit: 'g/kg/day' },
          glucose: { min: 3, max: 8, unit: 'mg/kg/min' },
          sodium: { min: 2, max: 3, unit: 'mEq/kg/day' },
          potassium: { min: 1, max: 2, unit: 'mEq/kg/day' },
          calcium: { min: 40, max: 100, unit: 'mg/kg/day' },
          phosphorus: { min: 20, max: 60, unit: 'mg/kg/day' }
        }
      },
      ADOLESCENT: {
        weight: { min: 30, max: 70, unit: 'kg' },
        height: { min: 130, max: 190, unit: 'cm' },
        age: { min: 12, max: 18, unit: 'years' },
        dailyNeeds: {
          calories: { min: 30, max: 60, unit: 'kcal/kg/day' },
          protein: { min: 0.8, max: 2, unit: 'g/kg/day' },
          lipids: { min: 1, max: 2.5, unit: 'g/kg/day' },
          glucose: { min: 2, max: 5, unit: 'mg/kg/min' },
          sodium: { min: 1, max: 2, unit: 'mEq/kg/day' },
          potassium: { min: 1, max: 2, unit: 'mEq/kg/day' },
          calcium: { min: 20, max: 50, unit: 'mg/kg/day' },
          phosphorus: { min: 15, max: 40, unit: 'mg/kg/day' }
        }
      },
      ADULT: {
        weight: { min: 50, max: 150, unit: 'kg' },
        height: { min: 150, max: 210, unit: 'cm' },
        age: { min: 18, max: 100, unit: 'years' },
        dailyNeeds: {
          calories: { min: 20, max: 35, unit: 'kcal/kg/day' },
          protein: { min: 0.8, max: 1.5, unit: 'g/kg/day' },
          lipids: { min: 1, max: 2, unit: 'g/kg/day' },
          glucose: { min: 1, max: 4, unit: 'mg/kg/min' },
          sodium: { min: 1, max: 2, unit: 'mEq/kg/day' },
          potassium: { min: 1, max: 1.5, unit: 'mEq/kg/day' },
          calcium: { min: 10, max: 30, unit: 'mg/kg/day' },
          phosphorus: { min: 10, max: 30, unit: 'mg/kg/day' }
        }
      }
    };
  }

  private initializeKPTFunctions(): KPTFunctionDefinition[] {
    return [
      {
        name: 'KPT.formatNumber',
        category: 'formatting',
        description: 'Format number with specified decimal places',
        signature: 'KPT.formatNumber(value: number, decimals: number): string',
        examples: ['KPT.formatNumber(1.2345, 2) // "1.23"'],
        returnType: 'string'
      },
      {
        name: 'KPT.formatMedication',
        category: 'formatting',
        description: 'Format medication dosage with units',
        signature: 'KPT.formatMedication(value: number, unit: string): string',
        examples: ['KPT.formatMedication(5, "mg") // "5 mg"'],
        returnType: 'string'
      },
      {
        name: 'KPT.calculateBMI',
        category: 'calculation',
        description: 'Calculate Body Mass Index',
        signature: 'KPT.calculateBMI(weight: number, height: number): number',
        examples: ['KPT.calculateBMI(70, 170) // 24.2'],
        returnType: 'number'
      },
      {
        name: 'KPT.calculateBSA',
        category: 'calculation',
        description: 'Calculate Body Surface Area',
        signature: 'KPT.calculateBSA(weight: number, height: number): number',
        examples: ['KPT.calculateBSA(70, 170) // 1.81'],
        returnType: 'number'
      },
      {
        name: 'KPT.checkRange',
        category: 'validation',
        description: 'Check if value is within acceptable range',
        signature: 'KPT.checkRange(value: number, min: number, max: number): boolean',
        examples: ['KPT.checkRange(5, 1, 10) // true'],
        returnType: 'boolean'
      },
      {
        name: 'KPT.showConditional',
        category: 'display',
        description: 'Conditionally display content',
        signature: 'KPT.showConditional(condition: boolean, content: string): string',
        examples: ['KPT.showConditional(true, "Show this") // "Show this"'],
        returnType: 'string'
      },
      {
        name: 'KPT.formatTPNRate',
        category: 'tpn',
        description: 'Format TPN infusion rate',
        signature: 'KPT.formatTPNRate(volume: number, hours: number): string',
        examples: ['KPT.formatTPNRate(1000, 24) // "41.7 mL/hr"'],
        returnType: 'string'
      },
      {
        name: 'KPT.calculateOsmolarity',
        category: 'tpn',
        description: 'Calculate TPN osmolarity',
        signature: 'KPT.calculateOsmolarity(components: object): number',
        examples: ['KPT.calculateOsmolarity({glucose: 250, amino: 50}) // 850'],
        returnType: 'number'
      }
    ];
  }

  private buildIngredientRanges(
    ingredients: IngredientData[],
    populationType: PopulationType
  ): Record<string, IngredientRange> {
    const ranges: Record<string, IngredientRange> = {};

    // Default ingredient ranges based on common TPN components
    const defaultIngredients = [
      {
        name: 'Dextrose',
        category: 'carbohydrate',
        minDose: 100,
        maxDose: 500,
        unit: 'g/day',
        populationSpecific: {
          NEO: { min: 5, max: 25 },
          CHILD: { min: 50, max: 200 },
          ADOLESCENT: { min: 100, max: 350 },
          ADULT: { min: 150, max: 500 }
        }
      },
      {
        name: 'Amino Acids',
        category: 'protein',
        minDose: 40,
        maxDose: 150,
        unit: 'g/day',
        populationSpecific: {
          NEO: { min: 2, max: 4 },
          CHILD: { min: 15, max: 60 },
          ADOLESCENT: { min: 30, max: 100 },
          ADULT: { min: 40, max: 150 }
        }
      },
      {
        name: 'Lipids',
        category: 'fat',
        minDose: 20,
        maxDose: 100,
        unit: 'g/day',
        populationSpecific: {
          NEO: { min: 0.5, max: 3 },
          CHILD: { min: 10, max: 40 },
          ADOLESCENT: { min: 20, max: 70 },
          ADULT: { min: 30, max: 100 }
        }
      }
    ];

    for (const ingredient of defaultIngredients) {
      ranges[ingredient.name] = {
        ...ingredient,
        populationSpecific: ingredient.populationSpecific as Record<PopulationType, { min: number; max: number }>
      };
    }

    // Add custom ingredients if provided
    for (const ingredient of ingredients) {
      if (!ranges[ingredient.name]) {
        ranges[ingredient.name] = {
          name: ingredient.name,
          category: ingredient.category,
          minDose: 0,
          maxDose: 100,
          unit: 'units',
          populationSpecific: {
            NEO: { min: 0, max: 10 },
            CHILD: { min: 0, max: 50 },
            ADOLESCENT: { min: 0, max: 75 },
            ADULT: { min: 0, max: 100 }
          }
        };
      }
    }

    return ranges;
  }

  private getRelevantKPTFunctions(content: string): KPTFunctionDefinition[] {
    const relevant: KPTFunctionDefinition[] = [];
    
    for (const func of this.kptFunctionLibrary) {
      // Check if function name appears in content or if it's commonly used
      if (
        content.includes(func.name) ||
        content.includes(func.category) ||
        this.isFunctionRelevant(func, content)
      ) {
        relevant.push(func);
      }
    }

    // Always include common functions
    const commonFunctions = ['KPT.formatNumber', 'KPT.checkRange', 'KPT.showConditional'];
    for (const funcName of commonFunctions) {
      const func = this.kptFunctionLibrary.find(f => f.name === funcName);
      if (func && !relevant.includes(func)) {
        relevant.push(func);
      }
    }

    return relevant.slice(0, 8); // Limit to 8 most relevant
  }

  private isFunctionRelevant(func: KPTFunctionDefinition, content: string): boolean {
    // Check for patterns that suggest the function might be useful
    const patterns: Record<string, string[]> = {
      formatting: ['format', 'display', 'show', 'render'],
      calculation: ['calculate', 'compute', 'derive', 'total'],
      validation: ['check', 'validate', 'verify', 'ensure'],
      tpn: ['tpn', 'infusion', 'osmolarity', 'parenteral']
    };

    const categoryPatterns = patterns[func.category] || [];
    return categoryPatterns.some(pattern => 
      content.toLowerCase().includes(pattern)
    );
  }

  private buildMockMeContext(existingVariables?: Record<string, any>): string {
    const variables = existingVariables || {};
    const lines: string[] = [
      ' * me.getValue(key) - Get variable value',
      ' * me.setValue(key, value) - Set variable value',
      ' * me.calculate(formula) - Evaluate formula',
      ' * me.format(value, format) - Format value'
    ];

    if (Object.keys(variables).length > 0) {
      lines.push(' * Available variables:');
      for (const [key, value] of Object.entries(variables)) {
        const type = typeof value;
        lines.push(` *   - ${key}: ${type}`);
      }
    }

    return lines.join('\n');
  }

  private getHistoricalInsights(content: string): string[] {
    const insights: string[] = [];
    
    // Check historical patterns
    for (const [pattern, data] of this.historicalPatterns.entries()) {
      if (content.includes(pattern) && data.successRate > 0.8) {
        insights.push(`Pattern "${pattern}" has ${Math.round(data.successRate * 100)}% success rate`);
      }
    }

    // Add general insights
    if (content.includes('if') || content.includes('switch')) {
      insights.push('Consider testing all conditional branches');
    }
    
    if (content.includes('for') || content.includes('while')) {
      insights.push('Include tests for loop boundaries and empty iterations');
    }

    if (content.includes('try') || content.includes('catch')) {
      insights.push('Test both success and error scenarios');
    }

    return insights;
  }

  private getMedicalGuidelines(populationType: PopulationType): string[] {
    const guidelines: Record<PopulationType, string[]> = {
      NEO: [
        'Start with lower doses and gradually increase',
        'Monitor glucose levels closely (risk of hypo/hyperglycemia)',
        'Calcium and phosphorus balance is critical',
        'Consider gestational age for premature infants'
      ],
      CHILD: [
        'Growth requirements increase protein and calorie needs',
        'Essential fatty acids required for development',
        'Monitor for refeeding syndrome in malnourished patients',
        'Consider age-appropriate osmolarity limits'
      ],
      ADOLESCENT: [
        'Account for pubertal growth spurts',
        'Higher protein needs during rapid growth',
        'Consider psychological aspects of nutrition support',
        'Monitor for metabolic complications'
      ],
      ADULT: [
        'Adjust for stress factors (surgery, infection, burns)',
        'Consider comorbidities (diabetes, renal, hepatic)',
        'Monitor for overfeeding complications',
        'Assess for drug-nutrient interactions'
      ]
    };

    return guidelines[populationType] || guidelines.ADULT;
  }

  recordTestPattern(
    pattern: string,
    variables: string[],
    success: boolean
  ): void {
    const existing = this.historicalPatterns.get(pattern);
    
    if (existing) {
      const totalTests = existing.frequency + 1;
      const successfulTests = existing.successRate * existing.frequency + (success ? 1 : 0);
      
      existing.frequency = totalTests;
      existing.successRate = successfulTests / totalTests;
      existing.lastUsed = new Date();
      existing.variables = [...new Set([...existing.variables, ...variables])];
    } else {
      this.historicalPatterns.set(pattern, {
        pattern,
        frequency: 1,
        lastUsed: new Date(),
        successRate: success ? 1 : 0,
        variables
      });
    }
  }

  getPopulationGuidelines(populationType: PopulationType): PopulationRanges {
    return this.populationData[populationType];
  }

  getKPTFunctionByName(name: string): KPTFunctionDefinition | undefined {
    return this.kptFunctionLibrary.find(f => f.name === name);
  }

  getAllKPTFunctions(): KPTFunctionDefinition[] {
    return [...this.kptFunctionLibrary];
  }

  exportHistoricalPatterns(): TestPattern[] {
    return Array.from(this.historicalPatterns.values())
      .sort((a, b) => b.frequency - a.frequency);
  }

  importHistoricalPatterns(patterns: TestPattern[]): void {
    for (const pattern of patterns) {
      this.historicalPatterns.set(pattern.pattern, pattern);
    }
  }
}

export default ContextEnhancementService;