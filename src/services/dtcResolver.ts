import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Usamos flash para rapidez en explicaciones simples

export async function explainDTC(code: string, vehicle: any) {
    const prompt = `
    Explicación técnica profunda del código DTC: ${code}
    Vehículo: ${vehicle.make} ${vehicle.model} ${vehicle.year}

    Por favor proporciona:
    1. Descripción del código.
    2. Síntomas comunes.
    3. Causas más probables (ordenadas por frecuencia).
    4. Pasos de diagnóstico guiados (Árbol de decisión).
    5. Herramientas necesarias.

    Responde en formato JSON estructurado.
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}

export async function generateDiagnosticTree(dtcs: string[], liveData: any) {
    const prompt = `
    Genera un árbol de diagnóstico interactivo (formato JSON) basado en estos códigos: ${dtcs.join(", ")}
    Datos actuales: ${JSON.stringify(liveData)}

    El árbol debe tener hasta 5 niveles con preguntas Sí/No que lleven a un componente específico.
    Estructura esperada: { "id": "root", "question": "...", "yes": { ... }, "no": { ... } }
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}
