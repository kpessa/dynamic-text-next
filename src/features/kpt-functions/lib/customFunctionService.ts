import { CustomFunction, FunctionParameter } from '../types';

// Firebase imports will be added when Firebase is configured
// For now, we'll use a mock implementation
interface FirestoreDoc {
  id: string;
  data: () => any;
  exists: () => boolean;
}

let db: any = null; // Will be initialized when Firebase is configured

export class CustomFunctionService {
  private static instance: CustomFunctionService;
  private compiledFunctions: Map<string, Function> = new Map();
  private readonly collectionName = 'customFunctions';

  private constructor() {}

  public static getInstance(): CustomFunctionService {
    if (!CustomFunctionService.instance) {
      CustomFunctionService.instance = new CustomFunctionService();
    }
    return CustomFunctionService.instance;
  }

  /**
   * Validates custom function syntax and safety
   */
  public validateFunction(func: CustomFunction): { isValid: boolean; error?: string } {
    try {
      // Check for forbidden keywords that could be security risks
      const forbiddenKeywords = [
        'eval', 'Function', 'setTimeout', 'setInterval',
        'require', 'import', 'export', 'process', 'global',
        '__proto__', 'constructor', 'prototype'
      ];

      for (const keyword of forbiddenKeywords) {
        if (func.body.includes(keyword)) {
          return {
            isValid: false,
            error: `Function contains forbidden keyword: ${keyword}`
          };
        }
      }

      // Validate parameter names
      for (const param of func.parameters) {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(param.name)) {
          return {
            isValid: false,
            error: `Invalid parameter name: ${param.name}`
          };
        }
      }

      // Try to compile the function
      const paramNames = func.parameters.map(p => p.name);
      new Function(...paramNames, func.body);

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid function syntax'
      };
    }
  }

  /**
   * Compiles a custom function
   */
  private compileFunction(func: CustomFunction): Function {
    const paramNames = func.parameters.map(p => p.name);
    
    // Wrap the function body to ensure it returns the correct type
    let wrappedBody = func.body;
    if (func.returnType === 'string') {
      wrappedBody = `
        const result = (function() { ${func.body} })();
        return String(result);
      `;
    } else if (func.returnType === 'number') {
      wrappedBody = `
        const result = (function() { ${func.body} })();
        return Number(result);
      `;
    } else if (func.returnType === 'boolean') {
      wrappedBody = `
        const result = (function() { ${func.body} })();
        return Boolean(result);
      `;
    }

    return new Function(...paramNames, wrappedBody);
  }

  /**
   * Creates a new custom function
   */
  public async createFunction(func: Omit<CustomFunction, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomFunction> {
    const id = this.generateFunctionId(func.name);
    const now = new Date();
    
    const customFunction: CustomFunction = {
      ...func,
      id,
      createdAt: now,
      updatedAt: now
    };

    // Validate the function
    const validation = this.validateFunction(customFunction);
    if (!validation.isValid) {
      throw new Error(`Function validation failed: ${validation.error}`);
    }

    // Compile and cache the function
    const compiled = this.compileFunction(customFunction);
    this.compiledFunctions.set(func.name, compiled);

    // Store in Firestore when available
    if (db) {
      // Will be implemented when Firebase is configured
      console.log('Firebase storage not yet configured');
    }

    return customFunction;
  }

  /**
   * Updates an existing custom function
   */
  public async updateFunction(id: string, updates: Partial<CustomFunction>): Promise<CustomFunction> {
    const existing = await this.getFunction(id);
    if (!existing) {
      throw new Error(`Function ${id} not found`);
    }

    const updated: CustomFunction = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
      version: (existing.version || 1) + 1
    };

    // Validate the updated function
    const validation = this.validateFunction(updated);
    if (!validation.isValid) {
      throw new Error(`Function validation failed: ${validation.error}`);
    }

    // Re-compile and cache
    const compiled = this.compileFunction(updated);
    this.compiledFunctions.set(updated.name, compiled);

    // Update in Firestore when available
    if (db) {
      // Will be implemented when Firebase is configured
      console.log('Firebase storage not yet configured');
    }

    return updated;
  }

  /**
   * Gets a custom function by ID
   */
  public async getFunction(id: string): Promise<CustomFunction | null> {
    // Will be implemented when Firebase is configured
    if (!db) return null;
    return null;
  }

  /**
   * Gets all custom functions
   */
  public async getAllFunctions(): Promise<CustomFunction[]> {
    // Will be implemented when Firebase is configured
    if (!db) return [];
    return [];
  }

  /**
   * Gets public custom functions
   */
  public async getPublicFunctions(): Promise<CustomFunction[]> {
    // Will be implemented when Firebase is configured
    if (!db) return [];
    return [];
  }

  /**
   * Gets functions by category
   */
  public async getFunctionsByCategory(category: string): Promise<CustomFunction[]> {
    // Will be implemented when Firebase is configured  
    if (!db) return [];
    return [];
  }

  /**
   * Deletes a custom function
   */
  public async deleteFunction(id: string): Promise<void> {
    const func = await this.getFunction(id);
    if (func) {
      this.compiledFunctions.delete(func.name);
    }

    if (db) {
      // Will be implemented when Firebase is configured
      console.log('Firebase storage not yet configured');
    }
  }

  /**
   * Executes a custom function
   */
  public executeFunction(name: string, ...args: any[]): any {
    const compiled = this.compiledFunctions.get(name);
    if (!compiled) {
      throw new Error(`Function ${name} not found`);
    }

    try {
      return compiled(...args);
    } catch (error) {
      throw new Error(
        `Error executing function ${name}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Loads all functions into memory
   */
  public async loadAllFunctions(): Promise<void> {
    const functions = await this.getAllFunctions();
    
    for (const func of functions) {
      try {
        const compiled = this.compileFunction(func);
        this.compiledFunctions.set(func.name, compiled);
      } catch (error) {
        console.error(`Failed to compile function ${func.name}:`, error);
      }
    }
  }

  /**
   * Gets all compiled function names
   */
  public getCompiledFunctionNames(): string[] {
    return Array.from(this.compiledFunctions.keys());
  }

  /**
   * Generates a unique function ID
   */
  private generateFunctionId(name: string): string {
    const timestamp = Date.now();
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${sanitizedName}_${timestamp}`;
  }

  /**
   * Creates a function context with all custom functions
   */
  public createFunctionContext(): Record<string, Function> {
    const context: Record<string, Function> = {};
    
    for (const [name, func] of this.compiledFunctions) {
      context[name] = func;
    }
    
    return context;
  }
}