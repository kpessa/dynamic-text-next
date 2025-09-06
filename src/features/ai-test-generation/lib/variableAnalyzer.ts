import { PopulationType } from '../types';

export interface VariableInfo {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'unknown';
  usage: 'read' | 'write' | 'both';
  dependencies: string[];
  range?: { min: number; max: number; unit?: string };
  defaultValue?: unknown;
  isRequired: boolean;
  isMedical: boolean;
  medicalCategory?: string;
}

export interface AnalysisResult {
  variables: Map<string, VariableInfo>;
  dependencies: Map<string, Set<string>>;
  complexity: number;
  hasLoops: boolean;
  hasConditionals: boolean;
  hasFunctions: boolean;
  estimatedExecutionPaths: number;
}

export class VariableAnalyzer {
  private readonly medicalPatterns: Record<string, {
    category: string;
    ranges: Record<PopulationType, { min: number; max: number; unit: string }>;
  }>;

  constructor() {
    this.medicalPatterns = {
      weight: {
        category: 'anthropometric',
        ranges: {
          NEO: { min: 0.5, max: 5, unit: 'kg' },
          CHILD: { min: 5, max: 30, unit: 'kg' },
          ADOLESCENT: { min: 30, max: 70, unit: 'kg' },
          ADULT: { min: 50, max: 150, unit: 'kg' }
        }
      },
      height: {
        category: 'anthropometric',
        ranges: {
          NEO: { min: 30, max: 60, unit: 'cm' },
          CHILD: { min: 60, max: 150, unit: 'cm' },
          ADOLESCENT: { min: 130, max: 190, unit: 'cm' },
          ADULT: { min: 150, max: 210, unit: 'cm' }
        }
      },
      age: {
        category: 'demographic',
        ranges: {
          NEO: { min: 0, max: 0.08, unit: 'years' },
          CHILD: { min: 0.08, max: 12, unit: 'years' },
          ADOLESCENT: { min: 12, max: 18, unit: 'years' },
          ADULT: { min: 18, max: 100, unit: 'years' }
        }
      },
      glucose: {
        category: 'biochemical',
        ranges: {
          NEO: { min: 40, max: 100, unit: 'mg/dL' },
          CHILD: { min: 60, max: 110, unit: 'mg/dL' },
          ADOLESCENT: { min: 70, max: 120, unit: 'mg/dL' },
          ADULT: { min: 70, max: 140, unit: 'mg/dL' }
        }
      },
      protein: {
        category: 'nutritional',
        ranges: {
          NEO: { min: 1, max: 3, unit: 'g/kg/day' },
          CHILD: { min: 1, max: 2.5, unit: 'g/kg/day' },
          ADOLESCENT: { min: 0.8, max: 2, unit: 'g/kg/day' },
          ADULT: { min: 0.8, max: 1.5, unit: 'g/kg/day' }
        }
      },
      lipids: {
        category: 'nutritional',
        ranges: {
          NEO: { min: 0.5, max: 3, unit: 'g/kg/day' },
          CHILD: { min: 1, max: 3, unit: 'g/kg/day' },
          ADOLESCENT: { min: 1, max: 2.5, unit: 'g/kg/day' },
          ADULT: { min: 1, max: 2, unit: 'g/kg/day' }
        }
      },
      sodium: {
        category: 'electrolyte',
        ranges: {
          NEO: { min: 120, max: 150, unit: 'mEq/L' },
          CHILD: { min: 130, max: 145, unit: 'mEq/L' },
          ADOLESCENT: { min: 135, max: 145, unit: 'mEq/L' },
          ADULT: { min: 135, max: 145, unit: 'mEq/L' }
        }
      },
      potassium: {
        category: 'electrolyte',
        ranges: {
          NEO: { min: 3.5, max: 5.5, unit: 'mEq/L' },
          CHILD: { min: 3.5, max: 5.0, unit: 'mEq/L' },
          ADOLESCENT: { min: 3.5, max: 5.0, unit: 'mEq/L' },
          ADULT: { min: 3.5, max: 5.0, unit: 'mEq/L' }
        }
      },
      calcium: {
        category: 'mineral',
        ranges: {
          NEO: { min: 7, max: 11, unit: 'mg/dL' },
          CHILD: { min: 8.5, max: 10.5, unit: 'mg/dL' },
          ADOLESCENT: { min: 8.5, max: 10.5, unit: 'mg/dL' },
          ADULT: { min: 8.5, max: 10.5, unit: 'mg/dL' }
        }
      },
      phosphorus: {
        category: 'mineral',
        ranges: {
          NEO: { min: 4, max: 7, unit: 'mg/dL' },
          CHILD: { min: 3.5, max: 6, unit: 'mg/dL' },
          ADOLESCENT: { min: 3, max: 5, unit: 'mg/dL' },
          ADULT: { min: 2.5, max: 4.5, unit: 'mg/dL' }
        }
      }
    };
  }

