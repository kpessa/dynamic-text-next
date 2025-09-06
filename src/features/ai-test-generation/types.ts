export type PopulationType = 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT';
export type TPNAdvisorType = 'standard' | 'advanced' | 'custom';

export interface TestCase {
  id?: string;
  name: string;
  variables: Record<string, unknown>;
  expected?: string;
  matchType?: 'exact' | 'contains' | 'regex';
}

export interface IngredientData {
  name: string;
  category: string;
  referenceRanges?: Record<PopulationType, { min: number; max: number }>;
}

export interface AITestRequest {
  sectionContent: string;
  sectionType: 'static' | 'dynamic';
  existingVariables?: Record<string, any>;
  tpnContext?: {
    advisorType: TPNAdvisorType;
    populationType: PopulationType;
    ingredients?: IngredientData[];
  };
  testCount?: number;
  testTypes?: Array<'exact' | 'contains' | 'regex'>;
}

export interface AITestResponse {
  testCases: TestCase[];
  reasoning: string;
  confidence: number;
  suggestions: string[];
  metrics: TestQualityMetrics;
}

export interface TestQualityMetrics {
  coverage: number;        // 0-100
  diversity: number;       // 0-100
  edgeCases: number;      // 0-100
  realistic: number;       // 0-100
  overall: number;        // 0-100
}

export interface GenerationStep {
  timestamp: number;
  type: 'prompt' | 'response' | 'extraction' | 'validation' | 'refinement';
  content: string;
  metadata?: Record<string, any>;
}

export interface GenerationHistory {
  id: string;
  timestamp: number;
  request: AITestRequest;
  response: AITestResponse;
  steps: GenerationStep[];
  duration: number;
}

export interface BatchGenerationRequest {
  sections: Array<{
    id: string | number;
    content: string;
    type: 'static' | 'dynamic';
  }>;
  commonContext?: AITestRequest['tpnContext'];
  testCount?: number;
  testTypes?: Array<'exact' | 'contains' | 'regex'>;
}

export interface BatchGenerationProgress {
  total: number;
  completed: number;
  failed: number;
  currentSection?: string;
  results: Record<string | number, AITestResponse | Error>;
}