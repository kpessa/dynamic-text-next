import { TestCase, TestQualityMetrics } from '../types';
import { VariableAnalyzer } from './variableAnalyzer';

export interface RefinementOptions {
  removeDuplicates?: boolean;
  validateAgainstCode?: boolean;
  optimizeCoverage?: boolean;
  improveQuality?: boolean;
  targetQualityScore?: number;
}

export interface RefinementResult {
  refinedTests: TestCase[];
  removedTests: TestCase[];
  addedTests: TestCase[];
  qualityBefore: TestQualityMetrics;
  qualityAfter: TestQualityMetrics;
  recommendations: string[];
}

export class TestRefinementService {
  private variableAnalyzer: VariableAnalyzer;

  constructor() {
    this.variableAnalyzer = new VariableAnalyzer();
  }

  async refineTests(
    tests: TestCase[],
    sectionCode: string,
    options: RefinementOptions = {}
  ): Promise<RefinementResult> {
    const originalTests = [...tests];
    let refinedTests = [...tests];
    const removedTests: TestCase[] = [];
    const addedTests: TestCase[] = [];
    const recommendations: string[] = [];

    // Calculate initial quality
    const qualityBefore = this.calculateQuality(originalTests, sectionCode);

    // Step 1: Validate tests against code
    if (options.validateAgainstCode !== false) {
      const validation = this.validateTestsAgainstCode(refinedTests, sectionCode);
      refinedTests = validation.validTests;
      removedTests.push(...validation.invalidTests);
      recommendations.push(...validation.recommendations);
    }

    // Step 2: Remove duplicates
    if (options.removeDuplicates !== false) {
      const deduplication = this.removeDuplicateTests(refinedTests);
      refinedTests = deduplication.uniqueTests;
      removedTests.push(...deduplication.duplicates);
      if (deduplication.duplicates.length > 0) {
        recommendations.push(`Removed ${deduplication.duplicates.length} duplicate tests`);
      }
    }

    // Step 3: Optimize coverage
    if (options.optimizeCoverage) {
      const optimization = this.optimizeCoverage(refinedTests, sectionCode);
      refinedTests = optimization.optimizedTests;
      addedTests.push(...optimization.addedTests);
      removedTests.push(...optimization.removedTests);
      recommendations.push(...optimization.recommendations);
    }

    // Step 4: Improve quality
    if (options.improveQuality) {
      const improvement = this.improveTestQuality(
        refinedTests,
        sectionCode,
        options.targetQualityScore || 80
      );
      refinedTests = improvement.improvedTests;
      addedTests.push(...improvement.addedTests);
      recommendations.push(...improvement.recommendations);
    }

    // Calculate final quality
    const qualityAfter = this.calculateQuality(refinedTests, sectionCode);

    // Generate final recommendations
    recommendations.push(...this.generateRecommendations(
      refinedTests,
      qualityBefore,
      qualityAfter
    ));

    return {
      refinedTests,
      removedTests,
      addedTests,
      qualityBefore,
      qualityAfter,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }

  private validateTestsAgainstCode(
    tests: TestCase[],
    code: string
  ): {
    validTests: TestCase[];
    invalidTests: TestCase[];
    recommendations: string[];
  } {
    const analysis = this.variableAnalyzer.analyze(code);
    const codeVariables = analysis.variables;
    const validTests: TestCase[] = [];
    const invalidTests: TestCase[] = [];
    const recommendations: string[] = [];

    for (const test of tests) {
      let isValid = true;
      const missingVariables: string[] = [];
      const extraVariables: string[] = [];

      // Check if test variables exist in code
      for (const [varName] of Object.entries(test.variables)) {
        if (!codeVariables.has(varName)) {
          extraVariables.push(varName);
          isValid = false;
        }
      }

      // Check if required variables are present
      for (const [varName, varInfo] of codeVariables.entries()) {
        if (varInfo.isRequired && !(varName in test.variables)) {
          missingVariables.push(varName);
          isValid = false;
        }
      }

      if (isValid) {
        validTests.push(test);
      } else {
        invalidTests.push(test);
        
        if (missingVariables.length > 0) {
          recommendations.push(
            `Test "${test.name}" is missing required variables: ${missingVariables.join(', ')}`
          );
        }
        if (extraVariables.length > 0) {
          recommendations.push(
            `Test "${test.name}" contains non-existent variables: ${extraVariables.join(', ')}`
          );
        }
      }
    }

    return { validTests, invalidTests, recommendations };
  }

  private removeDuplicateTests(tests: TestCase[]): {
    uniqueTests: TestCase[];
    duplicates: TestCase[];
  } {
    const seen = new Map<string, TestCase>();
    const uniqueTests: TestCase[] = [];
    const duplicates: TestCase[] = [];

    for (const test of tests) {
      // Create a signature for the test
      const signature = this.createTestSignature(test);
      
      if (seen.has(signature)) {
        duplicates.push(test);
      } else {
        seen.set(signature, test);
        uniqueTests.push(test);
      }
    }

    return { uniqueTests, duplicates };
  }

  private createTestSignature(test: TestCase): string {
    return JSON.stringify({
      variables: test.variables,
      expected: test.expected,
      matchType: test.matchType
    });
  }

  private optimizeCoverage(
    tests: TestCase[],
    code: string
  ): {
    optimizedTests: TestCase[];
    addedTests: TestCase[];
    removedTests: TestCase[];
    recommendations: string[];
  } {
    const analysis = this.variableAnalyzer.analyze(code);
    const optimizedTests = [...tests];
    const addedTests: TestCase[] = [];
    const removedTests: TestCase[] = [];
    const recommendations: string[] = [];

    // Check variable coverage
    const coveredVariables = new Set<string>();
    for (const test of tests) {
      for (const variable of Object.keys(test.variables)) {
        coveredVariables.add(variable);
      }
    }

    // Add tests for uncovered variables
    for (const [varName, varInfo] of analysis.variables.entries()) {
      if (!coveredVariables.has(varName) && varInfo.isRequired) {
        const newTest: TestCase = {
          id: crypto.randomUUID(),
          name: `Coverage test for ${varName}`,
          variables: {
            [varName]: varInfo.defaultValue || this.generateDefaultValue(varInfo.type)
          },
          expected: '',
          matchType: 'contains'
        };
        
        addedTests.push(newTest);
        optimizedTests.push(newTest);
        recommendations.push(`Added test for uncovered variable: ${varName}`);
      }
    }

    // Check for execution path coverage
    if (analysis.estimatedExecutionPaths > tests.length) {
      const pathsToAdd = Math.min(
        analysis.estimatedExecutionPaths - tests.length,
        5 // Cap at 5 additional tests
      );
      
      if (pathsToAdd > 0) {
        recommendations.push(
          `Consider adding ${pathsToAdd} more tests to cover all execution paths`
        );
      }
    }

    // Remove redundant tests (tests that don't add coverage)
    const coverageMap = new Map<string, number>();
    
    for (const test of optimizedTests) {
      const coverage = this.calculateTestCoverage(test, analysis.variables);
      const signature = this.createTestSignature(test);
      coverageMap.set(signature, coverage);
    }

    // Sort by coverage and remove low-value tests if we have too many
    if (optimizedTests.length > 20) {
      const sorted = optimizedTests.sort((a, b) => {
        const coverageA = coverageMap.get(this.createTestSignature(a)) || 0;
        const coverageB = coverageMap.get(this.createTestSignature(b)) || 0;
        return coverageB - coverageA;
      });

      const toRemove = sorted.slice(20);
      removedTests.push(...toRemove);
      
      for (const test of toRemove) {
        const index = optimizedTests.indexOf(test);
        if (index > -1) {
          optimizedTests.splice(index, 1);
        }
      }

      recommendations.push(`Removed ${toRemove.length} low-coverage tests to optimize suite`);
    }

    return { optimizedTests, addedTests, removedTests, recommendations };
  }

  private calculateTestCoverage(
    test: TestCase,
    variables: Map<string, any>
  ): number {
    let coverage = 0;

    // Count variables covered
    for (const variable of Object.keys(test.variables)) {
      if (variables.has(variable)) {
        coverage += 1;
      }
    }

    // Bonus for edge cases
    for (const value of Object.values(test.variables)) {
      if (this.isEdgeCase(value)) {
        coverage += 0.5;
      }
    }

    return coverage;
  }

  private isEdgeCase(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      value === 0 ||
      value === -1 ||
      value === false ||
      (typeof value === 'number' && (value === Number.MAX_VALUE || value === Number.MIN_VALUE))
    );
  }

