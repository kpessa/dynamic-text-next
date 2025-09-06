import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import AIService from './aiService';
import { AITestRequest } from '../types';

// Mock fetch globally
global.fetch = vi.fn();

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'test-uuid-123')
});

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (AIService as any).instance = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with config', () => {
      AIService.initialize({
        provider: 'openai',
        apiKey: 'test-key'
      });

      const instance = AIService.getInstance();
      expect(instance).toBeDefined();
    });

    it('should throw error if getInstance called without initialization', () => {
      expect(() => AIService.getInstance()).toThrow(
        'AIService must be initialized with config first'
      );
    });

    it('should return same instance on multiple getInstance calls', () => {
      AIService.initialize({
        provider: 'openai',
        apiKey: 'test-key'
      });

      const instance1 = AIService.getInstance();
      const instance2 = AIService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('rate limiting', () => {
    it('should enforce rate limit of 3 requests per second', async () => {
      AIService.initialize({
        provider: 'openai',
        apiKey: 'test-key',
        rateLimit: 3
      });

      const instance = AIService.getInstance();
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                testCases: [],
                reasoning: 'test',
                confidence: 0.8,
                suggestions: [],
                metrics: {
                  coverage: 80,
                  diversity: 70,
                  edgeCases: 60,
                  realistic: 90,
                  overall: 75
                }
              })
            }
          }]
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const request: AITestRequest = {
        sectionContent: 'test content',
        sectionType: 'dynamic'
      };

      const startTime = Date.now();
      
      // Fire 4 requests rapidly
      const promises = [
        instance.generateTests(request),
        instance.generateTests({ ...request, sectionContent: 'test 2' }),
        instance.generateTests({ ...request, sectionContent: 'test 3' }),
        instance.generateTests({ ...request, sectionContent: 'test 4' })
      ];

      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // The 4th request should have been delayed
      expect(duration).toBeGreaterThanOrEqual(900); // Allow some margin
    });
  });

  describe('caching', () => {
    it('should return cached response for identical requests', async () => {
      AIService.initialize({
        provider: 'openai',
        apiKey: 'test-key'
      });

      const instance = AIService.getInstance();
      const mockResponse = {
        testCases: [],
        reasoning: 'test',
        confidence: 0.8,
        suggestions: [],
        metrics: {
          coverage: 80,
          diversity: 70,
          edgeCases: 60,
          realistic: 90,
          overall: 75
        }
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify(mockResponse)
            }
          }]
        })
      });

      const request: AITestRequest = {
        sectionContent: 'test content',
        sectionType: 'dynamic'
      };

      // First call should hit the API
      const result1 = await instance.generateTests(request);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second identical call should use cache
      const result2 = await instance.generateTests(request);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result2).toEqual(result1);
    });

    it('should not use cache for different requests', async () => {
      AIService.initialize({
        provider: 'openai',
        apiKey: 'test-key'
      });

      const instance = AIService.getInstance();
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                testCases: [],
                reasoning: 'test',
                confidence: 0.8,
                suggestions: [],
                metrics: {
                  coverage: 80,
                  diversity: 70,
                  edgeCases: 60,
                  realistic: 90,
                  overall: 75
                }
              })
            }
          }]
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const request1: AITestRequest = {
        sectionContent: 'test content 1',
        sectionType: 'dynamic'
      };

      const request2: AITestRequest = {
        sectionContent: 'test content 2',
        sectionType: 'dynamic'
      };

      await instance.generateTests(request1);
      await instance.generateTests(request2);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('retry with backoff', () => {
    it('should retry failed requests with exponential backoff', async () => {
      AIService.initialize({
        provider: 'openai',
        apiKey: 'test-key',
        maxRetries: 3
      });

      const instance = AIService.getInstance();
      let attemptCount = 0;

      (global.fetch as any).mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  testCases: [],
                  reasoning: 'test',
                  confidence: 0.8,
                  suggestions: [],
                  metrics: {
                    coverage: 80,
                    diversity: 70,
                    edgeCases: 60,
                    realistic: 90,
                    overall: 75
                  }
                })
              }
            }]
          })
        });
      });

      const request: AITestRequest = {
        sectionContent: 'test content',
        sectionType: 'dynamic'
      };

      const result = await instance.generateTests(request);
      
      expect(attemptCount).toBe(3);
      expect(result).toBeDefined();
    });

    it('should throw error after max retries exceeded', async () => {
      AIService.initialize({
        provider: 'openai',
        apiKey: 'test-key',
        maxRetries: 2
      });

      const instance = AIService.getInstance();

      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const request: AITestRequest = {
        sectionContent: 'test content',
        sectionType: 'dynamic'
      };

      await expect(instance.generateTests(request)).rejects.toThrow('Network error');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('provider-specific generation', () => {
    it('should generate tests with OpenAI', async () => {
      AIService.initialize({
        provider: 'openai',
        apiKey: 'test-key'
      });

      const instance = AIService.getInstance();
      const mockResponse = {
        testCases: [{
          name: 'Test 1',
          variables: { age: 25 },
          expected: '25 years',
          matchType: 'exact' as const
        }],
        reasoning: 'Testing age display',
        confidence: 0.9,
        suggestions: ['Add edge cases'],
        metrics: {
          coverage: 85,
          diversity: 75,
          edgeCases: 65,
          realistic: 95,
          overall: 80
        }
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify(mockResponse)
            }
          }]
        })
      });

      const request: AITestRequest = {
        sectionContent: 'return me.getValue("age") + " years";',
        sectionType: 'dynamic',
        testCount: 1
      };

      const result = await instance.generateTests(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key'
          })
        })
      );

      expect(result.testCases).toHaveLength(1);
      expect(result.testCases[0].id).toBe('test-uuid-123');
      expect(result.confidence).toBe(0.9);
    });

    it('should generate tests with Anthropic', async () => {
      AIService.initialize({
        provider: 'anthropic',
        apiKey: 'test-key'
      });

      const instance = AIService.getInstance();
      const mockResponse = {
        testCases: [],
        reasoning: 'test',
        confidence: 0.8,
        suggestions: [],
        metrics: {
          coverage: 80,
          diversity: 70,
          edgeCases: 60,
          realistic: 90,
          overall: 75
        }
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          content: [{
            text: JSON.stringify(mockResponse)
          }]
        })
      });

      const request: AITestRequest = {
        sectionContent: 'test content',
        sectionType: 'dynamic'
      };

      await instance.generateTests(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-key'
          })
        })
      );
    });

    it('should generate tests with Gemini', async () => {
      AIService.initialize({
        provider: 'gemini',
        apiKey: 'test-key'
      });

      const instance = AIService.getInstance();
      const mockResponse = {
        testCases: [],
        reasoning: 'test',
        confidence: 0.8,
        suggestions: [],
        metrics: {
          coverage: 80,
          diversity: 70,
          edgeCases: 60,
          realistic: 90,
          overall: 75
        }
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify(mockResponse)
              }]
            }
          }]
        })
      });

      const request: AITestRequest = {
        sectionContent: 'test content',
        sectionType: 'dynamic'
      };

      await instance.generateTests(request);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  describe('timeout handling', () => {
    it('should timeout after specified duration', async () => {
      AIService.initialize({
        provider: 'openai',
        apiKey: 'test-key',
        timeout: 100
      });

      const instance = AIService.getInstance();

      (global.fetch as any).mockImplementation(() => 
        new Promise((resolve) => setTimeout(resolve, 200))
      );

      const request: AITestRequest = {
        sectionContent: 'test content',
        sectionType: 'dynamic'
      };

      await expect(instance.generateTests(request)).rejects.toThrow();
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      AIService.initialize({
        provider: 'openai',
        apiKey: 'test-key'
      });

      const instance = AIService.getInstance();
      instance.clearCache();
      
      const stats = instance.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should return cache statistics', () => {
      AIService.initialize({
        provider: 'openai',
        apiKey: 'test-key'
      });

      const instance = AIService.getInstance();
      const stats = instance.getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
    });
  });
});