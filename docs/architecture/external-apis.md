# External APIs

For the Dynamic Text Next application, here are the external service integrations required:

## Firebase Services API
- **Purpose:** Backend-as-a-Service for authentication, database, storage, and real-time features
- **Documentation:** https://firebase.google.com/docs/reference
- **Base URL(s):** Project-specific Firebase endpoints
- **Authentication:** Firebase Admin SDK with service account credentials
- **Rate Limits:** Firestore: 1M reads/day free tier, 10K writes/sec per database

**Key Endpoints Used:**
- `Firebase Auth` - User authentication (anonymous sign-in support)
- `Firestore Database` - Document storage and real-time subscriptions
- `Firebase Storage` - File uploads and ingredient versioning
- `Firebase Cloud Messaging` - Push notifications (future)

**Integration Notes:** Initialize once at app startup, use Admin SDK on backend only, implement exponential backoff for retries, enable offline persistence

## Google Gemini AI API
- **Purpose:** AI-powered test generation, recommendations, and TPN analysis
- **Documentation:** https://ai.google.dev/docs
- **Base URL(s):** https://generativelanguage.googleapis.com/v1
- **Authentication:** API key authentication
- **Rate Limits:** 60 requests per minute (enforced at application level)

**Key Endpoints Used:**
- `POST /models/gemini-pro:generateContent` - Generate tests from code sections
- `POST /models/gemini-pro:streamGenerateContent` - Stream responses for better UX

**Integration Notes:** Implement request queuing, cache test results for 24h, use streaming for long responses, graceful fallback on API failures

## Vercel Analytics API
- **Purpose:** Performance monitoring and usage analytics
- **Documentation:** https://vercel.com/docs/analytics
- **Base URL(s):** Automatically configured via Vercel deployment
- **Authentication:** Automatic via Vercel deployment
- **Rate Limits:** No explicit limits for analytics collection

**Key Endpoints Used:**
- Auto-injected client-side tracking
- Web Vitals collection (target: LCP <2.5s, FID <100ms, CLS <0.1)
- Custom events for feature usage tracking

**Integration Notes:** Automatically enabled with Vercel deployment, monitor bundle size impact, track TPN calculation performance
