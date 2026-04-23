import { Hono } from 'hono';
import { logServiceExecution, getServiceHistory } from '../services/resetEngine';

const services = new Hono();

// GET /api/services/history/:vehicle_id
services.get('/history/:vehicle_id', async (c) => {
    const vehicleId = c.req.param('vehicle_id');
    const history = await getServiceHistory(vehicleId);
    return c.json(history);
});

// POST /api/services/log
services.post('/log', async (c) => {
    const { vehicle_id, service_id, result } = await c.req.json();
    const status = await logServiceExecution(vehicle_id, service_id, result);
    return c.json(status);
});

export default services;
