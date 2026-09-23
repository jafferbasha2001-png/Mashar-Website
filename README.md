# Mashar Website

This project keeps the existing Mashar thobe website design and moves its browser behavior into a Vite + React frontend. A local Node.js + Express backend exposes the customer API through a reusable `mysql2/promise` connection pool.

## Prerequisites

- Node.js 18 or newer and npm
- MySQL 8 (or compatible)
- A MySQL user that can read the `customers` table

## Setup

1. Install dependencies from the project root:

   ```powershell
   npm run install:all
   ```

2. Copy `server/.env.example` to `server/.env` and enter your MySQL credentials there. Never put database credentials in `client/` or frontend environment files.

3. Optionally create sample data. This script does not drop tables or overwrite existing records:

   ```powershell
   mysql -u your_mysql_user -p < database/sample.sql
   ```

4. Start both development servers:

   ```powershell
   npm run dev
   ```

   Open `http://localhost:5173`. Vite proxies `/api` to `http://localhost:3001`.

## Production

```powershell
npm run build
npm start
```

Open `http://localhost:3001`. Express serves `client/dist` and falls back to its React entrypoint only for non-API routes; unknown `/api` routes remain API 404s.

## API

- `GET /api/health` checks the backend and MySQL connection.
- `GET /api/customers?page=1&limit=10` returns bounded pagination; `limit` is restricted to 1-100.
- `GET /api/customers/:id` returns one customer or 404 when it does not exist.

The API uses parameterized queries and explicit columns. Database errors are logged server-side without credentials or internal details in browser responses.

## Troubleshooting

- **Connection refused:** confirm MySQL is running and `DB_HOST`/`DB_PORT` match it. Confirm Express uses port 3001.
- **Invalid credentials:** check `DB_USER` and `DB_PASSWORD` in `server/.env`, then restart the backend.
- **Unknown database:** create `sample_store` or run `database/sample.sql`, then verify `DB_NAME`.
- **Table not found:** run the SQL script or create a compatible `customers` table with the documented columns.
- **npm is not recognized:** install Node.js, reopen PowerShell, and verify `node --version` and `npm --version`.

The API is intentionally unauthenticated for local development and binds to `localhost` by default. Add authentication, authorization, HTTPS, and production network controls before public deployment.