import { Hono } from 'hono';
import { executeActuation } from '../services/actuationEngine';

const actuations = new Hono();

// POST /api/actuations/execute
actuations.post('/execute', async (c) => {
    const body = await c.req.json();
    
    // Validación básica de seguridad en el request
    if (!body.safety_confirmed) {
        return c.json({ 
            success: false, 
            error: "La seguridad debe ser confirmada explícitamente por el usuario." 
        }, 403);
    }

    try {
        const result = await executeActuation(body);
        return c.json(result);
    } catch (err: any) {
        return c.json({ success: false, error: err.message }, 500);
    }
});

export default actuations;
