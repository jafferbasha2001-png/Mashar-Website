import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/env.js';
import { checkDatabase } from './config/database.js';
import customerRoutes from './routes/customers.js';

const app = express();
app.use(express.json());
app.use((request, response, next) => { request.logError = error => console.error(`[database] ${error.code || 'error'}: ${error.message}`); next(); });

app.get('/api/health', async (request, response) => { try { await checkDatabase(); response.json({ status: 'ok', database: 'connected' }); } catch (error) { request.logError(error); response.status(503).json({ status: 'error', database: 'unavailable', message: 'Database connectivity check failed.' }); } });
app.use('/api/customers', customerRoutes);

const clientPath = fileURLToPath(config.clientDist);
app.use(express.static(clientPath));
app.get('*', (request, response, next) => { if (request.path.startsWith('/api/')) return next(); response.sendFile(path.join(clientPath, 'index.html')); });
app.use((request, response) => response.status(404).json({ message: 'Route not found.' }));

export default app;