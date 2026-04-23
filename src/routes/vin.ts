import { Hono } from 'hono';
import { advancedVINDecode } from '../services/vinDecoder';

const vin = new Hono();

// GET /api/vin/decode/:vin
vin.get('/decode/:vin', async (c) => {
    const vinCode = c.req.param('vin');
    
    if (!vinCode || vinCode.length < 11) {
        return c.json({ error: "VIN inválido" }, 400);
    }

    try {
        const result = await advancedVINDecode(vinCode);
        return c.json(result);
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

export default vin;
