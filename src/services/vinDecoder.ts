import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface DecodedVehicle {
    vin: string;
    make: string;
    model: string;
    year: string;
    country: string;
    plant: string;
    engine: {
        displacement: string;
        cylinders: string;
        fuel: string;
        configuration: string;
    };
    body: string;
    drive_type: string;
    transmission: string;
    market_value_estimate?: string;
    common_issues?: string[];
}

export async function advancedVINDecode(vin: string): Promise<DecodedVehicle> {
    // 1. Fetch from NHTSA (The official source)
    const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`;
    let nhtsaData: any = {};
    
    try {
        const response = await fetch(nhtsaUrl);
        const json = await response.json();
        nhtsaData = json.Results[0] || {};
    } catch (e) {
        console.error("NHTSA API Error:", e);
    }

    // 2. Use Gemini to enrich and verify the data
    // Even if NHTSA returns data, Gemini can provide "Common Issues" and "Market Context"
    const prompt = `
        Eres un experto en identificación de vehículos (VIN Decoding). 
        Tengo este VIN: ${vin}
        Datos actuales de la API (pueden estar incompletos):
        Marca: ${nhtsaData.Make}
        Modelo: ${nhtsaData.Model}
        Año: ${nhtsaData.ModelYear}
        Motor: ${nhtsaData.DisplacementL}L ${nhtsaData.EngineCylinders}cyl
        
        Tu tarea:
        1. Valida si estos datos son consistentes con el VIN.
        2. Identifica el País de Origen y la Planta de Ensamblaje basada en los primeros 3-11 dígitos.
        3. Proporciona una lista de 3 "Fallas Comunes" conocidas para este modelo exacto.
        4. Identifica el tipo de transmisión y tracción (AWD/FWD/RWD) usual para esta configuración.
        
        Responde estrictamente en formato JSON con esta estructura:
        {
            "country": string,
            "plant": string,
            "engine_config": string,
            "drive_type": string,
            "transmission": string,
            "common_issues": string[],
            "fun_fact": string
        }
    `;

    let enrichedData = {
        country: nhtsaData.Country || "Desconocido",
        plant: nhtsaData.PlantCity || "Desconocido",
        engine_config: "N/A",
        drive_type: nhtsaData.DriveType || "N/A",
        transmission: nhtsaData.TransmissionStyle || "N/A",
        common_issues: [],
        fun_fact: ""
    };

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const aiJson = JSON.parse(jsonMatch[0]);
            enrichedData = { ...enrichedData, ...aiJson };
        }
    } catch (e) {
        console.error("Gemini Enrichment Error:", e);
    }

    return {
        vin,
        make: nhtsaData.Make || "Desconocido",
        model: nhtsaData.Model || "Desconocido",
        year: nhtsaData.ModelYear || "N/A",
        country: enrichedData.country,
        plant: enrichedData.plant,
        engine: {
            displacement: nhtsaData.DisplacementL ? `${nhtsaData.DisplacementL}L` : "N/A",
            cylinders: nhtsaData.EngineCylinders || "N/A",
            fuel: nhtsaData.FuelTypePrimary || "N/A",
            configuration: enrichedData.engine_config
        },
        body: nhtsaData.BodyClass || "N/A",
        drive_type: enrichedData.drive_type,
        transmission: enrichedData.transmission,
        common_issues: enrichedData.common_issues
    };
}
