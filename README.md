# Finance Dashboard (MERN) – Backend Assignment

Website LIVE : https://finance-tracker-dashboard-43tf.vercel.app/

Swagger API documentation : https://finance-tracker-dashboard-1.onrender.com/#/Records/get_api_records

This is my submission for the **Finance Data Processing and Access Control Backend** assignment.

I built a small finance dashboard where users have different permissions based on role:

- **viewer**: can only see dashboard summaries
- **analyst**: can see dashboard + list records (read-only)
- **admin**: can manage everything (records + users)

I kept it simple, but tried to keep the code clean and separated into routes/services/models.

---

## Folder structure

```
Zorvyn_backend_intern/
  backend/   (Node + Express + MongoDB)
  frontend/  (React + Vite)
```

---

## Tech used

- Backend: Node.js, Express, MongoDB Atlas (Mongoose), JWT, Zod validation
- Frontend: React (Vite), React Router

---

## Setup (local)

### 1) Backend

Open a terminal:

```bash
cd backend
npm install
```

Create `backend/.env` using the example:

```bash
copy .env.example .env
```

Edit `backend/.env`:

- Set `MONGODB_URI` to your MongoDB Atlas connection string
- Set `JWT_SECRET` to anything long/random
- `CLIENT_ORIGIN` should be `http://localhost:5173`

Start backend:

```bash
npm run dev
```

Backend runs on `http://localhost:8080`.

### Bootstrap admin (first run)

On first run, the backend will create an admin user if these exist in `.env`:

- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_ADMIN_NAME`

Defaults in `.env.example` are:

- `admin@example.com`
- `Admin12345!`

---

### 2) Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

Login using the bootstrap admin credentials.

---

## API documentation

I kept the README focused on setup/run steps.

The full backend API documentation (endpoints, roles/permissions, request/response examples, filters, error formats) is in:

- `API.md`

Swagger UI is also available when backend is running:

- `http://localhost:8080/api-docs`

## Postman collection

Import `postman_collection.json` from the repo root, run the login request first (it saves the JWT token automatically), then try the other endpoints.

## Implementation notes (my thinking)

I also wrote a short explanation of my design choices and logic here:

- `logic.md`

---

## Access control decisions I made

I tried to match the assignment examples:

- Viewer should not see raw records → **viewer can call dashboard endpoints only**
- Analyst can view records and insights → **analyst can call dashboard + GET records**
- Admin can manage records and users → **admin has full access**

All access checks happen server-side in middleware.

---

## What I can improve next if needed

- Add automated tests for RBAC and record filtering
- Add refresh tokens or session-based auth (depending on product needs)
- Add better trend output shape for charting (labels + sorted buckets)
