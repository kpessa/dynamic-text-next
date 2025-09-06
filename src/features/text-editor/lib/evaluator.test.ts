import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  evaluateDynamicSection,
  interpolateVariables,
  matchOutput,
  runTestCase,
  validateCode,
} from './evaluator';

describe('evaluator', () => {
  describe('evaluateDynamicSection', () => {
    it('should evaluate simple expressions', () => {
      const result = evaluateDynamicSection('return 2 + 2;');
      expect(result.success).toBe(true);
      expect(result.output).toBe('4');
    });

    it('should handle string returns', () => {
      const result = evaluateDynamicSection('return "Hello World";');
      expect(result.success).toBe(true);
      expect(result.output).toBe('Hello World');
    });

    it('should handle object returns', () => {
      const result = evaluateDynamicSection('return { name: "John", age: 30 };');
      expect(result.success).toBe(true);
      expect(JSON.parse(result.output)).toEqual({ name: 'John', age: 30 });
    });

    it('should handle array returns', () => {
      const result = evaluateDynamicSection('return [1, 2, 3];');
      expect(result.success).toBe(true);
      expect(JSON.parse(result.output)).toEqual([1, 2, 3]);
    });

    it('should use context variables', () => {
      const result = evaluateDynamicSection(
        'return patientWeight * 2;',
        { patientWeight: 70 }
      );
      expect(result.success).toBe(true);
      expect(result.output).toBe('140');
    });

    it('should handle multiple context variables', () => {
      const result = evaluateDynamicSection(
        'return patientWeight + patientHeight;',
        { patientWeight: 70, patientHeight: 180 }
      );
      expect(result.success).toBe(true);
      expect(result.output).toBe('250');
    });

    it('should handle undefined returns', () => {
      const result = evaluateDynamicSection('// No return statement');
      expect(result.success).toBe(true);
      expect(result.output).toBe('undefined');
    });

    it('should handle null returns', () => {
      const result = evaluateDynamicSection('return null;');
      expect(result.success).toBe(true);
      expect(result.output).toBe('null');
    });

    it('should handle boolean returns', () => {
      const result = evaluateDynamicSection('return true;');
      expect(result.success).toBe(true);
      expect(result.output).toBe('true');
    });

    it('should handle syntax errors', () => {
      const result = evaluateDynamicSection('return 2 +');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.output).toBe('');
    });

    it('should handle runtime errors', () => {
      const result = evaluateDynamicSection('return undefinedVariable;');
      expect(result.success).toBe(false);
      expect(result.error).toContain('undefinedVariable is not defined');
    });

    it('should block access to dangerous globals', () => {
      const dangerousCode = [
        'return window;',
        'return document;',
        'return process;',
        'return require;',
        'return fetch;',
      ];

      dangerousCode.forEach(code => {
        const result = evaluateDynamicSection(code);
        expect(result.success).toBe(true);
        expect(result.output).toBe('undefined');
      });
    });

    it('should handle complex calculations', () => {
      const code = `
        const result = [];
        for (let i = 0; i < 5; i++) {
          result.push(i * 2);
        }
        return result;
      `;
      const result = evaluateDynamicSection(code);
      expect(result.success).toBe(true);
      expect(JSON.parse(result.output)).toEqual([0, 2, 4, 6, 8]);
    });

    it('should handle function definitions', () => {
      const code = `
        function add(a, b) {
          return a + b;
        }
        return add(3, 4);
      `;
      const result = evaluateDynamicSection(code);
      expect(result.success).toBe(true);
      expect(result.output).toBe('7');
    });

    it('should measure execution time', () => {
      const result = evaluateDynamicSection('return 1 + 1;');
      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.executionTime).toBeLessThan(1000);
    });
  });

  describe('interpolateVariables', () => {
    it('should interpolate simple variables', () => {
      const text = 'Hello ${name}!';
      const result = interpolateVariables(text, { name: 'John' });
      expect(result).toBe('Hello John!');
    });

    it('should interpolate multiple variables', () => {
      const text = '${greeting} ${name}, you are ${age} years old';
      const result = interpolateVariables(text, {
        greeting: 'Hello',
        name: 'John',
        age: 30,
      });
      expect(result).toBe('Hello John, you are 30 years old');
    });

    it('should handle missing variables', () => {
      const text = 'Hello ${name}!';
      const result = interpolateVariables(text, {});
      expect(result).toBe('Hello ${name}!');
    });

    it('should interpolate numeric values', () => {
      const text = 'The result is ${value}';
      const result = interpolateVariables(text, { value: 42 });
      expect(result).toBe('The result is 42');
    });

    it('should interpolate boolean values', () => {
      const text = 'Is active: ${isActive}';
      const result = interpolateVariables(text, { isActive: true });
      expect(result).toBe('Is active: true');
    });

    it('should interpolate arrays', () => {
      const text = 'Values: ${values}';
      const result = interpolateVariables(text, { values: [1, 2, 3] });
      expect(result).toContain('[');
      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).toContain('3');
    });

    it('should interpolate objects', () => {
      const text = 'User: ${user}';
      const result = interpolateVariables(text, { user: { name: 'John', age: 30 } });
      expect(result).toContain('"name"');
      expect(result).toContain('"John"');
      expect(result).toContain('"age"');
      expect(result).toContain('30');
    });

    it('should handle expressions with spaces', () => {
      const text = 'Hello ${ name }!';
      const result = interpolateVariables(text, { name: 'John' });
      expect(result).toBe('Hello John!');
    });

    it('should not evaluate dangerous expressions', () => {
      const text = 'Result: ${process.exit()}';
      const result = interpolateVariables(text, {});
      expect(result).toBe('Result: ${process.exit()}');
    });
  });

  describe('matchOutput', () => {
    it('should match exact strings', () => {
      expect(matchOutput('Hello World', 'Hello World', 'exact')).toBe(true);
      expect(matchOutput('Hello World', 'hello world', 'exact')).toBe(false);
    });

    it('should match with trimming for exact', () => {
      expect(matchOutput('  Hello World  ', 'Hello World', 'exact')).toBe(true);
    });

    it('should match contains', () => {
      expect(matchOutput('Hello World', 'World', 'contains')).toBe(true);
      expect(matchOutput('Hello World', 'Foo', 'contains')).toBe(false);
    });

    it('should match regex patterns', () => {
      expect(matchOutput('Hello World', '^Hello.*', 'regex')).toBe(true);
      expect(matchOutput('Hello World', '\\d+', 'regex')).toBe(false);
    });

    it('should handle invalid regex gracefully', () => {
      expect(matchOutput('Hello World', '[', 'regex')).toBe(false);
    });
  });

  describe('runTestCase', () => {
    it('should run a passing test case', () => {
      const result = runTestCase(
        'return 2 + 2;',
        {},
        '4',
        'exact'
      );
      expect(result.passed).toBe(true);
      expect(result.actual).toBe('4');
      expect(result.expected).toBe('4');
    });

    it('should run a failing test case', () => {
      const result = runTestCase(
        'return 2 + 2;',
        {},
        '5',
        'exact'
      );
      expect(result.passed).toBe(false);
      expect(result.actual).toBe('4');
      expect(result.expected).toBe('5');
    });

    it('should use test variables', () => {
      const result = runTestCase(
        'return x * y;',
        { x: 3, y: 4 },
        '12',
        'exact'
      );
      expect(result.passed).toBe(true);
      expect(result.actual).toBe('12');
    });

    it('should handle errors in test execution', () => {
      const result = runTestCase(
        'return undefinedVar;',
        {},
        '0',
        'exact'
      );
      expect(result.passed).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.actual).toBe('');
    });

    it('should pass with contains match', () => {
      const result = runTestCase(
        'return "Hello World";',
        {},
        'World',
        'contains'
      );
      expect(result.passed).toBe(true);
    });

    it('should pass with regex match', () => {
      const result = runTestCase(
        'return "Test123";',
        {},
        '\\d+',
        'regex'
      );
      expect(result.passed).toBe(true);
    });
  });

  describe('validateCode', () => {
    it('should accept safe code', () => {
      expect(validateCode('return 2 + 2;')).toBe(null);
      expect(validateCode('const x = 10; return x * 2;')).toBe(null);
      expect(validateCode('for (let i = 0; i < 10; i++) { }')).toBe(null);
    });

    it('should reject import statements', () => {
      const result = validateCode('import fs from "fs";');
      expect(result).toContain('dangerous pattern');
    });

    it('should reject require statements', () => {
      const result = validateCode('const fs = require("fs");');
      expect(result).toContain('dangerous pattern');
    });

    it('should reject eval', () => {
      const result = validateCode('eval("alert(1)")');
      expect(result).toContain('dangerous pattern');
    });

    it('should reject Function constructor', () => {
      const result = validateCode('new Function("alert(1)")');
      expect(result).toContain('dangerous pattern');
    });

    it('should reject __proto__ access', () => {
      const result = validateCode('obj.__proto__');
      expect(result).toContain('dangerous pattern');
    });

    it('should detect potential infinite loops', () => {
      expect(validateCode('while (true) { }')).toContain('infinite loop');
      expect(validateCode('for (;;) { }')).toContain('infinite loop');
    });

    it('should accept normal loops', () => {
      expect(validateCode('while (x < 10) { x++; }')).toBe(null);
      expect(validateCode('for (let i = 0; i < 10; i++) { }')).toBe(null);
    });
  });
});