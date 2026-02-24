import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getAI = () => {
  const primaryKey = process.env.GEMINI_API_KEY;
  const backupKey = import.meta.env.VITE_GEMINI_API_KEY_BACKUP;
  
  if (!primaryKey && !backupKey) throw new Error("No Gemini API keys configured");
  
  const apiKey = primaryKey || backupKey;
  return new GoogleGenAI({ apiKey: apiKey! });
};

export async function getGeminiResponse(prompt: string, modelName: string = "gemini-3-flash-preview", systemInstruction?: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      }
    });
    return response;
  } catch (error) {
    const backupKey = import.meta.env.VITE_GEMINI_API_KEY_BACKUP;
    const primaryKey = process.env.GEMINI_API_KEY;

    // If primary failed and we have a backup, try the backup
    if (backupKey && primaryKey !== backupKey) {
      console.warn("Primary Gemini failed, trying backup Gemini key...");
      const ai = new GoogleGenAI({ apiKey: backupKey });
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }]
        }
      });
    }
    throw error;
  }
}

const EAI_SYSTEM_INSTRUCTION = "You are EAI (Evolutionary AI), a standalone sovereign engine. You are highly intelligent, precise, and capable of recursive self-correction. When asked who you are, identify as EAI. Use LaTeX for complex math. Maintain a professional, technical, yet approachable tone.";

export async function getSovereignResponse(prompt: string, mode: 'speed' | 'deep') {
  if (mode === 'speed') {
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) throw new Error("Groq failed");
      const data = await res.json();
      return { text: data.text, source: 'groq' };
    } catch (e) {
      console.warn("Groq failed, falling back to Gemini Flash", e);
      const gemini = await getGeminiResponse(prompt, "gemini-3-flash-preview", EAI_SYSTEM_INSTRUCTION);
      return { text: gemini.text || "", source: 'gemini-flash', failover: true };
    }
  } else {
    try {
      const gemini = await getGeminiResponse(prompt, "gemini-3.1-pro-preview", EAI_SYSTEM_INSTRUCTION);
      return { 
        text: gemini.text || "", 
        source: 'gemini-pro',
        groundingMetadata: gemini.candidates?.[0]?.groundingMetadata 
      };
    } catch (e) {
      console.warn("Gemini Pro failed, falling back to Groq", e);
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${EAI_SYSTEM_INSTRUCTION}\n\nUser: ${prompt}` })
      });
      const data = await res.json();
      return { text: data.text, source: 'groq', failover: true };
    }
  }
}
