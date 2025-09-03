# Tech Stack

This is the **DEFINITIVE** technology selection for the entire project. All development must use these exact versions.

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.7+ | Type-safe development | Already in use, prevents runtime errors in medical calculations |
| Frontend Framework | Next.js | 15.5.2 | React framework with SSR/SSG | Already implemented, provides fullstack capabilities |
| UI Component Library | Material UI | 7.3.2 | Design system components | Already integrated, comprehensive healthcare-appropriate UI |
| State Management | Redux Toolkit | 2.8.2 | Global state management | Already implemented, predictable state for complex forms |
| Backend Language | TypeScript | 5.7+ | Type-safe backend development | Share types with frontend, consistency |
| Backend Framework | Next.js API Routes | 15.5.2 | Serverless API endpoints | Built into Next.js, automatic scaling |
| API Style | REST | - | HTTP/JSON APIs | Simple, well-understood, adequate for requirements |
| Database | Firestore | Latest | NoSQL document database | Real-time sync, offline support, scales automatically |
| Cache | Vercel Edge Cache | - | CDN and compute caching | Built-in with Vercel, automatic optimization |
| File Storage | Firebase Storage | Latest | Binary file storage | Integrated with Firebase, handles medical documents |
| Authentication | Firebase Auth | Latest | User authentication | Comprehensive auth with healthcare-appropriate security |
| Frontend Testing | Vitest | 3.2.4 | Unit testing framework | Already configured, fast and compatible |
| Backend Testing | Vitest | 3.2.4 | API testing framework | Consistent with frontend, supports async |
| E2E Testing | Playwright | Latest | End-to-end testing | Modern, reliable, good debugging |
| Build Tool | Turbopack | Built-in | Fast bundling | Integrated with Next.js 15 |
| Bundler | Turbopack | Built-in | Module bundling | Next.js 15 default, faster than Webpack |
| IaC Tool | Vercel CLI | Latest | Infrastructure config | Simple JSON config for Vercel |
| CI/CD | GitHub Actions | - | Continuous integration | Free for public repos, Vercel integration |
| Monitoring | Vercel Analytics | Latest | Performance monitoring | Built-in with Vercel, Real User Metrics |
| Logging | Vercel Logs | Latest | Application logging | Integrated platform logging |
| CSS Framework | Tailwind CSS | 4.0 | Utility-first CSS | Already configured, works with Material UI |
