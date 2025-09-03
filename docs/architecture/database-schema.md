# Database Schema

Transform the conceptual data models into concrete Firestore database schemas:

## Firestore Collections Structure

```typescript
// Collection: users
{
  id: "firebase_auth_uid",
  email: "user@example.com",
  displayName: "John Doe",
  role: "provider", // provider | nutritionist | admin | tester
  organization: "General Hospital",
  createdAt: Timestamp,
  lastLogin: Timestamp,
  preferences: {
    theme: "light",
    defaultUnits: "metric",
    language: "en",
    notifications: true,
    defaultAdvisorType: "ADULT"
  }
}

// Collection: references (from parent project workspace)
{
  id: "auto_generated_id",
  name: "Adult TPN Protocol v2",
  healthSystem: "General Hospital",
  populationType: "adult",
  validationStatus: "passed", // untested | passed | failed | partial
  validationNotes: "Validated against current guidelines",
  validatedBy: "user_id",
  validatedAt: Timestamp,
  updatedAt: Timestamp,
  version: "2.0",
  creatorId: "user_id",
  
  // Subcollection: references/{id}/sections
  sections: [
    {
      id: 1,
      type: "dynamic", // static | dynamic
      name: "TPN Calculations",
      content: "// JavaScript code for calculations",
      testCases: [
        {
          name: "Standard adult case",
          variables: { weight: 70, height: 175 },
          expected: "Expected output",
          matchType: "exact" // exact | contains | regex | styles
        }
      ]
    }
  ]
}

// Collection: ingredients (shared ingredients from parent)
{
  id: "auto_generated_id", 
  keyname: "DEXTROSE",
  name: "Dextrose",
  type: "Macronutrient",
  creatorId: "user_id",
  isShared: true,
  version: 1,
  referenceRanges: [
    {
      threshold: "Normal Low",
      value: 100,
      advisorType: "ADULT"
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// Collection: tpnSimulations
{
  id: "auto_generated_id",
  name: "Adult TPN Simulation #1",
  description: "Standard adult patient simulation",
  configSchemaId: "config_schema_id",
  advisorType: "ADULT", // NEO | CHILD | ADOLESCENT | ADULT
  creatorId: "user_id",
  status: "complete",
  isTemplate: false,
  tags: ["adult", "standard", "teaching"],
  sharedWith: ["user_id_2", "user_id_3"],
  
  patientProfile: {
    identifier: "Patient A",
    age: 45,
    gender: "male",
    weight: 75,
    height: 180,
    bmi: 23.1,
    clinicalScenario: "Post-operative patient",
    conditions: ["post-op", "malnutrition"],
    advisorType: "ADULT"
  },
  
  // Subcollection: tpnSimulations/{id}/sections
  sections: [
    {
      id: 1,
      type: "dynamic",
      name: "Calculations",
      content: "// Dynamic JS content",
      testCases: []
    }
  ],
  
  testSummary: {
    sections: [],
    summary: {
      total: 10,
      passed: 8,
      failed: 2
    }
  },
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(resource) {
      return isAuthenticated() && 
        request.auth.uid == resource.data.creatorId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // References collection
    match /references/{refId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource);
      
      match /sections/{sectionId} {
        allow read, write: if isAuthenticated() && 
          isOwner(get(/databases/$(database)/documents/references/$(refId)));
      }
    }
    
    // Ingredients collection
    match /ingredients/{ingredientId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource) || 
        resource.data.isShared == true;
    }
    
    // TPN Simulations
    match /tpnSimulations/{simId} {
      allow read: if isAuthenticated() && 
        (isOwner(resource) || 
         request.auth.uid in resource.data.sharedWith ||
         resource.data.isTemplate == true);
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource);
      
      match /sections/{sectionId} {
        allow read, write: if isAuthenticated() && 
          isOwner(get(/databases/$(database)/documents/tpnSimulations/$(simId)));
      }
    }
  }
}
```
