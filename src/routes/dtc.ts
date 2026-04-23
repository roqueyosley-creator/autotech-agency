import { Hono } from 'hono';
import { supabase } from '../supabaseClient';
import { explainDTC } from '../services/dtcResolver';

const dtc = new Hono();

// GET /api/dtc/search?q=P0101&make=Toyota&model=Corolla&year=2020
dtc.get('/search', async (c) => {
    const query = c.req.query('q')?.toUpperCase();
    const vehicle = {
        make: c.req.query('make') || 'Universal',
        model: c.req.query('model') || 'Universal',
        year: c.req.query('year') || 'N/A'
    };

    if (!query) return c.json({ error: "Query requerida" }, 400);

    try {
        // 1. Buscar en DB local primero
        const { data: dbResults } = await supabase
            .from('dtc_library')
            .select('*')
            .or(`code.eq.${query},description.ilike.%${query}%`)
            .limit(10);

        // 2. Si no hay resultados detallados o es un código específico, usar AI
        if (!dbResults || dbResults.length === 0 || query.match(/[PBOUC][1-9]/)) {
            // Es un código específico o no hay info en DB
            const aiExplanation = await explainDTC(query, vehicle);
            
            return c.json({
                source: 'ai',
                results: [{
                    code: query,
                    description: aiExplanation.description || "Código identificado por AutoTech AI",
                    possible_causes: aiExplanation.causes?.join(', '),
                    symptoms: aiExplanation.symptoms?.join(', '),
                    fix_steps_json: { steps: aiExplanation.diagnostic_steps || aiExplanation.steps },
                    category: aiExplanation.category || 'Motor'
                }, ...(dbResults || [])]
            });
        }

        return c.json({
            source: 'database',
            results: dbResults
        });

    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

export default dtc;
