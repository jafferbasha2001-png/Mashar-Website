import app from './app.js';
import { config } from './config/env.js';

app.listen(config.port, 'localhost', () => console.log(`Mashar server listening at http://localhost:${config.port}`));