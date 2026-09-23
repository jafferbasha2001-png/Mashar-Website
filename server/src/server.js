import app from './app.js';
import { config } from './config/env.js';
import { pool } from './config/database.js';

const server = app.listen(config.port, 'localhost', () => {
  console.log(`Mashar server listening at http://localhost:${config.port}`);
});

server.on('error', async error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use. Stop the existing Mashar server (Ctrl+C in its terminal), then restart this server.`);
  } else {
    console.error(`Unable to start Mashar server: ${error.message}`);
  }
  await pool.end();
  process.exitCode = 1;
});