  private improveTestQuality(
    tests: TestCase[],
    code: string,
    targetScore: number
  ): {
    improvedTests: TestCase[];
    addedTests: TestCase[];
    recommendations: string[];
  } {
    const improvedTests = [...tests];
    const addedTests: TestCase[] = [];
    const recommendations: string[] = [];
    
    const currentQuality = this.calculateQuality(tests, code);

    // Add edge cases if needed
    if (currentQuality.edgeCases < targetScore) {
      const edgeCases = this.generateEdgeCaseTests(code);
      addedTests.push(...edgeCases);
      improvedTests.push(...edgeCases);
      recommendations.push(`Added ${edgeCases.length} edge case tests`);
    }

    // Improve diversity if needed
    if (currentQuality.diversity < targetScore) {
      const diverseTests = this.generateDiverseTests(code, tests);
      addedTests.push(...diverseTests);
      improvedTests.push(...diverseTests);
      recommendations.push(`Added ${diverseTests.length} tests for diversity`);
    }

    // Improve realism if needed
    if (currentQuality.realistic < targetScore) {
      recommendations.push('Review test values to ensure they use realistic medical ranges');
      // Would update test values to be more realistic
    }

    return { improvedTests, addedTests, recommendations };
  }

  private generateEdgeCaseTests(code: string): TestCase[] {
    const analysis = this.variableAnalyzer.analyze(code);
    const edgeCases: TestCase[] = [];

    // Null test
    const nullTest: TestCase = {
      id: crypto.randomUUID(),
      name: 'Edge case: null values',
      variables: {},
      expected: '',
      matchType: 'contains'
    };
    
    for (const [varName] of analysis.variables.entries()) {
      nullTest.variables[varName] = null;
    }
    edgeCases.push(nullTest);

    // Empty/zero test
    const zeroTest: TestCase = {
      id: crypto.randomUUID(),
      name: 'Edge case: zero/empty values',
      variables: {},
      expected: '',
      matchType: 'contains'
    };
    
    for (const [varName, varInfo] of analysis.variables.entries()) {
      zeroTest.variables[varName] = varInfo.type === 'string' ? '' : 0;
    }
    edgeCases.push(zeroTest);

    return edgeCases;
  }

