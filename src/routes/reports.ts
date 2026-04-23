import { Hono } from 'hono';
import { generatePDF } from '../services/pdfGenerator';
import { whatsappSender } from '../services/whatsappSender';
import { emailSender } from '../services/emailSender';
import { supabase } from '../supabaseClient';

const reports = new Hono();

// POST /api/reports/generate
reports.post('/generate', async (c) => {
    try {
        const payload = await c.req.json();
        const result = await generatePDF(payload);

        // Guardar en base de datos
        const { error } = await supabase.from('reports').insert({
            id: payload.report_id,
            vehicle_id: payload.vehicle.vin || 'N/A',
            customer_name: payload.customer.name,
            total_amount: payload.quote_summary.total,
            severity: payload.severity,
            pdf_url: result.pdf_url,
            raw_data: payload,
            created_at: new Date().toISOString()
        });

        if (error) console.error("Error saving report to DB:", error);

        return c.json(result);
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

// GET /api/reports/history
reports.get('/history', async (c) => {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
});

// POST /api/reports/:id/send-email
reports.post('/:id/send-email', async (c) => {
    const { email, reportData, pdfBase64 } = await c.req.json();
    const result = await emailSender.sendReport(email, reportData, pdfBase64);
    return c.json(result);
});

// POST /api/reports/:id/send-whatsapp
reports.post('/:id/send-whatsapp', async (c) => {
    const { phone, pdfUrl, reportId } = await c.req.json();
    const result = await whatsappSender.sendViaAPI(phone, pdfUrl, reportId);
    return c.json(result);
});

export default reports;
