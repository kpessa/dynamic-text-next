import { AITestRequest, AITestResponse } from '../types';

export type AIProvider = 'openai' | 'anthropic' | 'gemini';

interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  maxRetries?: number;
  timeout?: number;
  rateLimit?: number;
}

interface RateLimitState {
  requestCount: number;
  windowStart: number;
}

class AIService {
  private static instance: AIService;
  private config: AIServiceConfig;
  private rateLimitState: RateLimitState;
  private cache: Map<string, { response: AITestResponse; timestamp: number }>;
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds
  private readonly RATE_LIMIT_WINDOW = 1000; // 1 second
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly DEFAULT_MAX_RETRIES = 3;

  private constructor(config: AIServiceConfig) {
    this.config = {
      ...config,
      maxRetries: config.maxRetries ?? this.DEFAULT_MAX_RETRIES,
      timeout: config.timeout ?? this.DEFAULT_TIMEOUT,
      rateLimit: config.rateLimit ?? 3
    };
    this.rateLimitState = {
      requestCount: 0,
      windowStart: Date.now()
    };
    this.cache = new Map();
  }

  public static getInstance(config?: AIServiceConfig): AIService {
    if (!AIService.instance && config) {
      AIService.instance = new AIService(config);
    } else if (!AIService.instance) {
      throw new Error('AIService must be initialized with config first');
    }
    return AIService.instance;
  }

  public static initialize(config: AIServiceConfig): void {
    AIService.instance = new AIService(config);
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const windowElapsed = now - this.rateLimitState.windowStart;

    if (windowElapsed >= this.RATE_LIMIT_WINDOW) {
      this.rateLimitState = {
        requestCount: 0,
        windowStart: now
      };
    }

    if (this.rateLimitState.requestCount >= (this.config.rateLimit ?? 3)) {
      const waitTime = this.RATE_LIMIT_WINDOW - windowElapsed;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.rateLimitState = {
        requestCount: 0,
        windowStart: Date.now()
      };
    }

    this.rateLimitState.requestCount++;
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= (this.config.maxRetries ?? this.DEFAULT_MAX_RETRIES)) {
        throw error;
      }

      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithBackoff(fn, attempt + 1);
    }
  }

  private getCacheKey(request: AITestRequest): string {
    const key = JSON.stringify({
      content: request.sectionContent,
      type: request.sectionType,
      testCount: request.testCount,
      testTypes: request.testTypes,
      provider: this.config.provider
    });
    return Buffer.from(key).toString('base64');
  }

  private checkCache(key: string): AITestResponse | null {
    const cached = this.cache.get(key);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < this.CACHE_TTL) {
        return cached.response;
      }
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, response: AITestResponse): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });

    // Clean up old cache entries
    if (this.cache.size > 100) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      for (let i = 0; i < 20; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  public async generateTests(request: AITestRequest): Promise<AITestResponse> {
    const cacheKey = this.getCacheKey(request);
    const cachedResponse = this.checkCache(cacheKey);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    await this.enforceRateLimit();

    const response = await this.retryWithBackoff(async () => {
      switch (this.config.provider) {
        case 'openai':
          return await this.generateWithOpenAI(request);
        case 'anthropic':
          return await this.generateWithAnthropic(request);
        case 'gemini':
          return await this.generateWithGemini(request);
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`);
      }
    });

    this.setCache(cacheKey, response);
    return response;
  }

  private async generateWithOpenAI(request: AITestRequest): Promise<AITestResponse> {
    const prompt = this.buildPrompt(request);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert test case generator for medical calculation software. Generate comprehensive test cases with realistic medical values.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data.choices[0].message.content);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  private async generateWithAnthropic(request: AITestRequest): Promise<AITestResponse> {
    const prompt = this.buildPrompt(request);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data.content[0].text);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  private async generateWithGemini(request: AITestRequest): Promise<AITestResponse> {
    const prompt = this.buildPrompt(request);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2000
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data.candidates[0].content.parts[0].text);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  private buildPrompt(request: AITestRequest): string {
    const contextInfo = request.tpnContext ? `
Context Information:
- Advisor Type: ${request.tpnContext.advisorType}
- Population Type: ${request.tpnContext.populationType}
- Available Ingredients: ${request.tpnContext.ingredients?.map(i => i.name).join(', ') || 'None'}
` : '';

    const testTypesInfo = request.testTypes ? 
      `Test Match Types to Use: ${request.testTypes.join(', ')}` : 
      'Test Match Types: Use appropriate mix of exact, contains, and regex';

    return `Generate comprehensive test cases for the following code section.

Section Type: ${request.sectionType}
Section Content:
${request.sectionContent}

${contextInfo}

Existing Variables (if any):
${JSON.stringify(request.existingVariables || {}, null, 2)}

Requirements:
1. Generate ${request.testCount || 5} diverse test cases
2. ${testTypesInfo}
3. Extract all variables from me.getValue() calls
4. Use realistic medical values within appropriate ranges
5. Include edge cases and boundary conditions
6. Provide reasoning for test selection
7. Score the quality of generated tests

Return response as JSON with this structure:
{
  "testCases": [
    {
      "name": "descriptive test name",
      "variables": { "key": value },
      "expected": "expected output",
      "matchType": "exact|contains|regex"
    }
  ],
  "reasoning": "explanation of test strategy",
  "confidence": 0.0-1.0,
  "suggestions": ["improvement suggestions"],
  "metrics": {
    "coverage": 0-100,
    "diversity": 0-100,
    "edgeCases": 0-100,
    "realistic": 0-100,
    "overall": 0-100
  }
}`;
  }

  private parseAIResponse(responseText: string): AITestResponse {
    try {
      const parsed = JSON.parse(responseText);
      
      // Validate and sanitize the response
      return {
        testCases: Array.isArray(parsed.testCases) ? parsed.testCases.map((tc: any) => ({
          id: crypto.randomUUID(),
          name: String(tc.name || 'Unnamed Test'),
          variables: tc.variables || {},
          expected: String(tc.expected || ''),
          matchType: ['exact', 'contains', 'regex'].includes(tc.matchType) ? 
            tc.matchType : 'contains'
        })) : [],
        reasoning: String(parsed.reasoning || 'No reasoning provided'),
        confidence: Number(parsed.confidence) || 0.5,
        suggestions: Array.isArray(parsed.suggestions) ? 
          parsed.suggestions.map(String) : [],
        metrics: {
          coverage: Number(parsed.metrics?.coverage) || 0,
          diversity: Number(parsed.metrics?.diversity) || 0,
          edgeCases: Number(parsed.metrics?.edgeCases) || 0,
          realistic: Number(parsed.metrics?.realistic) || 0,
          overall: Number(parsed.metrics?.overall) || 0
        }
      };
    } catch (error) {
      throw new Error('Failed to parse AI response: ' + error);
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      hits: 0, // Would need to track this
      misses: 0 // Would need to track this
    };
  }
}

export default AIService;