  analyze(code: string, populationType?: PopulationType): AnalysisResult {
    const variables = new Map<string, VariableInfo>();
    const dependencies = new Map<string, Set<string>>();
    
    // Extract variables
    this.extractVariables(code, variables, dependencies);
    
    // Analyze structure
    const structureAnalysis = this.analyzeCodeStructure(code);
    
    // Calculate complexity
    const complexity = this.calculateComplexity(
      variables.size,
      structureAnalysis,
      dependencies
    );
    
    // Determine types and ranges
    this.inferVariableTypes(code, variables, populationType);
    
    // Build dependency graph
    this.buildDependencyGraph(code, variables, dependencies);
    
    return {
      variables,
      dependencies,
      complexity,
      ...structureAnalysis
    };
  }

  private extractVariables(
    code: string,
    variables: Map<string, VariableInfo>,
    dependencies: Map<string, Set<string>>
  ): void {
    // Extract me.getValue patterns
    const getValuePattern = /me\.getValue\(['"]([\w_]+)['"]\)/g;
    let match;
    
    while ((match = getValuePattern.exec(code)) !== null) {
      const varName = match[1];
      if (!variables.has(varName)) {
        variables.set(varName, this.createVariableInfo(varName, 'read'));
      } else {
        const existing = variables.get(varName)!;
        if (existing.usage === 'write') {
          existing.usage = 'both';
        }
      }
    }
    
    // Extract me.setValue patterns
    const setValuePattern = /me\.setValue\(['"]([\w_]+)['"],\s*(.*?)\)/g;
    
    while ((match = setValuePattern.exec(code)) !== null) {
      const varName = match[1];
      const valueExpression = match[2];
      
      if (!variables.has(varName)) {
        variables.set(varName, this.createVariableInfo(varName, 'write'));
      } else {
        const existing = variables.get(varName)!;
        if (existing.usage === 'read') {
          existing.usage = 'both';
        }
      }
      
      // Find dependencies in the value expression
      const deps = this.findDependencies(valueExpression);
      if (deps.length > 0) {
        dependencies.set(varName, new Set(deps));
        const varInfo = variables.get(varName)!;
        varInfo.dependencies = deps;
      }
    }
    
    // Extract direct property access
    const propAccessPattern = /me\.([\w_]+)(?!\()/g;
    
    while ((match = propAccessPattern.exec(code)) !== null) {
      const varName = match[1];
      if (!['getValue', 'setValue', 'calculate'].includes(varName)) {
        if (!variables.has(varName)) {
          variables.set(varName, this.createVariableInfo(varName, 'both'));
        }
      }
    }
  }

  private createVariableInfo(name: string, usage: 'read' | 'write' | 'both'): VariableInfo {
    const isMedical = this.isMedicalVariable(name);
    const medicalCategory = isMedical ? this.getMedicalCategory(name) : undefined;
    
    return {
      name,
      type: 'unknown',
      usage,
      dependencies: [],
      isRequired: usage === 'read' || usage === 'both',
      isMedical,
      medicalCategory
    };
  }

  private isMedicalVariable(name: string): boolean {
    const lowerName = name.toLowerCase();
    return Object.keys(this.medicalPatterns).some(pattern => 
      lowerName.includes(pattern)
    );
  }

  private getMedicalCategory(name: string): string | undefined {
    const lowerName = name.toLowerCase();
    for (const [pattern, info] of Object.entries(this.medicalPatterns)) {
      if (lowerName.includes(pattern)) {
        return info.category;
      }
    }
    return undefined;
  }

  private findDependencies(expression: string): string[] {
    const deps: string[] = [];
    const getValuePattern = /me\.getValue\(['"]([\w_]+)['"]\)/g;
    let match;
    
    while ((match = getValuePattern.exec(expression)) !== null) {
      deps.push(match[1]);
    }
    
    return deps;
  }

  private analyzeCodeStructure(code: string): {
    hasLoops: boolean;
    hasConditionals: boolean;
    hasFunctions: boolean;
    estimatedExecutionPaths: number;
  } {
    const hasLoops = /for\s*\(|while\s*\(|do\s*\{|\.forEach\(|\.map\(|\.filter\(|\.reduce\(/i.test(code);
    const hasConditionals = /if\s*\(|switch\s*\(|\?\s*.*\s*:/i.test(code);
    const hasFunctions = /function\s+\w+|const\s+\w+\s*=\s*\(.*?\)\s*=>|const\s+\w+\s*=\s*function/i.test(code);
    
    // Estimate execution paths
    let paths = 1;
    
    // Count if statements
    const ifMatches = code.match(/if\s*\(/gi) || [];
    paths *= Math.pow(2, ifMatches.length);
    
    // Count ternary operators
    const ternaryMatches = code.match(/\?/g) || [];
    paths *= Math.pow(2, ternaryMatches.length);
    
    // Count switch cases
    const switchMatches = code.match(/case\s+/gi) || [];
    if (switchMatches.length > 0) {
      paths *= switchMatches.length;
    }
    
    // Cap at reasonable number
    paths = Math.min(paths, 100);
    
    return {
      hasLoops,
      hasConditionals,
      hasFunctions,
      estimatedExecutionPaths: paths
    };
  }

  private calculateComplexity(
    variableCount: number,
    structure: {
      hasLoops: boolean;
      hasConditionals: boolean;
      hasFunctions: boolean;
      estimatedExecutionPaths: number;
    },
    dependencies: Map<string, Set<string>>
  ): number {
    let complexity = 1; // Base complexity
    
    // Add for variables
    complexity += variableCount * 0.5;
    
    // Add for control structures
    if (structure.hasLoops) complexity += 3;
    if (structure.hasConditionals) complexity += 2;
    if (structure.hasFunctions) complexity += 2;
    
    // Add for execution paths
    complexity += Math.log2(structure.estimatedExecutionPaths);
    
    // Add for dependencies
    let maxDependencyDepth = 0;
    for (const deps of dependencies.values()) {
      maxDependencyDepth = Math.max(maxDependencyDepth, deps.size);
    }
    complexity += maxDependencyDepth;
    
    return Math.round(complexity);
  }

  private inferVariableTypes(
    code: string,
    variables: Map<string, VariableInfo>,
    populationType?: PopulationType
  ): void {
    for (const [varName, varInfo] of variables.entries()) {
      // Try to infer type from usage in code
      const type = this.inferTypeFromUsage(code, varName);
      varInfo.type = type;
      
      // Set range for medical variables
      if (varInfo.isMedical && populationType) {
        const range = this.getMedicalRange(varName, populationType);
        if (range) {
          varInfo.range = range;
          varInfo.defaultValue = (range.min + range.max) / 2;
        }
      }
      
      // Try to infer default value from code
      const defaultValue = this.inferDefaultValue(code, varName, type);
      if (defaultValue !== undefined) {
        varInfo.defaultValue = defaultValue;
      }
    }
  }

  private inferTypeFromUsage(code: string, varName: string): VariableInfo['type'] {
    // Check for numeric operations
    const numericPattern = new RegExp(
      `me\\.getValue\\(['"]${varName}['"]\\)\\s*[\\+\\-\\*\\/\\%]|` +
      `[\\+\\-\\*\\/\\%]\\s*me\\.getValue\\(['"]${varName}['"]\\)`,
      'i'
    );
    if (numericPattern.test(code)) {
      return 'number';
    }
    
    // Check for string concatenation
    const stringPattern = new RegExp(
      `me\\.getValue\\(['"]${varName}['"]\\)\\s*\\+\\s*['"]|` +
      `['"].*['"]\\s*\\+\\s*me\\.getValue\\(['"]${varName}['"]\\)`,
      'i'
    );
    if (stringPattern.test(code)) {
      return 'string';
    }
    
    // Check for boolean operations
    const booleanPattern = new RegExp(
      `!\\s*me\\.getValue\\(['"]${varName}['"]\\)|` +
      `me\\.getValue\\(['"]${varName}['"]\\)\\s*&&|` +
      `me\\.getValue\\(['"]${varName}['"]\\)\\s*\\|\\||` +
      `me\\.getValue\\(['"]${varName}['"]\\)\\s*===\\s*(true|false)`,
      'i'
    );
    if (booleanPattern.test(code)) {
      return 'boolean';
    }
    
    // Check for array operations
    const arrayPattern = new RegExp(
      `me\\.getValue\\(['"]${varName}['"]\\)\\[|` +
      `me\\.getValue\\(['"]${varName}['"]\\)\\.length|` +
      `me\\.getValue\\(['"]${varName}['"]\\)\\.push\\(|` +
      `me\\.getValue\\(['"]${varName}['"]\\)\\.map\\(`,
      'i'
    );
    if (arrayPattern.test(code)) {
      return 'array';
    }
    
    // Check for object operations
    const objectPattern = new RegExp(
      `me\\.getValue\\(['"]${varName}['"]\\)\\.[a-zA-Z]|` +
      `Object\\.keys\\(me\\.getValue\\(['"]${varName}['"]\\)\\)`,
      'i'
    );
    if (objectPattern.test(code)) {
      return 'object';
    }
    
    // Default to unknown
    return 'unknown';
  }

  private getMedicalRange(
    varName: string,
    populationType: PopulationType
  ): { min: number; max: number; unit?: string } | undefined {
    const lowerName = varName.toLowerCase();
    
    for (const [pattern, info] of Object.entries(this.medicalPatterns)) {
      if (lowerName.includes(pattern)) {
        return info.ranges[populationType];
      }
    }
    
    return undefined;
  }

  private inferDefaultValue(
    code: string,
    varName: string,
    type: VariableInfo['type']
  ): unknown {
    // Look for explicit default assignments
    const defaultPattern = new RegExp(
      `me\\.setValue\\(['"]${varName}['"],\\s*([^)]+)\\)`,
      'i'
    );
    const match = defaultPattern.exec(code);
    
    if (match) {
      const valueStr = match[1].trim();
      
      switch (type) {
        case 'number':
          const num = parseFloat(valueStr);
          return isNaN(num) ? 0 : num;
        case 'boolean':
          return valueStr === 'true';
        case 'string':
          return valueStr.replace(/['"]/g, '');
        case 'array':
          try {
            return JSON.parse(valueStr);
          } catch {
            return [];
          }
        case 'object':
          try {
            return JSON.parse(valueStr);
          } catch {
            return {};
          }
        default:
          return valueStr;
      }
    }
    
    // Return type-appropriate defaults
    switch (type) {
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'string':
        return '';
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return undefined;
    }
  }

  private buildDependencyGraph(
    code: string,
    variables: Map<string, VariableInfo>,
    dependencies: Map<string, Set<string>>
  ): void {
    // Find all variable assignments and their dependencies
    const assignmentPattern = /me\.setValue\(['"]([\w_]+)['"],\s*(.*?)\)/g;
    let match;
    
    while ((match = assignmentPattern.exec(code)) !== null) {
      const targetVar = match[1];
      const expression = match[2];
      
      // Find all variables used in the expression
      const usedVars = this.findDependencies(expression);
      
      if (usedVars.length > 0) {
        if (!dependencies.has(targetVar)) {
          dependencies.set(targetVar, new Set());
        }
        
        for (const usedVar of usedVars) {
          dependencies.get(targetVar)!.add(usedVar);
        }
      }
    }
    
    // Check for circular dependencies
    for (const [var1, deps1] of dependencies.entries()) {
      for (const dep of deps1) {
        const deps2 = dependencies.get(dep);
        if (deps2 && deps2.has(var1)) {
          console.warn(`Circular dependency detected between ${var1} and ${dep}`);
        }
      }
    }
  }

  getVariableSuggestions(
    analysis: AnalysisResult,
    populationType?: PopulationType
  ): Record<string, unknown> {
    const suggestions: Record<string, unknown> = {};
    
    for (const [varName, varInfo] of analysis.variables.entries()) {
      if (varInfo.defaultValue !== undefined) {
        suggestions[varName] = varInfo.defaultValue;
      } else if (varInfo.range) {
        // Use midpoint of range
        suggestions[varName] = (varInfo.range.min + varInfo.range.max) / 2;
      } else {
        // Generate based on type
        suggestions[varName] = this.generateDefaultForType(varInfo.type, varName);
      }
    }
    
    return suggestions;
  }

  private generateDefaultForType(type: VariableInfo['type'], varName: string): unknown {
    switch (type) {
      case 'number':
        return this.generateNumericDefault(varName);
      case 'boolean':
        return true;
      case 'string':
        return `${varName}_value`;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return 'test_value';
    }
  }

  private generateNumericDefault(varName: string): number {
    const lowerName = varName.toLowerCase();
    
    // Common medical defaults
    if (lowerName.includes('weight')) return 70;
    if (lowerName.includes('height')) return 170;
    if (lowerName.includes('age')) return 35;
    if (lowerName.includes('glucose')) return 100;
    if (lowerName.includes('protein')) return 1.2;
    if (lowerName.includes('lipid')) return 1.5;
    if (lowerName.includes('sodium')) return 140;
    if (lowerName.includes('potassium')) return 4.0;
    if (lowerName.includes('calcium')) return 9.5;
    if (lowerName.includes('phosphorus')) return 3.5;
    
    // Generic numeric default
    return 1;
  }
}

export default VariableAnalyzer;