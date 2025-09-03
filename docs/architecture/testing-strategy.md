# Testing Strategy

## Test Pyramid (from Parent Project)
```
         /\
        /E2E\       20% - Critical user flows
       /------\
      /Integr.\     20% - API and component integration
     /----------\
    /   Unit     \  60% - Business logic and utilities
   /--------------\
```

## Testing Organization by FSD Layer
```
src/
├── app/__tests__/          # App-level tests
├── widgets/__tests__/      # Widget integration tests
├── features/
│   ├── tpn-calculations/__tests__/
│   ├── code-execution/__tests__/
│   └── test-generation/__tests__/
├── entities/__tests__/     # Entity unit tests
└── shared/__tests__/       # Shared component tests
```

## Test Patterns

### Unit Test Example
```typescript
// features/tpn-calculations/__tests__/calculator.test.ts
describe('TPNCalculator', () => {
  it('should calculate adult TPN values correctly', () => {
    const result = calculateTPN({
      weight: 70,
      height: 175,
      age: 40,
      advisorType: 'ADULT',
      stressFactor: 1.2
    });
    
    expect(result.totalCalories).toBe(2100);
    expect(result.proteinGrams).toBeCloseTo(84, 1);
  });
});
```

### Integration Test Example
```typescript
// app/api/simulations/__tests__/route.test.ts
describe('Simulations API', () => {
  it('should create and retrieve simulation', async () => {
    const response = await POST({
      name: 'Test Simulation',
      advisorType: 'ADULT',
      patientProfile: mockPatient
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBeDefined();
  });
});
```

### E2E Test Example (Playwright)
```typescript
// e2e/editor-flow.test.ts
test('complete editor workflow', async ({ page }) => {
  await page.goto('/editor/new');
  
  // Add dynamic section
  await page.click('button:has-text("Add Section")');
  await page.selectOption('select[name="type"]', 'dynamic');
  
  // Write code
  await page.fill('[data-testid="code-editor"]', testCode);
  
  // Run test
  await page.click('button:has-text("Run Tests")');
  await expect(page.locator('.test-passed')).toBeVisible();
});
```
