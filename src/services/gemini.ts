import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function* getAssistantResponseStream(prompt: string, context: string) {
  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.1-flash-lite-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: `You are an intelligent study assistant for students using the EMG LMS system. 
          Here is the student's current context: ${context}
          Please respond in a friendly, encouraging, and concise manner in English.
          
          Question/Request: ${prompt}` }]
        }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "Xin lỗi, mình đang gặp chút trục trặc kỹ thuật. Bạn hãy thử lại sau nhé!";
  }
}
