# Security Architecture

## Input Sanitization (from Parent Project)

```typescript
import DOMPurify from 'isomorphic-dompurify';

// HTML Sanitization for static content
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'div', 'span', 'h1', 'h2', 'h3', 'b', 'i', 'u', 'br'],
    ALLOWED_ATTR: ['class', 'id', 'style'],
    ALLOW_DATA_ATTR: false
  });
}

// Code sanitization for dynamic execution
export function sanitizeCode(code: string): string {
  // Remove potentially dangerous patterns
  const dangerous = [
    /eval\s*\(/g,
    /Function\s*\(/g,
    /setTimeout\s*\(/g,
    /setInterval\s*\(/g,
    /document\./g,
    /window\./g,
    /process\./g,
    /require\s*\(/g,
    /import\s+/g,
    /export\s+/g
  ];
  
  let sanitized = code;
  dangerous.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '/* blocked */');
  });
  
  return sanitized;
}
```

## Authentication Flow

```typescript
// Anonymous sign-in support (from parent)
async function initializeAuth() {
  const auth = getAuth();
  
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Sign in anonymously for new users
      const credential = await signInAnonymously(auth);
      user = credential.user;
    }
    
    // Store user in Redux
    dispatch(setUser({
      id: user.uid,
      email: user.email || null,
      isAnonymous: user.isAnonymous
    }));
  });
}
```
