# Coding Standards

## Critical Rules (from Parent Project + Next.js)

1. **Component Size:** Maximum 500 lines per component
2. **Type Safety:** Strict TypeScript, no `any` types
3. **State Management:** All global state in Redux
4. **API Calls:** Always use service layer, never direct fetch
5. **Error Handling:** All async operations wrapped in try-catch
6. **Security:** All user input sanitized with DOMPurify
7. **Testing:** Minimum 80% coverage for business logic
8. **Performance:** Components >100 lines must use React.memo
9. **Imports:** Use absolute imports with @ alias
10. **Code Execution:** Always use sandboxed Web Workers

## Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `TPNCalculator.tsx` |
| Hooks | camelCase with 'use' | `useTPNCalculation.ts` |
| API Routes | kebab-case | `/api/generate-tests` |
| Types/Interfaces | PascalCase | `TPNSimulation` |
| Constants | UPPER_SNAKE_CASE | `MAX_TIMEOUT` |
| Files | kebab-case | `tpn-calculator.ts` |
