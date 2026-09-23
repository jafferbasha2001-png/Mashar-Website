import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { once } from 'node:events';
import app from '../src/app.js';
import { pool } from '../src/config/database.js';

let server;
let base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}/api/customers`;
});
after(async () => {
  if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await pool.end();
});

test('lists customers with default pagination matching the database', async () => {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  const body = await response.json();
  const [counts] = await pool.query('SELECT COUNT(*) AS total FROM customers');
  const total = Number(counts[0].total);
  assert.deepEqual(body.pagination, { page: 1, limit: 10, total, totalPages: Math.ceil(total / 10) });
  assert.equal(body.data.length, Math.min(total, 10));
});

test('fetches a customer by ID and preserves the list response fields', async t => {
  const list = await (await fetch(`${base}?limit=1`)).json();
  if (!list.data.length) return t.skip('No customer records available; no test data is inserted.');
  const customer = list.data[0];
  const response = await fetch(`${base}/${customer.customer_id}`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { data: customer });
});

test('returns 404 for a missing customer', async () => {
  const [rows] = await pool.query('SELECT COALESCE(MAX(customer_id), 0) + 1 AS missing_id FROM customers');
  const response = await fetch(`${base}/${rows[0].missing_id}`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { message: 'Customer not found.' });
});

test('rejects malformed IDs and invalid pagination', async () => {
  for (const suffix of ['/0', '/-1', '/abc', '/1e0', '/1.5', '/9007199254740992', '/1%20OR%201=1', '?page=0', '?page=', '?page=1&page=2', '?limit=101', '?limit=1.5', '?page=9007199254740991&limit=100']) {
    const response = await fetch(`${base}${suffix}`);
    assert.equal(response.status, 400, suffix);
  }
});

test('supports explicit pagination and empty pages', async () => {
  const response = await fetch(`${base}?page=2&limit=1`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.pagination.page, 2);
  assert.equal(body.pagination.limit, 1);
  const emptyResponse = await fetch(`${base}?page=${body.pagination.total + 1}&limit=1`);
  assert.equal(emptyResponse.status, 200);
  assert.deepEqual((await emptyResponse.json()).data, []);
});

test('search filters across all customers and uses matching pagination totals', async t => {
  const [rows] = await pool.query('SELECT customer_id, first_name, last_name, email FROM customers ORDER BY customer_id DESC LIMIT 1');
  if (!rows.length) return t.skip('No customer records available.');
  const customer = rows[0];
  for (const term of [customer.email.toUpperCase(), `${customer.first_name} ${customer.last_name}`]) {
    const response = await fetch(`${base}?limit=1&search=${encodeURIComponent(term)}`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.ok(body.pagination.total >= 1);
    assert.equal(body.data.length, 1);
    if (term === customer.email.toUpperCase()) assert.equal(body.data[0].customer_id, customer.customer_id);
  }
});

test('search treats SQL and wildcard characters as literal text', async () => {
  for (const term of ["' OR 1=1 --", '%_%', 'no-match-customer-4fb2d91c']) {
    const response = await fetch(`${base}?search=${encodeURIComponent(term)}`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.data, []);
    assert.equal(body.pagination.total, 0);
  }
  for (const suffix of ['?search=a&search=b', `?search=${'a'.repeat(201)}`]) {
    assert.equal((await fetch(base + suffix)).status, 400);
  }
});
