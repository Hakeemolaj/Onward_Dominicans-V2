
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AI_EDITOR_SYSTEM_INSTRUCTION, AI_SUMMARY_SYSTEM_INSTRUCTION } from '../constants';

// Ensure API_KEY is available in the environment.
// The build process or hosting environment must set this.
// DO NOT hardcode the API key or prompt the user for it.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY environment variable is not set. AI Service will not function.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" }); // Fallback to prevent crash if key is missing, though errors will occur.

export const getAIEditorResponse = async (userQuestion: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API key is not configured. Cannot contact AI service.");
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: [{ role: "user", parts: [{text: userQuestion}] }],
      config: {
        systemInstruction: AI_EDITOR_SYSTEM_INSTRUCTION,
      },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching AI editor response:", error);
    if (error instanceof Error) {
         throw new Error(`AI editor service failed to respond: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI editor service.");
  }
};

export const getAISummary = async (articleContent: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API key is not configured. Cannot contact AI service for summary.");
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: [{ role: "user", parts: [{ text: articleContent }] }],
      config: {
        systemInstruction: AI_SUMMARY_SYSTEM_INSTRUCTION,
        // temperature: 0.5, // Potentially adjust for more factual summaries
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching AI summary:", error);
     if (error instanceof Error) {
         throw new Error(`AI summary service failed to respond: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI summary service.");
  }
};
