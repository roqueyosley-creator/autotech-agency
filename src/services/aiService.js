const API_BASE = '/api/ai';

export const aiService = {
    async diagnose(payload) {
        const response = await fetch(`${API_BASE}/diagnose`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await response.json();
    },

    async* streamChat(message, history, context) {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history, context })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = JSON.parse(line.slice(6));
                    if (data.done) return;
                    yield data.text;
                }
            }
        }
    },

    async getDiagnosticTree(dtcs, liveData, vehicle) {
        const response = await fetch(`${API_BASE}/diagnostic-tree`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dtcs, live_data: liveData, vehicle })
        });
        return await response.json();
    },

    async explainDTC(code, vehicle) {
        const response = await fetch(`${API_BASE}/explain-dtc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, vehicle })
        });
        return await response.json();
    }
};
