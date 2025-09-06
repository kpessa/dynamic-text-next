import { 
  AITestRequest, 
  AITestResponse, 
  BatchGenerationRequest,
  BatchGenerationProgress 
} from '../types';
import AIService from './aiService';
import { TestGenerator } from './testGenerator';

export interface BatchProcessorConfig {
  maxConcurrent?: number;
  retryAttempts?: number;
  retryDelay?: number;
  progressCallback?: (progress: BatchGenerationProgress) => void;
  abortSignal?: AbortSignal;
}

export class BatchProcessor {
  private aiService: AIService;
  private testGenerator: TestGenerator;
  private config: Required<Omit<BatchProcessorConfig, 'progressCallback' | 'abortSignal'>>;
  private progressCallback?: (progress: BatchGenerationProgress) => void;
  private abortSignal?: AbortSignal;
  private activeRequests: Set<Promise<any>>;
  private queue: Array<{
    id: string | number;
    content: string;
    type: 'static' | 'dynamic';
  }>;
  private results: Record<string | number, AITestResponse | Error>;
  private completed: number;
  private failed: number;

  constructor(
    aiService: AIService,
    testGenerator: TestGenerator,
    config?: BatchProcessorConfig
  ) {
    this.aiService = aiService;
    this.testGenerator = testGenerator;
    this.config = {
      maxConcurrent: config?.maxConcurrent ?? 3,
      retryAttempts: config?.retryAttempts ?? 2,
      retryDelay: config?.retryDelay ?? 1000
    };
    this.progressCallback = config?.progressCallback;
    this.abortSignal = config?.abortSignal;
    this.activeRequests = new Set();
    this.queue = [];
    this.results = {};
    this.completed = 0;
    this.failed = 0;
  }

  async processBatch(
    request: BatchGenerationRequest
  ): Promise<BatchGenerationProgress> {
    // Initialize state
    this.queue = [...request.sections];
    this.results = {};
    this.completed = 0;
    this.failed = 0;

    // Report initial progress
    this.reportProgress(request.sections.length);

    // Process queue with concurrency control
    while (this.queue.length > 0 || this.activeRequests.size > 0) {
      // Check for abort
      if (this.abortSignal?.aborted) {
        throw new Error('Batch processing aborted');
      }

      // Start new requests up to concurrency limit
      while (
        this.queue.length > 0 && 
        this.activeRequests.size < this.config.maxConcurrent
      ) {
        const section = this.queue.shift()!;
        const promise = this.processSection(section, request);
        this.activeRequests.add(promise);
        
        // Clean up when done
        promise.finally(() => {
          this.activeRequests.delete(promise);
        });
      }

      // Wait for at least one request to complete
      if (this.activeRequests.size > 0) {
        await Promise.race(this.activeRequests);
      }
    }

    // Final progress report
    const finalProgress = this.reportProgress(request.sections.length);
    return finalProgress;
  }

  private async processSection(
    section: { id: string | number; content: string; type: 'static' | 'dynamic' },
    batchRequest: BatchGenerationRequest
  ): Promise<void> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < this.config.retryAttempts) {
      try {
        // Build request with common context
        const request: Partial<AITestRequest> = {
          ...batchRequest.commonContext,
          testCount: batchRequest.testCount,
          testTypes: batchRequest.testTypes
        };

        // Generate tests
        const response = await this.testGenerator.generateTestCases(
          section.content,
          section.type,
          request
        );

        // Store result
        this.results[section.id] = response;
        this.completed++;
        
        // Report progress
        this.reportProgress(
          this.queue.length + this.activeRequests.size + this.completed + this.failed,
          section.id.toString()
        );

        return;
      } catch (error) {
        lastError = error as Error;
        attempts++;
        
        if (attempts < this.config.retryAttempts) {
          // Wait before retry with exponential backoff
          await this.delay(this.config.retryDelay * Math.pow(2, attempts - 1));
        }
      }
    }

    // All retries failed
    this.results[section.id] = lastError || new Error('Unknown error');
    this.failed++;
    
    // Report progress with failure
    this.reportProgress(
      this.queue.length + this.activeRequests.size + this.completed + this.failed,
      section.id.toString()
    );
  }

  private reportProgress(
    total: number,
    currentSection?: string
  ): BatchGenerationProgress {
    const progress: BatchGenerationProgress = {
      total,
      completed: this.completed,
      failed: this.failed,
      currentSection,
      results: { ...this.results }
    };

    if (this.progressCallback) {
      this.progressCallback(progress);
    }

    return progress;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async processBatchWithAggregation(
    request: BatchGenerationRequest
  ): Promise<{
    progress: BatchGenerationProgress;
    summary: BatchSummary;
  }> {
    const progress = await this.processBatch(request);
    const summary = this.aggregateResults(progress);
    
    return { progress, summary };
  }

  private aggregateResults(progress: BatchGenerationProgress): BatchSummary {
    const successful: AITestResponse[] = [];
    const errors: Error[] = [];
    let totalTests = 0;
    let averageQuality = 0;
    const qualityScores: number[] = [];

    for (const result of Object.values(progress.results)) {
      if (result instanceof Error) {
        errors.push(result);
      } else {
        successful.push(result);
        totalTests += result.testCases.length;
        qualityScores.push(result.metrics.overall);
      }
    }

    if (qualityScores.length > 0) {
      averageQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
    }

    return {
      totalSections: progress.total,
      successfulSections: progress.completed,
      failedSections: progress.failed,
      totalTestsGenerated: totalTests,
      averageQuality: Math.round(averageQuality),
      errors: errors.map(e => e.message),
      duration: 0, // Would need to track start/end time
      testsByType: this.countTestsByType(successful),
      variablesCovered: this.extractAllVariables(successful)
    };
  }

  private countTestsByType(responses: AITestResponse[]): Record<string, number> {
    const counts: Record<string, number> = {
      exact: 0,
      contains: 0,
      regex: 0
    };

    for (const response of responses) {
      for (const test of response.testCases) {
        const type = test.matchType || 'contains';
        counts[type] = (counts[type] || 0) + 1;
      }
    }

    return counts;
  }

  private extractAllVariables(responses: AITestResponse[]): string[] {
    const variables = new Set<string>();

    for (const response of responses) {
      for (const test of response.testCases) {
        for (const variable of Object.keys(test.variables)) {
          variables.add(variable);
        }
      }
    }

    return Array.from(variables).sort();
  }

  // Queue management methods
  pauseProcessing(): void {
    // Implementation would pause processing
  }

  resumeProcessing(): void {
    // Implementation would resume processing
  }

  clearQueue(): void {
    this.queue = [];
  }

  getQueueStatus(): {
    pending: number;
    active: number;
    completed: number;
    failed: number;
  } {
    return {
      pending: this.queue.length,
      active: this.activeRequests.size,
      completed: this.completed,
      failed: this.failed
    };
  }
}

export interface BatchSummary {
  totalSections: number;
  successfulSections: number;
  failedSections: number;
  totalTestsGenerated: number;
  averageQuality: number;
  errors: string[];
  duration: number;
  testsByType: Record<string, number>;
  variablesCovered: string[];
}

export default BatchProcessor;