  private generateDiverseTests(code: string, existingTests: TestCase[]): TestCase[] {
    const analysis = this.variableAnalyzer.analyze(code);
    const diverseTests: TestCase[] = [];
    
    // Generate tests with different value combinations
    const variables = Array.from(analysis.variables.keys());
    
    if (variables.length > 0) {
      // High values test
      const highTest: TestCase = {
        id: crypto.randomUUID(),
        name: 'Diverse: high values',
        variables: {},
        expected: '',
        matchType: 'contains'
      };
      
      for (const [varName, varInfo] of analysis.variables.entries()) {
        highTest.variables[varName] = varInfo.range?.max || 999;
      }
      
      // Check if this test already exists
      if (!this.testExists(highTest, existingTests)) {
        diverseTests.push(highTest);
      }
      
      // Low values test
      const lowTest: TestCase = {
        id: crypto.randomUUID(),
        name: 'Diverse: low values',
        variables: {},
        expected: '',
        matchType: 'contains'
      };
      
      for (const [varName, varInfo] of analysis.variables.entries()) {
        lowTest.variables[varName] = varInfo.range?.min || 1;
      }
      
      if (!this.testExists(lowTest, existingTests)) {
        diverseTests.push(lowTest);
      }
    }

    return diverseTests;
  }

