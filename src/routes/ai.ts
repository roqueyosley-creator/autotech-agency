import { Hono } from 'hono';
import { streamText } from 'hono/streaming';
import { analyzeFault, streamChat, analyzeTelemetry } from '../services/aiDiagnostic';
import { classifySymptoms, prioritizeByLiveData } from '../services/symptomAnalyzer';
import { explainDTC, generateDiagnosticTree } from '../services/dtcResolver';
import { enrichPromptWithManual } from '../services/ragEngine';

const ai = new Hono();

// POST /api/ai/diagnose
ai.post('/diagnose', async (c) => {
    const payload = await c.req.json();
    const { symptoms, live_data, vehicle } = payload;

    // 1. Clasificar síntomas
    const categories = classifySymptoms(symptoms);
    const prioritization = prioritizeByLiveData(categories, live_data);

    // 2. Enriquecer con manuales
    const enrichedPrompt = await enrichPromptWithManual(symptoms, vehicle);

    // 3. Análisis Gemini
    const result = await analyzeFault({
        ...payload,
        symptoms: enrichedPrompt,
        analysis_metadata: prioritization
    });

    return c.json(result);
});

// POST /api/ai/chat (Streaming SSE)
ai.post('/chat', async (c) => {
    const { message, history, context } = await c.req.json();

    return streamText(c, async (stream) => {
        const chatGen = streamChat(message, history, context);
        
        for await (const chunk of chatGen) {
            await stream.write(`data: ${JSON.stringify({ text: chunk, done: false })}\n\n`);
        }
        
        await stream.write(`data: ${JSON.stringify({ text: '', done: true })}\n\n`);
    });
});

// POST /api/ai/explain-dtc
ai.post('/explain-dtc', async (c) => {
    const { code, vehicle } = await c.req.json();
    const explanation = await explainDTC(code, vehicle);
    return c.json(explanation);
});

// POST /api/ai/diagnostic-tree
ai.post('/diagnostic-tree', async (c) => {
    const { dtcs, live_data, vehicle } = await c.req.json();
    const tree = await generateDiagnosticTree(dtcs, live_data);
    return c.json(tree);
});

// POST /api/ai/analyze-telemetry
ai.post('/analyze-telemetry', async (c) => {
    const { snapshot } = await c.req.json();
    const analysis = await analyzeTelemetry(snapshot);
    return c.json(analysis);
});

// POST /api/ai/report-summary
ai.post('/report-summary', async (c) => {
    const { vehicle, dtcs, telemetry } = await c.req.json();
    const { analyzeForReport } = await import('../services/aiDiagnostic');
    const summary = await analyzeForReport(vehicle, dtcs, telemetry);
    return c.json({ summary });
});

export default ai;
