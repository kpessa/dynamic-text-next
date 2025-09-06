export type SectionType = 'static' | 'dynamic';

export type TestMatchType = 'exact' | 'contains' | 'regex' | 'styles';

export interface TestCase {
  name: string;
  variables: Record<string, unknown>;
  expected: string;
  matchType: TestMatchType;
  expectedStyles?: Record<string, unknown>;
}

export interface BaseSection {
  id: string;
  type: SectionType;
  name: string;
  order: number;
  createdAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
}

export interface StaticSection extends BaseSection {
  type: 'static';
  content: string; // HTML or markdown content
}

export interface DynamicSection extends BaseSection {
  type: 'dynamic';
  content: string; // JavaScript code
  testCases?: TestCase[];
  timeout?: number; // Max execution time in ms
}

export type Section = StaticSection | DynamicSection;

export interface TestResult {
  passed: boolean;
  actual: string;
  expected: string;
  error?: string;
  executionTime?: number;
}

export interface SectionOrder {
  sectionId: string;
  order: number;
}

export interface DocumentSections {
  id: string;
  title: string;
  sections: Section[];
  createdAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
}

// Helper type guards
export function isStaticSection(section: Section): section is StaticSection {
  return section.type === 'static';
}

export function isDynamicSection(section: Section): section is DynamicSection {
  return section.type === 'dynamic';
}

// Default values
export const DEFAULT_TIMEOUT = 5000; // 5 seconds
export const MAX_TIMEOUT = 30000; // 30 seconds