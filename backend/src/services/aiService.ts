import { GoogleGenAI } from "@google/genai";

// AI System Instructions
const AI_EDITOR_SYSTEM_INSTRUCTION = `You are a helpful and concise AI assistant for 'Onward Dominicans', a community news publication. Our publication's mission is: "Empowering the Dominican community through informed journalism and civic engagement". Your role is to answer user questions about:
1. How to submit news tips or story ideas.
2. General inquiries about our publication's work and focus.
3. Basic journalistic practices or ethics relevant to a community paper.
4. Information about our contact details (which is contact@onwarddominicans.com).

If a question falls outside these topics (e.g., asking for news summaries, personal opinions, or complex off-topic subjects), politely state that you can assist with questions about the publication itself and how to interact with it. Keep responses informative, friendly, and brief (1-3 sentences if possible). Do not make up information if you don't know the answer for a relevant topic; instead, suggest contacting contact@onwarddominicans.com directly.`;

const AI_SUMMARY_SYSTEM_INSTRUCTION = `You are a helpful AI assistant. Summarize the following news article content into a concise TL;DR (Too Long; Didn't Read) format. The summary should be 2-3 sentences and capture the main points and key takeaways of the article.`;

// Get API key from environment
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable is not set. AI Service will not function.");
}

let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Failed to initialize Google Generative AI:", error);
  }
}

export const getAIEditorResponse = async (userQuestion: string): Promise<string> => {
  if (!apiKey || !ai) {
    throw new Error("API key is not configured. Cannot contact AI service.");
  }
  
  if (!userQuestion || userQuestion.trim().length === 0) {
    throw new Error("Question cannot be empty.");
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: "user", parts: [{ text: userQuestion.trim() }] }],
      config: {
        systemInstruction: AI_EDITOR_SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text;
    
    if (!text) {
      throw new Error("AI service returned empty response");
    }
    
    return text;
  } catch (error) {
    console.error("Error fetching AI editor response:", error);
    if (error instanceof Error) {
      throw new Error(`AI editor service failed to respond: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI editor service.");
  }
};

export const getAISummary = async (articleContent: string): Promise<string> => {
  if (!apiKey || !ai) {
    throw new Error("API key is not configured. Cannot contact AI service for summary.");
  }
  
  if (!articleContent || articleContent.trim().length === 0) {
    throw new Error("Article content cannot be empty.");
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: "user", parts: [{ text: articleContent.trim() }] }],
      config: {
        systemInstruction: AI_SUMMARY_SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text;
    
    if (!text) {
      throw new Error("AI service returned empty response");
    }
    
    return text;
  } catch (error) {
    console.error("Error fetching AI summary:", error);
    if (error instanceof Error) {
      throw new Error(`AI summary service failed to respond: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI summary service.");
  }
};

export const isAIServiceAvailable = (): boolean => {
  return !!(apiKey && ai);
};
