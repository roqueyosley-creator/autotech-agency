const SYMPTOM_PATTERNS = {
    misfire: ['falla', 'vibra', 'tiembla', 'galopa', 'jalonea', 'se apaga', 'pierde potencia'],
    overheating: ['se calienta', 'temperatura', 'humo', 'vapor', 'radiador', 'anticongelante'],
    electrical: ['no enciende', 'luces', 'batería', 'alternador', 'fusible', 'cortocircuito'],
    fuel: ['consume mucho', 'olor a gasolina', 'no jala', 'ahoga', 'inyector', 'bomba de gasolina'],
    transmission: ['no cambia', 'resbala', 'golpea', 'patina', 'no agarra', 'caja'],
    brakes: ['frena mal', 'ruido al frenar', 'vibra al frenar', 'se jala', 'pedal esponjoso'],
    suspension: ['truena', 'golpetea', 'se va de lado', 'vibra el volante', 'amortiguador']
};

export function classifySymptoms(text: string) {
    const categories: string[] = [];
    const lowerText = text.toLowerCase();

    Object.entries(SYMPTOM_PATTERNS).forEach(([category, keywords]) => {
        if (keywords.some(k => lowerText.includes(k))) {
            categories.push(category);
        }
    });

    return categories;
}

export function prioritizeByLiveData(symptoms: string[], liveData: any) {
    const results = symptoms.map(category => {
        let confirmed = false;
        let score = 0.5;

        if (category === 'overheating' && liveData.temp > 100) {
            confirmed = true;
            score = 0.95;
        }
        if (category === 'misfire' && liveData.rpm < 600) { // Asumiendo ralentí inestable
            confirmed = true;
            score = 0.85;
        }
        if (category === 'electrical' && liveData.voltage < 12) {
            confirmed = true;
            score = 0.9;
        }

        return { category, confirmed, score };
    });

    return results;
}
