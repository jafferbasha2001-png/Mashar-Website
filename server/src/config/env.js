import 'dotenv/config';

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_CONNECTION_LIMIT'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) throw new Error(`Missing required server environment variables: ${missing.join(', ')}`);

const port = Number(process.env.PORT || 3001);
const dbPort = Number(process.env.DB_PORT);
const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT);
if (![port, dbPort, connectionLimit].every(Number.isInteger) || port < 1 || dbPort < 1 || connectionLimit < 1) throw new Error('PORT, DB_PORT, and DB_CONNECTION_LIMIT must be positive integers.');

export const config = { port, clientDist: new URL('../../../client/dist', import.meta.url), db: { host: process.env.DB_HOST, port: dbPort, user: process.env.DB_USER, password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME, connectionLimit } };