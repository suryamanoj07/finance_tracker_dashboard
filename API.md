# Backend API Documentation

Base URL (local): `http://localhost:8080`

Swagger UI: https://finance-tracker-dashboard-1.onrender.com/#/Records/get_api_records

This backend uses **JWT Bearer tokens** for auth. After login, send:

`Authorization: Bearer <token>`

---

## Roles and permissions (RBAC)

- **viewer**
  - can access dashboard summaries
  - cannot access records list or any create/update/delete

- **analyst**
  - can access dashboard summaries
  - can read records (`GET /api/records`, `GET /api/records/:id`)
  - cannot create/update/delete records

- **admin**
  - full access
  - can manage users + records

The checks are enforced server-side in middleware.

---

## Common responses

### Validation error (400)

```json
{
  "error": "ValidationError",
  "message": "Invalid input",
  "details": [
    { "path": "body.email", "message": "Invalid email" }
  ]
}
```

### Auth / permission errors

- 401: missing/invalid token
- 403: inactive user or not enough permissions

```json
{
  "error": "HttpError",
  "message": "Insufficient permissions"
}
```

---

## Auth

### `POST /api/auth/login`

**Public**

Body:

```json
{
  "email": "admin@example.com",
  "password": "Admin12345!"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "user": {
    "id": "6612b6...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active"
  }
}
```

---

## Users (Admin only)

All endpoints in this section require role: **admin**

### `GET /api/users`

Response:

```json
{
  "items": [
    {
      "id": "6612b6",
      "name": "Admin",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active",
      "createdAt": "2026-04-06T10:12:30.000Z",
      "updatedAt": "2026-04-06T10:12:30.000Z"
    }
  ]
}
```

### `POST /api/users`

Body:

```json
{
  "name": "Ravi",
  "email": "ravi@example.com",
  "password": "Ravi12345!",
  "role": "analyst",
  "status": "active"
}
```

Response: `201 Created`

```json
{
  "id": "6612b9",
  "name": "Ravi",
  "email": "ravi@example.com",
  "role": "analyst",
  "status": "active",
  "createdAt": "2026-04-06T10:20:10.000Z"
}
```

### `PATCH /api/users/:userId`

You can update one or more of: `name`, `role`, `status`, `password`

Body example:

```json
{ "status": "inactive" }
```

Response:

```json
{
  "id": "6612b9",
  "name": "Ravi",
  "email": "ravi@example.com",
  "role": "analyst",
  "status": "inactive",
  "createdAt": "2026-04-06T10:20:10.000Z",
  "updatedAt": "2026-04-06T10:22:44.000Z"
}
```

---

## Records

### Record shape

```json
{
  "id": "6612c1...",
  "amount": 1200,
  "type": "expense",
  "category": "Food",
  "date": "2026-04-06T00:00:00.000Z",
  "notes": "Lunch",
  "createdBy": "6612b6...",
  "deletedAt": null,
  "createdAt": "2026-04-06T10:30:00.000Z",
  "updatedAt": "2026-04-06T10:30:00.000Z"
}
```

### `GET /api/records`

Allowed roles: **analyst**, **admin**

Query params (all optional):

- `type`: `income` | `expense`
- `category`: string
- `from`: `YYYY-MM-DD` or ISO datetime
- `to`: `YYYY-MM-DD` or ISO datetime
- `limit`: number (default 50, max 200)
- `offset`: number (default 0)
- `includeDeleted`: `true` | `false` (default false)

Response:

```json
{
  "items": [ /* records */ ],
  "total": 12,
  "limit": 50,
  "offset": 0
}
```

### `GET /api/records/:recordId`

Allowed roles: **analyst**, **admin**

Response: one record

### `POST /api/records`

Allowed role: **admin**

Body:

```json
{
  "amount": 50000,
  "type": "income",
  "category": "Salary",
  "date": "2026-04-01",
  "notes": "April salary"
}
```

Response: `201 Created` + record

### `PATCH /api/records/:recordId`

Allowed role: **admin**

Body example:

```json
{ "notes": "Updated note" }
```

### `DELETE /api/records/:recordId`

Allowed role: **admin**

This is a **soft delete**. It sets `deletedAt` instead of removing the document.

Response:

```json
{ "ok": true }
```

---

## Dashboard

Allowed roles: **viewer**, **analyst**, **admin**

### `GET /api/dashboard/summary`

Optional query: `from`, `to`

Response:

```json
{
  "range": { "from": null, "to": null },
  "totals": { "income": 50000, "expenses": 1200, "net": 48800 },
  "categoryTotals": [
    { "category": "Salary", "income": 50000, "expense": 0, "net": 50000 },
    { "category": "Food", "income": 0, "expense": 1200, "net": -1200 }
  ],
  "recentActivity": [
    { "id": "6612c1...", "type": "expense", "category": "Food", "amount": 1200, "date": "2026-04-06T00:00:00.000Z", "notes": "Lunch" }
  ]
}
```

### `GET /api/dashboard/trends`

Query:

- `period`: `monthly` | `weekly` (default monthly)
- `type`: `income` | `expense` (optional)
- `from`, `to` (optional)

Response:

```json
{
  "period": "monthly",
  "range": { "from": null, "to": null },
  "points": [
    { "bucket": { "year": 2026, "month": 4, "type": "income" }, "total": 50000 },
    { "bucket": { "year": 2026, "month": 4, "type": "expense" }, "total": 1200 }
  ]
}
```

