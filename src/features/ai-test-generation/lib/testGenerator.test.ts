import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { TestGenerator } from './testGenerator';
import AIService from './aiService';
import { AITestResponse } from '../types';

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'test-uuid-123')
});

describe('TestGenerator', () => {
  let mockAIService: {
    generateTests: Mock;
  };
  let testGenerator: TestGenerator;

  beforeEach(() => {
    mockAIService = {
      generateTests: vi.fn()
    };
    testGenerator = new TestGenerator(mockAIService as any);
  });

  describe('generateTestCases', () => {
    it('should generate test cases for dynamic content', async () => {
      const mockResponse: AITestResponse = {
        testCases: [
          {
            id: 'test-1',
            name: 'Test weight calculation',
            variables: { weight: 70 },
            expected: '70 kg',
            matchType: 'exact'
          }
        ],
        reasoning: 'Testing weight display',
        confidence: 0.9,
        suggestions: [],
        metrics: {
          coverage: 100,
          diversity: 100,
          edgeCases: 0,
          realistic: 100,
          overall: 75
        }
      };

      mockAIService.generateTests.mockResolvedValue(mockResponse);

      const content = 'return me.getValue("weight") + " kg";';
      const result = await testGenerator.generateTestCases(content, 'dynamic');

      expect(mockAIService.generateTests).toHaveBeenCalledWith(
        expect.objectContaining({
          sectionContent: content,
          sectionType: 'dynamic',
          testCount: 6, // 5 base + 1 for the variable
          testTypes: ['exact', 'contains']
        })
      );
      expect(result.testCases).toHaveLength(1);
    });

    it('should enhance content with medical context', async () => {
      const mockResponse: AITestResponse = {
        testCases: [],
        reasoning: 'No tests generated',
        confidence: 0.5,
        suggestions: [],
        metrics: {
          coverage: 0,
          diversity: 0,
          edgeCases: 0,
          realistic: 0,
          overall: 0
        }
      };

      mockAIService.generateTests.mockResolvedValue(mockResponse);

      const content = 'return me.getValue("glucose");';
      await testGenerator.generateTestCases(content, 'dynamic', {
        tpnContext: {
          advisorType: 'standard',
          populationType: 'ADULT',
          ingredients: []
        }
      });

      expect(mockAIService.generateTests).toHaveBeenCalledWith(
        expect.objectContaining({
          sectionContent: expect.stringContaining('Medical Context'),
          tpnContext: expect.objectContaining({
            populationType: 'ADULT'
          })
        })
      );
    });

    it('should calculate required test count based on complexity', async () => {
      const mockResponse: AITestResponse = {
        testCases: [],
        reasoning: 'Complex code',
        confidence: 0.7,
        suggestions: [],
        metrics: {
          coverage: 50,
          diversity: 50,
          edgeCases: 50,
          realistic: 50,
          overall: 50
        }
      };

      mockAIService.generateTests.mockResolvedValue(mockResponse);

      const complexContent = `
        if (me.getValue("age") > 18) {
          if (me.getValue("weight") > 70) {
            return me.getValue("protein") * 1.5;
          } else {
            return me.getValue("protein") * 1.2;
          }
        } else {
          return me.getValue("protein") * 2;
        }
      `;

      await testGenerator.generateTestCases(complexContent, 'dynamic');

      expect(mockAIService.generateTests).toHaveBeenCalledWith(
        expect.objectContaining({
          testCount: expect.any(Number)
        })
      );
      
      const calledTestCount = mockAIService.generateTests.mock.calls[0][0].testCount;
      expect(calledTestCount).toBeGreaterThan(5);
    });
  });

  describe('extractVariables', () => {
    it('should extract variables from me.getValue calls', () => {
      const content = `
        const age = me.getValue("age");
        const weight = me.getValue("weight");
        const height = me.getValue('height');
      `;

      const variables = testGenerator.extractVariables(content);
      
      expect(variables).toContain('age');
      expect(variables).toContain('weight');
      expect(variables).toContain('height');
      expect(variables.size).toBe(3);
    });

    it('should extract variables from me.setValue calls', () => {
      const content = `
        me.setValue("result", calculation);
        me.setValue('status', 'complete');
      `;

      const variables = testGenerator.extractVariables(content);
      
      expect(variables).toContain('result');
      expect(variables).toContain('status');
    });

    it('should extract direct property access', () => {
      const content = `
        const val = me.customProperty;
        me.anotherProp = 123;
      `;

      const variables = testGenerator.extractVariables(content);
      
      expect(variables).toContain('customProperty');
      expect(variables).toContain('anotherProp');
    });

    it('should not extract method names as variables', () => {
      const content = `
        me.getValue("test");
        me.setValue("test2", 123);
        me.calculate();
      `;

      const variables = testGenerator.extractVariables(content);
      
      expect(variables).not.toContain('getValue');
      expect(variables).not.toContain('setValue');
      expect(variables).not.toContain('calculate');
    });
  });

  describe('generateEdgeCases', () => {
    it('should generate edge case tests', () => {
      const variables = new Set(['weight', 'age', 'glucose']);
      const edgeCases = testGenerator.generateEdgeCases(variables);

      expect(edgeCases.length).toBeGreaterThan(0);
      
      // Should have null case
      const nullCase = edgeCases.find(tc => tc.name === 'All null values');
      expect(nullCase).toBeDefined();
      expect(nullCase?.variables.weight).toBe(null);

      // Should have zero case
      const zeroCase = edgeCases.find(tc => tc.name === 'Zero/empty values');
      expect(zeroCase).toBeDefined();
      expect(zeroCase?.variables.weight).toBe(0);

      // Should have max case
      const maxCase = edgeCases.find(tc => tc.name === 'Maximum values');
      expect(maxCase).toBeDefined();
      expect(maxCase?.variables.weight).toBe(500);

      // Should have min case
      const minCase = edgeCases.find(tc => tc.name === 'Minimum values');
      expect(minCase).toBeDefined();
      expect(minCase?.variables.weight).toBe(0.1);
    });
  });

  describe('generateBoundaryConditions', () => {
    it('should generate boundary condition tests', () => {
      const variables = new Set(['weight']);
      const boundaryTests = testGenerator.generateBoundaryConditions(variables);

      expect(boundaryTests.length).toBe(2);
      
      const belowMin = boundaryTests.find(tc => tc.name.includes('below minimum'));
      expect(belowMin).toBeDefined();
      expect(belowMin?.variables.weight).toBe(0.1);

      const aboveMax = boundaryTests.find(tc => tc.name.includes('above maximum'));
      expect(aboveMax).toBeDefined();
      expect(aboveMax?.variables.weight).toBe(500);
    });
  });

  describe('post-processing', () => {
    it('should validate and fix test cases', async () => {
      const mockResponse: AITestResponse = {
        testCases: [
          {
            id: 'test-1',
            name: 'Test with missing variable',
            variables: { weight: 70 }, // Missing 'age' variable
            expected: '70 kg, 35 years',
            matchType: 'exact'
          }
        ],
        reasoning: 'Test reasoning',
        confidence: 0.8,
        suggestions: [],
        metrics: {
          coverage: 50,
          diversity: 100,
          edgeCases: 0,
          realistic: 100,
          overall: 62
        }
      };

      mockAIService.generateTests.mockResolvedValue(mockResponse);

      const content = 'return me.getValue("weight") + " kg, " + me.getValue("age") + " years";';
      const result = await testGenerator.generateTestCases(content, 'dynamic');

      // Should add missing 'age' variable
      expect(result.testCases[0].variables).toHaveProperty('age');
      expect(result.testCases[0].variables.age).toBe(35); // Default age value
    });

    it('should remove duplicate test cases', async () => {
      const mockResponse: AITestResponse = {
        testCases: [
          {
            id: 'test-1',
            name: 'Test 1',
            variables: { weight: 70 },
            expected: '70 kg',
            matchType: 'exact'
          },
          {
            id: 'test-2',
            name: 'Test 2 (duplicate)',
            variables: { weight: 70 },
            expected: '70 kg',
            matchType: 'exact'
          },
          {
            id: 'test-3',
            name: 'Test 3 (different)',
            variables: { weight: 80 },
            expected: '80 kg',
            matchType: 'exact'
          }
        ],
        reasoning: 'Test reasoning',
        confidence: 0.8,
        suggestions: [],
        metrics: {
          coverage: 100,
          diversity: 66,
          edgeCases: 0,
          realistic: 100,
          overall: 66
        }
      };

      mockAIService.generateTests.mockResolvedValue(mockResponse);

      const content = 'return me.getValue("weight") + " kg";';
      const result = await testGenerator.generateTestCases(content, 'dynamic');

      // Should remove duplicate test case
      expect(result.testCases).toHaveLength(2);
      expect(result.testCases[0].variables.weight).toBe(70);
      expect(result.testCases[1].variables.weight).toBe(80);
    });

    it('should recalculate metrics after post-processing', async () => {
      const mockResponse: AITestResponse = {
        testCases: [
          {
            id: 'test-1',
            name: 'Test 1',
            variables: { weight: 70 },
            expected: '70 kg',
            matchType: 'exact'
          }
        ],
        reasoning: 'Test reasoning',
        confidence: 0.8,
        suggestions: [],
        metrics: {
          coverage: 50, // Wrong, should be 100
          diversity: 50, // Wrong, should be 100
          edgeCases: 50, // Wrong, should be 0
          realistic: 50, // Wrong, should be 100
          overall: 50
        }
      };

      mockAIService.generateTests.mockResolvedValue(mockResponse);

      const content = 'return me.getValue("weight") + " kg";';
      const result = await testGenerator.generateTestCases(content, 'dynamic');

      // Metrics should be recalculated
      expect(result.metrics.coverage).toBe(100); // All variables covered
      expect(result.metrics.diversity).toBe(100); // All unique
      expect(result.metrics.realistic).toBe(100); // Realistic value
      expect(result.metrics.edgeCases).toBe(0); // No edge cases
    });
  });

  describe('configuration', () => {
    it('should respect custom configuration', async () => {
      const customGenerator = new TestGenerator(mockAIService as any, {
        defaultTestCount: 10,
        defaultMatchTypes: ['regex'],
        includeEdgeCases: false,
        includeBoundaryConditions: false
      });

      const mockResponse: AITestResponse = {
        testCases: [],
        reasoning: 'Test',
        confidence: 0.5,
        suggestions: [],
        metrics: {
          coverage: 0,
          diversity: 0,
          edgeCases: 0,
          realistic: 0,
          overall: 0
        }
      };

      mockAIService.generateTests.mockResolvedValue(mockResponse);

      await customGenerator.generateTestCases('test content', 'static');

      expect(mockAIService.generateTests).toHaveBeenCalledWith(
        expect.objectContaining({
          testCount: 10,
          testTypes: ['regex']
        })
      );
    });
  });
});