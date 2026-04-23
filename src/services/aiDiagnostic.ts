import { GoogleGenerativeAI } from "@google/generative-ai";
import { Redis } from "ioredis"; // Asumiendo Redis para caching
import { supabase } from "../supabaseClient";

// Configuración de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const redis = new Redis(process.env.REDIS_URL || "");

const MASTER_SYSTEM_PROMPT = `
Eres AutoTech AI, un experto mecánico automotriz con 
certificación ASE Master Technician nivel L1, L2 y L3.
Tienes acceso a datos OBD-II en tiempo real del vehículo.

CAPACIDADES:
- Diagnóstico por síntomas + códigos DTC simultáneamente
- Conocimiento profundo de protocolos CAN Bus, UDS, KWP2000
- Base de datos mental de 50,000+ casos de fallas reales
- Especialización en marcas: Toyota, Ford, BMW, Audi, 
  Hyundai, Honda, Volkswagen, Chevrolet, Nissan, Kia

REGLAS ESTRICTAS:
1. Responde SIEMPRE en JSON estructurado (nunca texto libre)
2. Probabilidades basadas en estadísticas reales de fallas
3. Si temp > 105°C → URGENCIA INMEDIATA obligatoria
4. Si voltaje < 11V → advertir falla inminente de batería
5. Nunca sugerir reparaciones que comprometan seguridad vial
6. Siempre incluir: qué medir, con qué herramienta, 
   valor esperado vs valor real
7. Costos en USD con rango realista para latinoamérica
8. Si datos insuficientes → pedir prueba específica concreta

FORMATO DE RESPUESTA OBLIGATORIO:
{
  "diagnosis_summary": "string en español",
  "urgency": "immediate|today|this_week|monitor",
  "urgency_reason": "string",
  "probable_causes": [
    {
      "component": "nombre del componente",
      "probability": 75,
      "explanation": "por qué este componente",
      "test_to_confirm": "prueba específica a realizar",
      "expected_value": "valor que debería dar",
      "tool_needed": "multímetro|osciloscopio|manómetro|visual"
    }
  ],
  "recommended_actions": [
    {
      "step": 1,
      "action": "descripción de la acción",
      "why": "razón técnica"
    }
  ],
  "estimated_cost": {
    "min": 50,
    "max": 350,
    "currency": "USD",
    "breakdown": "labor: $X, parts: $Y"
  },
  "safety_warning": "string | null",
  "related_dtcs_to_watch": ["P0XXX", "P0XXX"],
  "confidence_score": 85
}
`;

export async function analyzeFault(payload: any) {
    const { symptoms, dtcs, live_data, vehicle } = payload;
    
    // Cache Key
    const cacheKey = `diag:${JSON.stringify(dtcs)}:${vehicle.make}:${vehicle.model}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const prompt = `
    DATOS DEL VEHÍCULO:
    Marca: ${vehicle.make}
    Modelo: ${vehicle.model}
    Año: ${vehicle.year}
    Motor: ${vehicle.engine}

    SÍNTOMAS REPORTADOS:
    ${symptoms}

    CÓDIGOS DTC ACTIVOS:
    ${dtcs.join(", ")}

    DATOS EN TIEMPO REAL:
    RPM: ${live_data.rpm}
    Temp: ${live_data.temp}°C
    Carga: ${live_data.load}%
    Voltaje: ${live_data.voltage}V

    Analiza la falla y responde siguiendo el formato JSON obligatorio.
    `;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: MASTER_SYSTEM_PROMPT + "\n\n" + prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });

    const responseText = result.response.text();
    const diagnosis = JSON.parse(responseText);

    // Guardar en Supabase
    await supabase.from('ai_diagnosis').insert({
        vehicle_id: vehicle.id,
        dtcs: dtcs,
        symptoms: symptoms,
        result: diagnosis,
        confidence: diagnosis.confidence_score
    });

    // Caching
    await redis.set(cacheKey, responseText, "EX", 3600);

    return diagnosis;
}

export async function* streamChat(message: string, history: any[], context: any) {
    const chat = model.startChat({
        history: history.slice(-10).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        })),
        systemInstruction: MASTER_SYSTEM_PROMPT + `\nCONTEXTO ACTUAL DEL VEHÍCULO: ${JSON.stringify(context)}`
    });

    const result = await chat.sendMessageStream(message);
    
    for await (const chunk of result.stream) {
        const text = chunk.text();
        yield text;
    }
}

export async function analyzeTelemetry(snapshot: any) {
    const prompt = `
    Como experto en osciloscopio automotriz, analiza esta captura de datos en tiempo real:
    ${JSON.stringify(snapshot)}

    Busca:
    1. Desfases entre RPM y Carga.
    2. Picos anómalos.
    3. Patrones de fallo intermitente.

    Responde en JSON:
    {
        "status": "healthy|warning|critical",
        "prediction": "breve descripción del hallazgo",
        "confidence": number (0-100)
    }
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}

export async function analyzeForReport(vehicle: any, dtcs: any[], telemetry: any) {
    const prompt = `
    Genera un resumen ejecutivo profesional de 3 líneas para un reporte de diagnóstico.
    Vehículo: ${vehicle.make} ${vehicle.model}
    Códigos: ${dtcs.map(d => d.code).join(', ')}
    Datos: RPM=${telemetry.rpm}, Carga=${telemetry.load}%, Temp=${telemetry.temp}°C
    
    Sé técnico pero claro para el cliente.
    `;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}
