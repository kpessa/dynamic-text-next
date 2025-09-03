# Backend Architecture

Define backend-specific architecture details using Next.js API routes.

## API Route Organization

```
app/api/
├── auth/
│   ├── session/
│   │   └── route.ts       # GET user session
│   └── signout/
│       └── route.ts       # POST sign out
├── simulations/
│   ├── route.ts           # GET list, POST create
│   └── [id]/
│       ├── route.ts       # GET, PUT, DELETE
│       ├── calculate/
│       │   └── route.ts   # POST calculations
│       └── recommendations/
│           └── route.ts   # POST AI recommendations
├── sections/
│   ├── route.ts           # GET, POST sections
│   └── [id]/
│       ├── route.ts       # PUT, DELETE section
│       └── test/
│           └── route.ts   # POST run tests
├── generate-tests/
│   └── route.ts           # POST AI test generation
└── ingredients/
    ├── route.ts           # GET, POST ingredients
    └── share/
        └── route.ts       # POST share ingredient
```

## Middleware Architecture

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';

export async function middleware(request: Request) {
  // Authentication check
  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const user = await verifyIdToken(token);
    
    // Rate limiting for AI endpoints
    if (request.url.includes('/generate-tests') || 
        request.url.includes('/recommendations')) {
      const rateLimitOk = await checkRateLimit(user.uid, 60); // 60 req/min
      if (!rateLimitOk) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
      }
    }
    
    // Add user to request
    request.headers.set('x-user-id', user.uid);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export const config = {
  matcher: '/api/((?!auth/session).*)',
};
```
