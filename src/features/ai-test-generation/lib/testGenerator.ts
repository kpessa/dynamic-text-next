import { 
  AITestRequest, 
  AITestResponse, 
  TestCase,
  PopulationType,
  TPNAdvisorType 
} from '../types';
import AIService from './aiService';

export interface TestGeneratorConfig {
  defaultTestCount?: number;
  defaultMatchTypes?: Array<'exact' | 'contains' | 'regex'>;
  includeEdgeCases?: boolean;
  includeBoundaryConditions?: boolean;
}

export class TestGenerator {
  private aiService: AIService;
  private config: Required<TestGeneratorConfig>;

  constructor(aiService: AIService, config?: TestGeneratorConfig) {
    this.aiService = aiService;
    this.config = {
      defaultTestCount: config?.defaultTestCount ?? 5,
      defaultMatchTypes: config?.defaultMatchTypes ?? ['exact', 'contains'],
      includeEdgeCases: config?.includeEdgeCases ?? true,
      includeBoundaryConditions: config?.includeBoundaryConditions ?? true
    };
  }

  async generateTestCases(
    sectionContent: string,
    sectionType: 'static' | 'dynamic',
    options?: Partial<AITestRequest>
  ): Promise<AITestResponse> {
    const enhancedContent = this.enhanceContentWithContext(sectionContent, options);
    
    const request: AITestRequest = {
      sectionContent: enhancedContent,
      sectionType,
      testCount: options?.testCount ?? this.config.defaultTestCount,
      testTypes: options?.testTypes ?? this.config.defaultMatchTypes,
      existingVariables: options?.existingVariables,
      tpnContext: options?.tpnContext
    };

    // Add edge cases and boundary conditions if configured
    if (this.config.includeEdgeCases || this.config.includeBoundaryConditions) {
      request.testCount = Math.max(
        request.testCount ?? 5,
        this.calculateRequiredTestCount(sectionContent)
      );
    }

    const response = await this.aiService.generateTests(request);
    
    // Post-process the generated tests
    return this.postProcessTests(response, sectionContent);
  }

  private enhanceContentWithContext(
    content: string,
    options?: Partial<AITestRequest>
  ): string {
    let enhanced = content;

    // Add medical context if TPN context is provided
    if (options?.tpnContext) {
      const contextHeader = this.buildMedicalContextHeader(options.tpnContext);
      enhanced = `${contextHeader}\n\n${content}`;
    }

    // Add variable type hints from existing variables
    if (options?.existingVariables) {
      const varHints = this.buildVariableHints(options.existingVariables);
      enhanced = `${enhanced}\n\n/* Variable Type Hints:\n${varHints}\n*/`;
    }

    return enhanced;
  }

  private buildMedicalContextHeader(context: {
    advisorType: TPNAdvisorType;
    populationType: PopulationType;
    ingredients?: any[];
  }): string {
    const populationRanges = this.getPopulationReferenceRanges(context.populationType);
    
    return `/* Medical Context:
 * Advisor Type: ${context.advisorType}
 * Population: ${context.populationType}
 * Reference Ranges: ${JSON.stringify(populationRanges, null, 2)}
 * Available Ingredients: ${context.ingredients?.length ?? 0}
 */`;
  }

  private getPopulationReferenceRanges(population: PopulationType): Record<string, any> {
    const ranges: Record<PopulationType, Record<string, any>> = {
      'NEO': {
        weight: { min: 0.5, max: 5, unit: 'kg' },
        age: { min: 0, max: 0.08, unit: 'years' },
        glucose: { min: 40, max: 100, unit: 'mg/dL' },
        protein: { min: 1, max: 3, unit: 'g/kg/day' },
        lipids: { min: 0.5, max: 3, unit: 'g/kg/day' }
      },
      'CHILD': {
        weight: { min: 5, max: 30, unit: 'kg' },
        age: { min: 0.08, max: 12, unit: 'years' },
        glucose: { min: 60, max: 110, unit: 'mg/dL' },
        protein: { min: 1, max: 2.5, unit: 'g/kg/day' },
        lipids: { min: 1, max: 3, unit: 'g/kg/day' }
      },
      'ADOLESCENT': {
        weight: { min: 30, max: 70, unit: 'kg' },
        age: { min: 12, max: 18, unit: 'years' },
        glucose: { min: 70, max: 120, unit: 'mg/dL' },
        protein: { min: 0.8, max: 2, unit: 'g/kg/day' },
        lipids: { min: 1, max: 2.5, unit: 'g/kg/day' }
      },
      'ADULT': {
        weight: { min: 50, max: 150, unit: 'kg' },
        age: { min: 18, max: 100, unit: 'years' },
        glucose: { min: 70, max: 140, unit: 'mg/dL' },
        protein: { min: 0.8, max: 1.5, unit: 'g/kg/day' },
        lipids: { min: 1, max: 2, unit: 'g/kg/day' }
      }
    };

    return ranges[population] || ranges['ADULT'];
  }

