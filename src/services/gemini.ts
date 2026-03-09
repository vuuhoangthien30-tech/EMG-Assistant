import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function* getAssistantResponseStream(prompt: string, context: string) {
  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.1-flash-lite-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: `Bạn là một trợ lý học tập thông minh cho học sinh sử dụng hệ thống LMS EMG. 
          Dưới đây là ngữ cảnh hiện tại của học sinh: ${context}
          Hãy trả lời một cách thân thiện, khích lệ và ngắn gọn bằng tiếng Việt.
          
          Câu hỏi/Yêu cầu: ${prompt}` }]
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
