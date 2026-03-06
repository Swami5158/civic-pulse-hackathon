import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const geminiService = {
  async getChat() {
    return ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are a helpful civic assistant for CivicPulse AI. You help citizens report issues and track them. You can also provide advice on civic matters.",
      },
    });
  }
};
