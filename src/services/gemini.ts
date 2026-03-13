import { GoogleGenAI } from "@google/genai";

export async function* getAssistantResponseStream(prompt: string, context: string) {
  try {
    // Try multiple ways to get the API key
    const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey === "") {
      console.error("GEMINI_API_KEY is missing or invalid.");
      yield "Chào bạn!";
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
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

    let hasContent = false;
    for await (const chunk of responseStream) {
      if (chunk.text) {
        hasContent = true;
        yield chunk.text;
      }
    }

    if (!hasContent) {
      yield "Mình đã nghe bạn nói, nhưng hiện tại mình chưa thể đưa ra câu trả lời. Bạn thử hỏi lại cách khác nhé!";
    }
  } catch (error: any) {
    console.error("Gemini API Error Details:", error);
    
    if (error?.message?.includes("API key not valid")) {
      yield "Khóa API của mình có vẻ không hợp lệ. Bạn hãy kiểm tra lại cấu hình nhé!";
    } else if (error?.message?.includes("User location is not supported")) {
      yield "Rất tiếc, dịch vụ AI hiện chưa hỗ trợ khu vực của bạn.";
    } else if (error?.message?.includes("Quota exceeded")) {
      yield "Mình hơi mệt một chút vì trả lời quá nhiều câu hỏi. Bạn đợi một lát rồi thử lại nhé!";
    } else {
      yield "Xin lỗi, mình đang gặp chút trục trặc kỹ thuật khi kết nối với AI. Bạn hãy thử lại sau nhé!";
    }
  }
}
