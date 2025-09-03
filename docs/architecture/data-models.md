# Data Models

Define the core data models/entities that will be shared between frontend and backend for the Dynamic Text Next TPN application, aligned with the parent project's type system.

**Important Note:** This application is designed to be **PHI-free**. All patient data will be anonymous or simulated for testing purposes. No real patient information will be stored.

## Core Types (Aligned with Parent Project)

### Section and Test Types
```typescript
// From parent project types/section.ts
export interface TestCase {
  name: string;
  variables: Record<string, any>;
  expected: string;
  matchType: 'exact' | 'contains' | 'regex' | 'styles';
  expectedStyles?: Record<string, any>;
}

export interface Section {
  id: number;
  type: 'static' | 'dynamic';
  name: string;
  content: string;
  testCases: TestCase[];
}

export interface TestResult {
  passed: boolean;
  actual?: string;
  expected?: string;
  error?: string;
  testCase: TestCase;
}

export interface SectionTestResult {
  sectionId: number;
  sectionName: string;
  results: TestResult[];
}

export interface TestSummary {
  sections: SectionTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}
```

### TPN Types
```typescript
// From parent project types/tpn.ts
export type TPNAdvisorType = 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT';

export type TPNAdvisorAlias = 'neonatal' | 'child' | 'adolescent' | 'adult' | 'infant';

export interface TPNAdvisorMapping {
  readonly NEO: 'neonatal' | 'infant';
  readonly CHILD: 'child';
  readonly ADOLESCENT: 'adolescent';
  readonly ADULT: 'adult';
}

export interface TPNInstance {
  values: Record<string, any>;
  advisorType?: TPNAdvisorType;
}

export interface TPNValues {
  [key: string]: any;
}

export interface MockMeInterface {
  getValue: (key: string) => any;
  maxP: (value: number, precision?: number) => string;
  calculate?: (expression: string) => any;
}
```

### Workspace Types
```typescript
// From parent project types/workspace.ts
export interface LoadedIngredient {
  id?: string;
  name: string;
  // Extended for Next.js version
  keyname?: string;
  type?: 'Macronutrient' | 'Micronutrient' | 'Additive' | 'Salt' | 'Diluent' | 'Other';
  referenceRanges?: ReferenceRange[];
}

export interface LoadedReference {
  id: string;
  name?: string;
  healthSystem?: string;
  populationType?: string;
  validationStatus?: 'untested' | 'passed' | 'failed' | 'partial';
  validationNotes?: string;
  validatedBy?: string;
  validatedAt?: string | Date;
  updatedAt?: string | Date;
  version?: string;
  sections?: Section[];
}

export interface ValidationData {
  status: 'untested' | 'passed' | 'failed' | 'partial';
  notes: string;
  validatedBy: string | null;
  validatedAt: Date | null;
}
```

## User
**Purpose:** Represents authenticated users including healthcare providers, nutritionists, and administrators

**Key Attributes:**
- id: string - Unique Firebase Auth UID
- email: string - User's email address
- displayName: string - User's display name
- role: UserRole - User's role (provider, nutritionist, admin)
- organization?: string - Optional organization name
- createdAt: Timestamp - Account creation date
- lastLogin: Timestamp - Last login timestamp
- preferences: UserPreferences - UI and app preferences