  private testExists(test: TestCase, existingTests: TestCase[]): boolean {
    const signature = this.createTestSignature(test);
    return existingTests.some(t => this.createTestSignature(t) === signature);
  }

  private generateDefaultValue(type: string): unknown {
    switch (type) {
      case 'number':
        return 0;
      case 'string':
        return '';
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return null;
    }
  }

  calculateQuality(tests: TestCase[], code: string): TestQualityMetrics {
    const analysis = this.variableAnalyzer.analyze(code);
    
    // Calculate coverage
    const coveredVariables = new Set<string>();
    for (const test of tests) {
      for (const variable of Object.keys(test.variables)) {
        if (analysis.variables.has(variable)) {
          coveredVariables.add(variable);
        }
      }
    }
    
    const coverage = analysis.variables.size > 0
      ? Math.round((coveredVariables.size / analysis.variables.size) * 100)
      : 100;

    // Calculate diversity
    const uniqueValueSets = new Set<string>();
    for (const test of tests) {
      uniqueValueSets.add(JSON.stringify(test.variables));
    }
    
    const diversity = tests.length > 0
      ? Math.round((uniqueValueSets.size / tests.length) * 100)
      : 0;

    // Calculate edge cases
    let edgeCaseCount = 0;
    for (const test of tests) {
      for (const value of Object.values(test.variables)) {
        if (this.isEdgeCase(value)) {
          edgeCaseCount++;
          break;
        }
      }
    }
    
    const edgeCases = tests.length > 0
      ? Math.round((edgeCaseCount / tests.length) * 100)
      : 0;

    // Calculate realistic
    let realisticCount = 0;
    for (const test of tests) {
      if (this.hasRealisticValues(test, analysis)) {
        realisticCount++;
      }
    }
    
    const realistic = tests.length > 0
      ? Math.round((realisticCount / tests.length) * 100)
      : 0;

    // Calculate overall
    const overall = Math.round((coverage + diversity + edgeCases + realistic) / 4);

    return {
      coverage,
      diversity,
      edgeCases,
      realistic,
      overall
    };
  }

  private hasRealisticValues(test: TestCase, analysis: any): boolean {
    for (const [varName, value] of Object.entries(test.variables)) {
      const varInfo = analysis.variables.get(varName);
      
      if (varInfo?.range && typeof value === 'number') {
        if (value < varInfo.range.min || value > varInfo.range.max) {
          return false;
        }
      }
    }
    
    return true;
  }

  private generateRecommendations(
    tests: TestCase[],
    qualityBefore: TestQualityMetrics,
    qualityAfter: TestQualityMetrics
  ): string[] {
    const recommendations: string[] = [];

    // Quality improvements
    if (qualityAfter.overall > qualityBefore.overall) {
      recommendations.push(
        `Quality improved from ${qualityBefore.overall}% to ${qualityAfter.overall}%`
      );
    }

    // Coverage recommendations
    if (qualityAfter.coverage < 80) {
      recommendations.push(
        `Coverage is ${qualityAfter.coverage}%. Consider adding tests for uncovered variables.`
      );
    }

    // Diversity recommendations
    if (qualityAfter.diversity < 70) {
      recommendations.push(
        `Test diversity is ${qualityAfter.diversity}%. Consider varying test inputs more.`
      );
    }

    // Edge case recommendations
    if (qualityAfter.edgeCases < 30) {
      recommendations.push(
        `Only ${qualityAfter.edgeCases}% of tests cover edge cases. Add boundary condition tests.`
      );
    }

    // Test count recommendations
    if (tests.length < 3) {
      recommendations.push('Consider adding more tests for better coverage.');
    } else if (tests.length > 20) {
      recommendations.push('Consider reducing test count by removing redundant tests.');
    }

    return recommendations;
  }
}

export default TestRefinementService;