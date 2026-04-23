import { Hono } from 'hono';
import { cors } from 'hono/cors';
import ai from './routes/ai';
import actuations from './routes/actuations';
import vin from './routes/vin';
import dtc from './routes/dtc';
import services from './routes/services';
import reports from './routes/reports';

const app = new Hono();

// Middleware
app.use('*', cors());

// Health check
app.get('/health', (c) => c.json({ status: 'ok', engine: 'AutoTech PRO Core' }));

// Mount Routes
app.route('/api/ai', ai);
app.route('/api/actuations', actuations);
app.route('/api/vin', vin);
app.route('/api/dtc', dtc);
app.route('/api/services', services);
app.route('/api/reports', reports);

export default app;