### TypeScript Interface:
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'provider' | 'nutritionist' | 'admin' | 'tester';
  organization?: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultUnits: 'metric' | 'imperial';
  language: string;
  notifications: boolean;
  defaultAdvisorType?: TPNAdvisorType;
}
```

### Relationships:
- Has many DynamicTextTemplates (author)
- Has many TPNSimulations (creator)
- Has many TestScenarios (owner)

## DynamicTextTemplate
**Purpose:** Stores reusable templates for dynamic text generation with variables and logic

**Key Attributes:**
- id: string - Unique template identifier
- title: string - Template name
- description: string - Template purpose/description
- content: string - Template content with variables
- variables: Variable[] - Defined variables
- logic: LogicRule[] - Conditional logic rules
- category: string - Template category
- authorId: string - Creator's user ID
- version: number - Template version
- isPublic: boolean - Shareable with community
- tags: string[] - Searchable tags
- createdAt: Timestamp - Creation date
- updatedAt: Timestamp - Last modified date

### TypeScript Interface:
```typescript
interface DynamicTextTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  variables: Variable[];
  logic: LogicRule[];
  category: 'clinical' | 'educational' | 'research' | 'testing' | 'other';
  authorId: string;
  version: number;
  isPublic: boolean;
  tags: string[];
  sections?: Section[]; // Can contain multiple sections
  testCases?: TestCase[]; // Associated test cases
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Variable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  defaultValue?: any;
  options?: string[]; // For select type
  required: boolean;
  validation?: ValidationRule;
  description?: string;
}