  private buildVariableHints(variables: Record<string, any>): string {
    return Object.entries(variables)
      .map(([key, value]) => {
        const type = typeof value;
        const range = this.inferVariableRange(key, value);
        return ` * ${key}: ${type}${range ? ` (${range})` : ''}`;
      })
      .join('\n');
  }

  private inferVariableRange(key: string, value: any): string | null {
    const numValue = Number(value);
    if (isNaN(numValue)) return null;

    // Common medical variable patterns
    const patterns: Record<string, { min: number; max: number; unit: string }> = {
      weight: { min: 0.5, max: 200, unit: 'kg' },
      height: { min: 30, max: 250, unit: 'cm' },
      age: { min: 0, max: 120, unit: 'years' },
      glucose: { min: 20, max: 500, unit: 'mg/dL' },
      protein: { min: 0, max: 10, unit: 'g/kg/day' },
      lipids: { min: 0, max: 5, unit: 'g/kg/day' },
      sodium: { min: 100, max: 180, unit: 'mEq/L' },
      potassium: { min: 2, max: 7, unit: 'mEq/L' },
      calcium: { min: 6, max: 12, unit: 'mg/dL' },
      phosphorus: { min: 2, max: 8, unit: 'mg/dL' }
    };

    for (const [pattern, range] of Object.entries(patterns)) {
      if (key.toLowerCase().includes(pattern)) {
        return `${range.min}-${range.max} ${range.unit}`;
      }
    }

    return null;
  }

