# Migration Considerations

## From Svelte to Next.js
1. **State Management:** Svelte stores → Redux Toolkit
2. **Reactivity:** Svelte $state → React useState/useReducer
3. **Components:** .svelte → .tsx with React hooks
4. **Routing:** SvelteKit routes → Next.js App Router
5. **Build:** Vite → Next.js/Turbopack

## Key Differences to Note
- React requires explicit state updates (immutability)
- useEffect for side effects (vs Svelte's reactive statements)
- JSX syntax instead of Svelte templates
- Props drilling vs Svelte's context API
- Redux for global state vs Svelte stores
