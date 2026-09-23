import { Router } from 'express';
import { pool } from '../config/database.js';

const router = Router();
const columns = 'customer_id, first_name, last_name, email, phone, city, country, created_at';

function pagination(query) {
  const page = positiveInteger(query.page ?? '1');
  const limit = positiveInteger(query.limit ?? '10');
  if (page === null || limit === null || limit > 100) return null;
  const offset = (page - 1) * limit;
  if (!Number.isSafeInteger(offset)) return null;
  return { page, limit, offset };
}

function positiveInteger(value) {
  if (typeof value !== 'string' || !/^[0-9]+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

router.get('/', async (request, response) => {
  const values = pagination(request.query);
  if (!values) return response.status(400).json({ message: 'page must be a positive integer and limit must be between 1 and 100.' });
  const search = request.query.search ?? '';
  if (typeof search !== 'string' || search.length > 200) return response.status(400).json({ message: 'search must be text of at most 200 characters.' });
  const term = search.trim();
  const searchColumns = ['CAST(customer_id AS CHAR)', "CONCAT_WS(' ', first_name, last_name)", 'email', 'phone', 'city', 'country'];
  const where = term ? ' WHERE ' + searchColumns.map(column => "LOCATE(LOWER(?), LOWER(COALESCE(" + column + ", ''))) > 0").join(' OR ') : '';
  const parameters = term ? searchColumns.map(() => term) : [];
  try {
    const [rows] = await pool.query(`SELECT ${columns} FROM customers${where} ORDER BY customer_id LIMIT ? OFFSET ?`, [...parameters, values.limit, values.offset]);
    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM customers${where}`, parameters);
    const total = Number(countRows[0].total);
    return response.json({ data: rows, pagination: { page: values.page, limit: values.limit, total, totalPages: Math.ceil(total / values.limit) } });
  } catch (error) { request.logError(error); return response.status(500).json({ message: 'Unable to retrieve customers.' }); }
});

router.get('/:id', async (request, response) => {
  const id = positiveInteger(request.params.id);
  if (id === null) return response.status(400).json({ message: 'Customer id must be a positive integer.' });
  try {
    const [rows] = await pool.query(`SELECT ${columns} FROM customers WHERE customer_id = ?`, [id]);
    if (!rows.length) return response.status(404).json({ message: 'Customer not found.' });
    return response.json({ data: rows[0] });
  } catch (error) { request.logError(error); return response.status(500).json({ message: 'Unable to retrieve customer.' }); }
});

export default router;
