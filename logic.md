# Implementation Notes (my thinking)

This file is my short “why + how” behind the implementation. I wrote it for a reviewer who wants to quickly understand my decisions and how the backend is structured.

---

## What I built 

A small finance dashboard system with:

- **Role-based access control (RBAC)**: viewer / analyst / admin
- **Financial records**: CRUD + filtering
- **Dashboard summary APIs**: totals, category totals, recent activity, trends
- **Validation + consistent errors**
- **MongoDB persistence**

The project is split into:

- `backend/` (Express + MongoDB)
- `frontend/` (React + Vite)

---

## Why this structure

I avoided a “single file Express app” because it becomes messy quickly. I also didn’t over-engineer (no CQRS, no extra layers for the sake of it). I used a simple separation that is easy to review:

- **models**: MongoDB schemas (`User`, `Record`)
- **services**: core business logic (create record, list with filters, dashboard aggregations)
- **routes**: HTTP layer only (parsing, calling services, returning response)
- **middleware**: auth, role checks, validation, centralized error handler

This makes the code readable and prevents mixing auth/data/HTTP concerns.

---

## Auth approach (and why)

I used **JWT login** instead of a full signup flow because the assignment focuses more on access control and API correctness.

- Login returns `{ token, user }`
- For protected APIs, client sends `Authorization: Bearer <token>`
- Tokens include `sub` (user id). On each request I load the user from DB so:
  - **inactive users are blocked immediately**
  - role/status changes take effect without waiting for token expiry

There is also a **bootstrap admin** on first run (configured via `.env`) so a reviewer can start testing immediately.

---

## RBAC (permissions) logic

I mapped the roles to the assignment examples:

- **viewer**
  - can view dashboard summaries only
- **analyst**
  - can view dashboard summaries
  - can read records (list + single record)
- **admin**
  - can manage users
  - can create/update/delete records
  - can view dashboard summaries

Enforcement happens on the backend using:

- `requireAuth()` middleware to attach `req.user`
- `requireRole(...)` middleware per route

So even if someone edits the frontend, the backend rules still hold.

---

## Financial records design

I modelled records as a single collection `Record` with:

- `amount` (number)
- `type` (`income` / `expense`)
- `category` (string)
- `date` (date)
- `notes` (string)
- `createdBy` (user id)

### Soft delete

Instead of removing documents, `DELETE /api/records/:id` sets `deletedAt`.

Reason: for finance systems, “delete” often means “hide” (audit-friendly). Also it prevents accidental data loss during review/testing.

Listing endpoints exclude deleted items by default, but support `includeDeleted=true`.

---

## Filtering + pagination

`GET /api/records` supports:

- `type`, `category`
- date range: `from`, `to`
- `limit`, `offset`

This demonstrates handling typical dashboard filters without complicating the UI.

---

## Dashboard aggregation logic

The dashboard endpoints are meant to show I can return **summary-level data**, not just CRUD.

### `GET /api/dashboard/summary`

Returns:

- total income
- total expenses
- net
- category-wise totals (income/expense/net)
- recent activity

I used MongoDB aggregation (`$group`, `$sum`) because this is the kind of query a dashboard needs and it avoids doing “sum in JavaScript” after fetching many records.

### `GET /api/dashboard/trends`

Returns bucketed totals by:

- `period=monthly` (year + month)
- `period=weekly` (ISO week)

This gives trend data a frontend can plot later.

---

## Validation + errors

I used **Zod** at the route boundary so:

- missing/invalid input returns a clear `400 ValidationError`
- the service layer can assume types are correct

I also added centralized error handling so responses are consistent.

---

## Frontend (why it exists here)

The assignment is backend-focused, but a small UI helps the reviewer test quickly without Postman:

- Login page
- Dashboard page (summary)
- Records page (list + admin create/delete)
- Users page (admin create + role/status)

The UI also respects RBAC (pages hidden/redirected), but the real enforcement is on the backend.

---

## What I can improve next if needed

- Add automated tests for RBAC and record filtering
- Add refresh tokens or session-based auth (depending on product needs)
- Add better trend output shape for charting (labels + sorted buckets)