interface LogicRule {
  condition: string; // Expression to evaluate
  action: 'show' | 'hide' | 'setValue' | 'calculate';
  target: string; // Variable or section name
  value?: any;
}
```

### Relationships:
- Belongs to User (author)
- Used by many GeneratedDocuments

## TPNSimulation
**Purpose:** Stores TPN calculation scenarios for testing and education (no real patient data)

**Key Attributes:**
- id: string - Unique simulation identifier
- name: string - Simulation/scenario name
- description: string - Purpose of simulation
- patientProfile: SimulatedPatient - Anonymous patient parameters
- status: string - Simulation status
- parameters: TPNParameters - Nutrition parameters
- calculations: TPNCalculations - Calculated values
- recommendations: string[] - AI-generated recommendations
- creatorId: string - User who created simulation
- isTemplate: boolean - Can be used as template
- tags: string[] - Categorization tags
- createdAt: Timestamp - Creation timestamp
- updatedAt: Timestamp - Last update timestamp

### TypeScript Interface:
```typescript
interface TPNSimulation {
  id: string;
  name: string;
  description: string;
  configSchemaId: string; // Reference to ConfigSchema used
  patientProfile: SimulatedPatient;
  status: 'draft' | 'complete' | 'archived';
  parameters: TPNParameters;
  calculations: TPNCalculations;
  ingredientSelections: IngredientSelection[]; // Actual selected ingredients
  recommendations: string[];
  advisorType: TPNAdvisorType; // From parent project
  creatorId: string;
  isTemplate: boolean;
  tags: string[];
  sharedWith?: string[]; // User IDs for collaboration
  sections?: Section[]; // Dynamic sections from parent
  testSummary?: TestSummary; // Test results
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface SimulatedPatient {
  identifier: string; // Like "Patient A" or "Case 1"
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number; // kg
  height: number; // cm
  bmi?: number;
  clinicalScenario: string; // Text description
  conditions: string[]; // List of conditions
  medications?: string[]; // Optional medication list
  advisorType: TPNAdvisorType; // NEO, CHILD, ADOLESCENT, ADULT
}

interface TPNParameters {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female';
  stressFactor: number;
  proteinRequirement: number; // g/kg/day
  lipidPercentage: number;
  targetCalories?: number;
  customFactors?: Record<string, number>;
}

interface TPNCalculations {
  totalCalories: number;
  proteinGrams: number;
  carbGrams: number;
  lipidGrams: number;
  totalVolume: number; // ml
  osmolarity: number;
  micronutrients?: Record<string, number>;
  warnings: string[];
  notes: string[];
}
```

### Relationships:
- Belongs to User (creator)
- Can be shared with other Users
- Has many TPNRevisions (version history)

## TestScenario
**Purpose:** Stores test cases and scenarios for validating TPN calculations and templates

**Key Attributes:**
- id: string - Unique scenario identifier
- title: string - Scenario title
- description: string - What this tests
- type: string - Type of test scenario
- inputData: Record<string, any> - Test inputs
- expectedOutputs: Record<string, any> - Expected results
- actualOutputs?: Record<string, any> - Actual results from last run
- status: string - Test status
- ownerId: string - Creator ID
- isPublic: boolean - Available to all users
- createdAt: Timestamp - Creation date
- lastRun?: Timestamp - Last execution date

### TypeScript Interface:
```typescript
interface TestScenario {
  id: string;
  title: string;
  description: string;
  type: 'tpn_calculation' | 'template_generation' | 'logic_validation' | 'integration';
  inputData: Record<string, any>;
  expectedOutputs: Record<string, any>;
  actualOutputs?: Record<string, any>;
  status: 'pending' | 'passing' | 'failing' | 'skipped';
  ownerId: string;
  isPublic: boolean;
  tags: string[];
  createdAt: Timestamp;
  lastRun?: Timestamp;
}
```

### Relationships:
- Belongs to User (owner)
- References TPNSimulation or DynamicTextTemplate

## GeneratedDocument
**Purpose:** Stores documents generated from templates with filled variables

**Key Attributes:**
- id: string - Unique document identifier
- templateId: string - Source template ID
- simulationId?: string - Associated TPN simulation
- title: string - Document title
- content: string - Generated content
- variables: Record<string, any> - Variable values used
- generatorId: string - User who generated
- purpose: string - Purpose of generation
- createdAt: Timestamp - Generation timestamp

### TypeScript Interface:
```typescript
interface GeneratedDocument {
  id: string;
  templateId: string;
  simulationId?: string;
  title: string;
  content: string;
  variables: Record<string, any>;
  generatorId: string;
  purpose: 'testing' | 'educational' | 'documentation' | 'export';
  metadata?: {
    renderTime: number; // ms
    templateVersion: number;
    warnings?: string[];
  };
  createdAt: Timestamp;
}
```

### Relationships:
- Belongs to DynamicTextTemplate
- Belongs to User (generator)
- Optionally belongs to TPNSimulation

## ConfigSchema
**Purpose:** Stores TPN ingredient and calculation configurations imported from the schema.json

**Key Attributes:**
- id: string - Unique configuration identifier
- name: string - Configuration set name
- version: string - Schema version
- ingredients: Ingredient[] - TPN ingredients configuration
- flexSettings: FlexSetting[] - Flexible configuration parameters
- creatorId: string - User who created/imported
- isDefault: boolean - Default configuration flag
- isActive: boolean - Currently active configuration
- createdAt: Timestamp - Import/creation date
- updatedAt: Timestamp - Last modification

### TypeScript Interface:
```typescript
interface ConfigSchema {
  id: string;
  name: string;
  version: string;
  ingredients: Ingredient[];
  flexSettings: FlexSetting[];
  creatorId: string;
  isDefault: boolean;
  isActive: boolean;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Ingredient {
  keyname: string;
  display: string;
  mnemonic: string;
  uomDisplay: string;
  type: 'Macronutrient' | 'Micronutrient' | 'Additive' | 'Salt' | 'Diluent' | 'Other';
  osmoRatio?: number;
  editMode: 'None' | 'Custom';
  precision: number;
  special?: string;
  notes?: Note[];
  altUOM?: AlternateUOM[];
  referenceRanges?: ReferenceRange[];
  labs?: LabReference[];
  concentration?: Concentration;
  excludes?: string[]; // Keynames to exclude
}

interface Note {
  text: string;
}

interface AlternateUOM {
  name: string;
  uomDisplay: string;
}

interface ReferenceRange {
  threshold: 'Feasible Low' | 'Critical Low' | 'Normal Low' | 'Normal High' | 'Critical High' | 'Feasible High';
  value: number;
}

interface LabReference {
  display: string;
  eventSetName: string;
  graph: boolean;
}

interface Concentration {
  strength: number;
  strengthUOM: string;
  volume: number;
  volumeUOM: string;
}

interface FlexSetting {
  name: string;
  value: string;
  configComment?: string;
  altValues?: AlternativeValue[];
}

interface AlternativeValue {
  checkType: 'Facility' | string;
  checkMatch: string;
  overrideValue: string;
}
```

### Relationships:
- Belongs to User (creator)
- Used by many TPNSimulations
- Can have multiple versions (versioning history)
