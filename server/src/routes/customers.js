import { Router } from 'express';
import { pool } from '../config/database.js';

const router = Router();
const columns = 'customer_id, first_name, last_name, email, phone, city, country, created_at';

function pagination(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) return null;
  return { page, limit, offset: (page - 1) * limit };
}

router.get('/', async (request, response) => {
  const values = pagination(request.query);
  if (!values) return response.status(400).json({ message: 'page must be a positive integer and limit must be between 1 and 100.' });
  try {
    const [rows] = await pool.query(`SELECT ${columns} FROM customers ORDER BY customer_id LIMIT ? OFFSET ?`, [values.limit, values.offset]);
    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM customers');
    const total = Number(countRows[0].total);
    return response.json({ data: rows, pagination: { page: values.page, limit: values.limit, total, totalPages: Math.ceil(total / values.limit) } });
  } catch (error) { request.logError(error); return response.status(500).json({ message: 'Unable to retrieve customers.' }); }
});

router.get('/:id', async (request, response) => {
  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id < 1) return response.status(400).json({ message: 'Customer id must be a positive integer.' });
  try {
    const [rows] = await pool.query(`SELECT ${columns} FROM customers WHERE customer_id = ?`, [id]);
    if (!rows.length) return response.status(404).json({ message: 'Customer not found.' });
    return response.json({ data: rows[0] });
  } catch (error) { request.logError(error); return response.status(500).json({ message: 'Unable to retrieve customer.' }); }
});

export default router;