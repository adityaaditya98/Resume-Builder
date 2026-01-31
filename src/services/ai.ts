
interface AIResponse {
    response: string;
    done: boolean;
}

const getBaseUrl = () => {
    return import.meta.env.VITE_AI_BASE_URL || 'http://localhost:11434';
};

export const generateText = async (prompt: string, context: string = ''): Promise<string> => {
    try {
        const fullPrompt = `${context}\n\nTask: ${prompt}\n\nResponse:`;
        const baseUrl = getBaseUrl();

        const response = await fetch(`${baseUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3', // Default to llama3, user can change or we can detect
                prompt: fullPrompt,
                stream: false
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to connect to Local AI');
        }

        const data: AIResponse = await response.json();
        return data.response;
    } catch (error) {
        console.error('AI Generation Error:', error);
        throw error;
    }
};

export const checkLocalAI = async (): Promise<boolean> => {
    try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/api/tags`); // Ollama list models endpoint
        return response.ok;
    } catch {
        return false;
    }
};
