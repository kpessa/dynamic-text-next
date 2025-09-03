# API Specification

Based on the REST API style chosen in the Tech Stack, here's the OpenAPI 3.0 specification for the Dynamic Text Next API:

## REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Dynamic Text Next API
  version: 1.0.0
  description: API for TPN simulation, dynamic text generation, and configuration management
servers:
  - url: https://api.dynamic-text-next.vercel.app/api
    description: Production API
  - url: http://localhost:3000/api
    description: Development server

components:
  securitySchemes:
    firebaseAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Firebase ID token
  
  schemas:
    User:
      type: object
      required: [id, email, displayName, role]
      properties:
        id:
          type: string
        email:
          type: string
        displayName:
          type: string
        role:
          type: string
          enum: [provider, nutritionist, admin, tester]
        organization:
          type: string
        preferences:
          $ref: '#/components/schemas/UserPreferences'
    
    ConfigSchema:
      type: object
      required: [id, name, version, ingredients, flexSettings]
      properties:
        id:
          type: string
        name:
          type: string
        version:
          type: string
        ingredients:
          type: array
          items:
            $ref: '#/components/schemas/Ingredient'
        flexSettings:
          type: array
          items:
            $ref: '#/components/schemas/FlexSetting'
    
    TPNSimulation:
      type: object
      required: [name, configSchemaId, patientProfile, parameters]
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        configSchemaId:
          type: string
        patientProfile:
          $ref: '#/components/schemas/SimulatedPatient'
        parameters:
          $ref: '#/components/schemas/TPNParameters'
        calculations:
          $ref: '#/components/schemas/TPNCalculations'
        ingredientSelections:
          type: array
          items:
            $ref: '#/components/schemas/IngredientSelection'
    
    DynamicTextTemplate:
      type: object
      required: [title, content, variables]
      properties:
        id:
          type: string
        title:
          type: string
        description:
          type: string
        content:
          type: string
        variables:
          type: array
          items:
            $ref: '#/components/schemas/Variable'
        logic:
          type: array
          items:
            $ref: '#/components/schemas/LogicRule'
        category:
          type: string
          enum: [clinical, educational, research, testing, other]
        isPublic:
          type: boolean
        tags:
          type: array
          items:
            type: string

paths:
  /auth/session:
    get:
      summary: Get current user session
      security:
        - firebaseAuth: []
      responses:
        '200':
          description: Current user session
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          description: Unauthorized
  
  /config-schemas:
    get:
      summary: List available configuration schemas
      security:
        - firebaseAuth: []
      parameters:
        - in: query
          name: active
          schema:
            type: boolean
          description: Filter for active schemas only
      responses:
        '200':
          description: List of configuration schemas
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ConfigSchema'
    
    post:
      summary: Import or create a configuration schema
      security:
        - firebaseAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ConfigSchema'
      responses:
        '201':
          description: Schema created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ConfigSchema'
  
  /config-schemas/{id}:
    get:
      summary: Get specific configuration schema
      security:
        - firebaseAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Configuration schema details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ConfigSchema'
    
    put:
      summary: Update configuration schema
      security:
        - firebaseAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ConfigSchema'
      responses:
        '200':
          description: Schema updated
  
  /simulations:
    get:
      summary: List TPN simulations
      security:
        - firebaseAuth: []
      parameters:
        - in: query
          name: creatorId
          schema:
            type: string
        - in: query
          name: sharedWith
          schema:
            type: string
        - in: query
          name: tags
          schema:
            type: array
            items:
              type: string
      responses:
        '200':
          description: List of simulations
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/TPNSimulation'
    
    post:
      summary: Create new TPN simulation
      security:
        - firebaseAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TPNSimulation'
      responses:
        '201':
          description: Simulation created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TPNSimulation'
  
  /simulations/{id}:
    get:
      summary: Get specific simulation
      security:
        - firebaseAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Simulation details
    
    put:
      summary: Update simulation
      security:
        - firebaseAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TPNSimulation'
      responses:
        '200':
          description: Simulation updated
    
    delete:
      summary: Delete simulation
      security:
        - firebaseAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Simulation deleted
  
  /simulations/{id}/calculate:
    post:
      summary: Run TPN calculations
      security:
        - firebaseAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                parameters:
                  $ref: '#/components/schemas/TPNParameters'
                ingredientSelections:
                  type: array
                  items:
                    $ref: '#/components/schemas/IngredientSelection'
      responses:
        '200':
          description: Calculation results
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TPNCalculations'
  
  /simulations/{id}/recommendations:
    post:
      summary: Generate AI recommendations
      security:
        - firebaseAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: AI-generated recommendations
          content:
            application/json:
              schema:
                type: object
                properties:
                  recommendations:
                    type: array
                    items:
                      type: string
                  warnings:
                    type: array
                    items:
                      type: string
  
  /templates:
    get:
      summary: List dynamic text templates
      security:
        - firebaseAuth: []
      parameters:
        - in: query
          name: category
          schema:
            type: string
        - in: query
          name: isPublic
          schema:
            type: boolean
        - in: query
          name: authorId
          schema:
            type: string
      responses:
        '200':
          description: List of templates
    
    post:
      summary: Create new template
      security:
        - firebaseAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DynamicTextTemplate'
      responses:
        '201':
          description: Template created
  
  /templates/{id}/generate:
    post:
      summary: Generate document from template
      security:
        - firebaseAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                variables:
                  type: object
                  additionalProperties: true
                simulationId:
                  type: string
      responses:
        '200':
          description: Generated document
          content:
            application/json:
              schema:
                type: object
                properties:
                  content:
                    type: string
                  metadata:
                    type: object
  
  /test-scenarios:
    get:
      summary: List test scenarios
      security:
        - firebaseAuth: []
      parameters:
        - in: query
          name: type
          schema:
            type: string
        - in: query
          name: status
          schema:
            type: string
      responses:
        '200':
          description: List of test scenarios
    
    post:
      summary: Create test scenario
      security:
        - firebaseAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TestScenario'
      responses:
        '201':
          description: Test scenario created
  
  /test-scenarios/{id}/run:
    post:
      summary: Execute test scenario
      security:
        - firebaseAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Test execution results
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [passing, failing]
                  actualOutputs:
                    type: object
                  expectedOutputs:
                    type: object
                  differences:
                    type: array
                    items:
                      type: object
```
