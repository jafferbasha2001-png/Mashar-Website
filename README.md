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

### Complete customer endpoints (local server)

Start the API from the project root with `npm.cmd start --prefix server`.

| Request | URL |
| --- | --- |
| List customers (first 10 by default) | `http://localhost:3001/api/customers` |
| List customers with pagination | `http://localhost:3001/api/customers?page=1&limit=10` |
| Fetch customer with ID 1 | `http://localhost:3001/api/customers/1` |

All requests use `GET`. Replace `1` in the final URL with the customer ID.
Customer fields are `customer_id`, `first_name`, `last_name`, `email`, `phone`, `city`, `country`, and `created_at`.
The list response is `{ "data": [...], "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 } }` (example totals).
A single-customer response is `{ "data": { ... } }`.
Invalid IDs or pagination return HTTP 400, missing customers return 404, and database failures return 500.

Run the read-only API integration tests against the configured local database with `npm.cmd test --prefix server`.

## Troubleshooting

- **Connection refused:** confirm MySQL is running and `DB_HOST`/`DB_PORT` match it. Confirm Express uses port 3001.
- **Invalid credentials:** check `DB_USER` and `DB_PASSWORD` in `server/.env`, then restart the backend.
- **Unknown database:** create `sample_store` or run `database/sample.sql`, then verify `DB_NAME`.
- **Table not found:** run the SQL script or create a compatible `customers` table with the documented columns.
- **npm is not recognized:** install Node.js, reopen PowerShell, and verify `node --version` and `npm --version`.

The API is intentionally unauthenticated for local development and binds to `localhost` by default. Add authentication, authorization, HTTPS, and production network controls before public deployment.

### Customer pages

The Customers menu opens `/customers`. Submit the search form to filter by customer ID, full name, email, phone, city, or country. Search applies to the entire directory before pagination, with 10 results per page. Clear restores the unfiltered directory.

Select a customer name to open `/customers/:id`, which retrieves the record from `GET /api/customers/:id`. The back link preserves the directory search and page. Both pages support loading, errors, retry, and empty or missing results.

The list API accepts an optional `search` parameter, for example `http://localhost:3001/api/customers?search=riyadh&page=1&limit=10`. Searches are case-insensitive literal substrings, limited to 200 characters.
