export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Finance Dashboard API",
    version: "1.0.0",
    description: "API documentation for the finance dashboard backend.",
  },
  servers: [{ url: "http://localhost:8080" }],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Users" },
    { name: "Records" },
    { name: "Dashboard" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string", format: "email" },
              role: { type: "string", enum: ["viewer", "analyst", "admin"] },
              status: { type: "string", enum: ["active", "inactive"] },
            },
          },
        },
      },
      UserCreate: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
          role: { type: "string", enum: ["viewer", "analyst", "admin"] },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
      UserPatch: {
        type: "object",
        properties: {
          name: { type: "string" },
          password: { type: "string", minLength: 6 },
          role: { type: "string", enum: ["viewer", "analyst", "admin"] },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
      RecordInput: {
        type: "object",
        required: ["amount", "type", "category", "date"],
        properties: {
          amount: { type: "number", minimum: 0 },
          type: { type: "string", enum: ["income", "expense"] },
          category: { type: "string" },
          date: { type: "string", example: "2026-04-06" },
          notes: { type: "string" },
        },
      },
      RecordPatch: {
        type: "object",
        properties: {
          amount: { type: "number", minimum: 0 },
          type: { type: "string", enum: ["income", "expense"] },
          category: { type: "string" },
          date: { type: "string", example: "2026-04-06" },
          notes: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
          message: { type: "string" },
          details: {},
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Service healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
          },
        },
        responses: {
          200: {
            description: "Login success",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } },
            },
          },
          400: { description: "Invalid input" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List users (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Users list" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create user (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UserCreate" } },
          },
        },
        responses: {
          201: { description: "User created" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/users/{userId}": {
      patch: {
        tags: ["Users"],
        summary: "Update user (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UserPatch" } },
          },
        },
        responses: {
          200: { description: "User updated" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "User not found" },
        },
      },
    },
    "/api/records": {
      get: {
        tags: ["Records"],
        summary: "List records (analyst/admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "type", in: "query", schema: { type: "string", enum: ["income", "expense"] } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "from", in: "query", schema: { type: "string" } },
          { name: "to", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "offset", in: "query", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Records list" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      post: {
        tags: ["Records"],
        summary: "Create record (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RecordInput" } },
          },
        },
        responses: {
          201: { description: "Record created" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/records/{recordId}": {
      get: {
        tags: ["Records"],
        summary: "Get single record (analyst/admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "recordId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Record found" },
          404: { description: "Record not found" },
        },
      },
      patch: {
        tags: ["Records"],
        summary: "Update record (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "recordId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RecordPatch" } },
          },
        },
        responses: {
          200: { description: "Record updated" },
          404: { description: "Record not found" },
        },
      },
      delete: {
        tags: ["Records"],
        summary: "Soft delete record (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "recordId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Record soft deleted" },
          404: { description: "Record not found" },
        },
      },
    },
    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard summary (viewer/analyst/admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "from", in: "query", schema: { type: "string" } },
          { name: "to", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Summary returned" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/dashboard/trends": {
      get: {
        tags: ["Dashboard"],
        summary: "Get trends (viewer/analyst/admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "period", in: "query", schema: { type: "string", enum: ["weekly", "monthly"] } },
          { name: "type", in: "query", schema: { type: "string", enum: ["income", "expense"] } },
          { name: "from", in: "query", schema: { type: "string" } },
          { name: "to", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Trends returned" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
  },
};