  private calculateRequiredTestCount(content: string): number {
    let count = 5; // Base count

    // Count variables
    const variableMatches = content.match(/me\.getValue\(['"](.*?)['"]\)/g) || [];
    count += Math.min(variableMatches.length, 5);

    // Count conditionals
    const conditionalMatches = content.match(/if\s*\(|switch\s*\(|\?/g) || [];
    count += Math.min(conditionalMatches.length * 2, 6);

    // Count loops
    const loopMatches = content.match(/for\s*\(|while\s*\(|\.forEach\(|\.map\(/g) || [];
    count += Math.min(loopMatches.length * 2, 4);

    return Math.min(count, 20); // Cap at 20 tests
  }

  private postProcessTests(
    response: AITestResponse,
    originalContent: string
  ): AITestResponse {
    // Extract actual variables from content for validation
    const actualVariables = this.extractVariables(originalContent);
    
    // Validate and fix test cases
    const processedTestCases = response.testCases.map(testCase => 
      this.validateAndFixTestCase(testCase, actualVariables)
    );

    // Remove duplicates
    const uniqueTestCases = this.removeDuplicateTests(processedTestCases);

    // Calculate updated metrics
    const updatedMetrics = this.recalculateMetrics(
      uniqueTestCases,
      originalContent,
      actualVariables
    );

    return {
      ...response,
      testCases: uniqueTestCases,
      metrics: updatedMetrics
    };
  }

  extractVariables(content: string): Set<string> {
    const variables = new Set<string>();
    
    // Match me.getValue patterns
    const getValuePattern = /me\.getValue\(['"](.*?)['"]\)/g;
    let match;
    while ((match = getValuePattern.exec(content)) !== null) {
      variables.add(match[1]);
    }

    // Match me.setValue patterns (for completeness)
    const setValuePattern = /me\.setValue\(['"](.*?)['"],/g;
    while ((match = setValuePattern.exec(content)) !== null) {
      variables.add(match[1]);
    }

    // Match direct property access patterns (but not method calls)
    const propAccessPattern = /me\.(\w+)(?![(\w])/g;
    while ((match = propAccessPattern.exec(content)) !== null) {
      if (!['getValue', 'setValue', 'calculate'].includes(match[1])) {
        variables.add(match[1]);
      }
    }

    return variables;
  }

  private validateAndFixTestCase(
    testCase: TestCase,
    actualVariables: Set<string>
  ): TestCase {
    const fixed = { ...testCase };

    // Ensure all actual variables are present
    for (const variable of actualVariables) {
      if (!(variable in fixed.variables)) {
        fixed.variables[variable] = this.generateDefaultValue(variable);
      }
    }

    // Remove variables that don't exist in the content
    const validVariables: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fixed.variables)) {
      if (actualVariables.has(key)) {
        validVariables[key] = value;
      }
    }
    fixed.variables = validVariables;

    // Ensure test has a valid match type
    if (!fixed.matchType || !['exact', 'contains', 'regex'].includes(fixed.matchType)) {
      fixed.matchType = 'contains';
    }

    return fixed;
  }

  private generateDefaultValue(variable: string): unknown {
    const lowerVar = variable.toLowerCase();

    // Medical-specific defaults
    if (lowerVar.includes('weight')) return 70;
    if (lowerVar.includes('height')) return 170;
    if (lowerVar.includes('age')) return 35;
    if (lowerVar.includes('glucose')) return 100;
    if (lowerVar.includes('protein')) return 1.2;
    if (lowerVar.includes('lipid')) return 1.5;
    if (lowerVar.includes('sodium')) return 140;
    if (lowerVar.includes('potassium')) return 4.0;
    if (lowerVar.includes('calcium')) return 9.5;
    if (lowerVar.includes('phosphorus')) return 3.5;

    // Boolean patterns
    if (lowerVar.includes('is') || lowerVar.includes('has') || lowerVar.includes('should')) {
      return true;
    }

    // Numeric patterns
    if (lowerVar.includes('count') || lowerVar.includes('number') || lowerVar.includes('amount')) {
      return 1;
    }

    // Default to string
    return 'test_value';
  }

  private removeDuplicateTests(testCases: TestCase[]): TestCase[] {
    const seen = new Set<string>();
    return testCases.filter(testCase => {
      const key = JSON.stringify({
        variables: testCase.variables,
        expected: testCase.expected,
        matchType: testCase.matchType
      });
      
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private recalculateMetrics(
    testCases: TestCase[],
    content: string,
    variables: Set<string>
  ): AITestResponse['metrics'] {
    const coverage = this.calculateCoverage(testCases, variables);
    const diversity = this.calculateDiversity(testCases);
    const edgeCases = this.calculateEdgeCaseScore(testCases);
    const realistic = this.calculateRealisticScore(testCases);
    
    return {
      coverage,
      diversity,
      edgeCases,
      realistic,
      overall: Math.round((coverage + diversity + edgeCases + realistic) / 4)
    };
  }

  private calculateCoverage(testCases: TestCase[], variables: Set<string>): number {
    if (variables.size === 0) return 100;

    const coveredVariables = new Set<string>();
    for (const testCase of testCases) {
      for (const variable of Object.keys(testCase.variables)) {
        coveredVariables.add(variable);
      }
    }

    return Math.round((coveredVariables.size / variables.size) * 100);
  }

  private calculateDiversity(testCases: TestCase[]): number {
    if (testCases.length === 0) return 0;

    const uniqueValueSets = new Set<string>();
    for (const testCase of testCases) {
      uniqueValueSets.add(JSON.stringify(testCase.variables));
    }

    return Math.round((uniqueValueSets.size / testCases.length) * 100);
  }

  private calculateEdgeCaseScore(testCases: TestCase[]): number {
    let edgeCaseCount = 0;

    for (const testCase of testCases) {
      for (const value of Object.values(testCase.variables)) {
        // Check for edge case values
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          value === 0 ||
          value === -1 ||
          value === Number.MAX_VALUE ||
          value === Number.MIN_VALUE ||
          (typeof value === 'boolean') ||
          (typeof value === 'string' && (value.length === 0 || value.length > 100))
        ) {
          edgeCaseCount++;
          break;
        }
      }
    }

    return Math.round((edgeCaseCount / Math.max(testCases.length, 1)) * 100);
  }

  private calculateRealisticScore(testCases: TestCase[]): number {
    let realisticCount = 0;

    for (const testCase of testCases) {
      if (this.areValuesRealistic(testCase.variables)) {
        realisticCount++;
      }
    }

    return Math.round((realisticCount / Math.max(testCases.length, 1)) * 100);
  }

  private areValuesRealistic(variables: Record<string, unknown>): boolean {
    for (const [key, value] of Object.entries(variables)) {
      const lowerKey = key.toLowerCase();
      const numValue = Number(value);

      // Check medical values are in realistic ranges
      if (!isNaN(numValue)) {
        if (lowerKey.includes('weight') && (numValue < 0.3 || numValue > 300)) return false;
        if (lowerKey.includes('age') && (numValue < 0 || numValue > 150)) return false;
        if (lowerKey.includes('glucose') && (numValue < 10 || numValue > 800)) return false;
        if (lowerKey.includes('protein') && (numValue < 0 || numValue > 20)) return false;
        if (lowerKey.includes('sodium') && (numValue < 50 || numValue > 200)) return false;
      }
    }

    return true;
  }

  generateEdgeCases(variables: Set<string>): TestCase[] {
    const edgeCases: TestCase[] = [];

    // Null/undefined case
    const nullCase: TestCase = {
      id: crypto.randomUUID(),
      name: 'All null values',
      variables: {},
      expected: '',
      matchType: 'contains'
    };
    for (const variable of variables) {
      nullCase.variables[variable] = null;
    }
    edgeCases.push(nullCase);

    // Zero/empty case
    const zeroCase: TestCase = {
      id: crypto.randomUUID(),
      name: 'Zero/empty values',
      variables: {},
      expected: '',
      matchType: 'contains'
    };
    for (const variable of variables) {
      zeroCase.variables[variable] = 0;
    }
    edgeCases.push(zeroCase);

    // Maximum values case
    const maxCase: TestCase = {
      id: crypto.randomUUID(),
      name: 'Maximum values',
      variables: {},
      expected: '',
      matchType: 'contains'
    };
    for (const variable of variables) {
      maxCase.variables[variable] = this.getMaxValue(variable);
    }
    edgeCases.push(maxCase);

    // Minimum values case
    const minCase: TestCase = {
      id: crypto.randomUUID(),
      name: 'Minimum values',
      variables: {},
      expected: '',
      matchType: 'contains'
    };
    for (const variable of variables) {
      minCase.variables[variable] = this.getMinValue(variable);
    }
    edgeCases.push(minCase);

    return edgeCases;
  }

  private getMaxValue(variable: string): unknown {
    const lowerVar = variable.toLowerCase();

    if (lowerVar.includes('weight')) return 500;
    if (lowerVar.includes('age')) return 150;
    if (lowerVar.includes('glucose')) return 1000;
    if (lowerVar.includes('protein')) return 10;

    return 999999;
  }

  private getMinValue(variable: string): unknown {
    const lowerVar = variable.toLowerCase();

    if (lowerVar.includes('weight')) return 0.1;
    if (lowerVar.includes('age')) return 0;
    if (lowerVar.includes('glucose')) return 0;
    if (lowerVar.includes('protein')) return 0;

    return -999999;
  }

  generateBoundaryConditions(variables: Set<string>): TestCase[] {
    const boundaryTests: TestCase[] = [];

    for (const variable of variables) {
      // Just below minimum
      boundaryTests.push({
        id: crypto.randomUUID(),
        name: `${variable} just below minimum`,
        variables: { [variable]: this.getMinValue(variable) },
        expected: '',
        matchType: 'contains'
      });

      // Just above maximum
      boundaryTests.push({
        id: crypto.randomUUID(),
        name: `${variable} just above maximum`,
        variables: { [variable]: this.getMaxValue(variable) },
        expected: '',
        matchType: 'contains'
      });
    }

    return boundaryTests;
  }
}

export default TestGenerator;