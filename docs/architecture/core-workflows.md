# Core Workflows

Illustrating key system workflows using sequence diagrams:

## User Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextApp
    participant FirebaseAuth
    participant API
    participant Firestore

    User->>Browser: Access application
    Browser->>NextApp: Load app
    NextApp->>FirebaseAuth: Check auth state
    
    alt New user
        FirebaseAuth-->>NextApp: No user
        NextApp->>FirebaseAuth: signInAnonymously()
        FirebaseAuth-->>NextApp: Anonymous user created
    else Returning user
        FirebaseAuth-->>NextApp: Existing user
    end
    
    NextApp->>API: GET /api/auth/session
    API->>FirebaseAuth: Verify ID token
    FirebaseAuth-->>API: Token valid
    API->>Firestore: Get/create user preferences
    Firestore-->>API: User data
    API-->>NextApp: Complete user profile
    NextApp-->>Browser: Initialize app with user context
```

## Dynamic Code Execution Flow (Critical from Parent)

```mermaid
sequenceDiagram
    participant User
    participant Editor
    participant Sandbox
    participant Worker
    participant TPNContext
    
    User->>Editor: Write JavaScript code
    Editor->>Sandbox: Request execution
    Sandbox->>Sandbox: Sanitize code (DOMPurify)
    Sandbox->>Sandbox: Transpile with Babel
    Sandbox->>Worker: Execute in Web Worker
    
    Worker->>Worker: Create safe context
    Worker->>TPNContext: Inject TPN values
    Worker->>Worker: Run code with 5s timeout
    
    alt Successful execution
        Worker-->>Sandbox: Result
        Sandbox-->>Editor: Display output
    else Timeout or error
        Worker-->>Sandbox: Error/timeout
        Sandbox-->>Editor: Show error message
    end
```

## TPN Simulation Calculation Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Calculator
    participant API
    participant Firestore
    participant Gemini

    User->>UI: Adjust TPN parameters
    UI->>Calculator: Local calculation
    Calculator->>Calculator: Check reference ranges
    Calculator-->>UI: Instant preview + warnings
    
    User->>UI: Save simulation
    UI->>API: POST /api/simulations/{id}/calculate
    API->>Firestore: Get ConfigSchema
    Firestore-->>API: Configuration data
    API->>API: Server-side validation
    API->>API: Calculate TPN values
    API->>API: Check feasibility limits
    API->>Firestore: Save calculations
    
    alt Generate AI Recommendations
        API->>Gemini: Generate recommendations
        Gemini-->>API: AI suggestions
        API->>Firestore: Save recommendations
    end
    
    API-->>UI: Complete results
    UI-->>User: Display results + warnings
```

## Test Generation Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant Gemini
    participant TestRunner
    participant Firestore
    
    User->>UI: Request test generation
    UI->>API: POST /api/generate-tests
    API->>API: Rate limit check (60/min)
    
    API->>Gemini: Send code + context
    Gemini-->>API: Generated test cases
    
    API->>TestRunner: Validate tests
    TestRunner->>TestRunner: Run each test
    TestRunner-->>API: Test results
    
    API->>Firestore: Cache tests (24h)
    API-->>UI: Return tests
    UI-->>User: Display generated tests
```

## Section Content Management Flow

```mermaid
sequenceDiagram
    participant User
    participant Editor
    participant StateManager
    participant Firestore
    participant VersionControl
    
    User->>Editor: Edit section content
    Editor->>StateManager: Update local state
    StateManager->>StateManager: Auto-save timer (debounced)
    
    StateManager->>Firestore: Save section
    
    par Version tracking
        StateManager->>VersionControl: Create version snapshot
        VersionControl->>Firestore: Store version history
    and Real-time sync
        Firestore-->>StateManager: Sync to other users
        StateManager-->>Editor: Update collaborative edits
    end
    
    alt Conflict detected
        Firestore-->>StateManager: Version conflict
        StateManager->>Editor: Show merge UI
        User->>Editor: Resolve conflict
        Editor->>Firestore: Save resolution
    end
```

## Ingredient Sharing Workflow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant Dedup
    participant Firestore
    
    User->>UI: Share ingredient
    UI->>API: POST /api/ingredients/share
    
    API->>Dedup: Check for duplicates
    Dedup->>Firestore: Query similar ingredients
    Firestore-->>Dedup: Existing ingredients
    
    alt Duplicate found
        Dedup-->>API: Duplicate report
        API-->>UI: Show duplicate warning
        UI-->>User: Merge or create new?
    else No duplicate
        API->>Firestore: Save shared ingredient
        Firestore-->>API: Saved
        API-->>UI: Success
    end
```
