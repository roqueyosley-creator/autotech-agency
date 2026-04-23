import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../supabaseClient";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function searchManual(query: string, vehicle: any, limit: number = 5) {
    // Generar embedding del query
    const result = await embedModel.embedContent(query);
    const embedding = result.embedding.values;

    // Búsqueda en Supabase usando pgvector (función match_manual_chunks)
    const { data, error } = await supabase.rpc('match_manual_chunks', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
        filter_make: vehicle.make,
        filter_year: vehicle.year
    });

    if (error) {
        console.error("Error en búsqueda RAG:", error);
        return [];
    }

    return data;
}

export async function enrichPromptWithManual(basePrompt: string, vehicle: any) {
    const relevantChunks = await searchManual(basePrompt, vehicle);
    
    if (relevantChunks && relevantChunks.length > 0) {
        const manualContext = relevantChunks.map((c: any) => c.content).join("\n\n");
        return `${basePrompt}\n\nCONTEXTO TÉCNICO ADICIONAL (Manual de Taller):\n${manualContext}`;
    }
    
    return basePrompt;
}

export async function indexManual(pdfBuffer: Buffer, metadata: any) {
    // Aquí se integraría la extracción de texto de PDF (pdfjs-dist)
    // Por brevedad, simulamos la extracción y chunking
    const text = "Contenido extraído del manual..."; 
    const chunks = text.match(/.{1,500}/g) || []; // Chunking simple para el ejemplo

    for (const content of chunks) {
        const result = await embedModel.embedContent(content);
        const embedding = result.embedding.values;

        await supabase.from('manual_chunks').insert({
            content,
            embedding,
            make: metadata.make,
            model: metadata.model,
            year_from: metadata.year_from,
            year_to: metadata.year_to,
            section: metadata.section,
            source: metadata.source
        });
    }
}
