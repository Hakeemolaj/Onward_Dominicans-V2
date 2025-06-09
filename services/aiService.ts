
import { apiService } from './apiService';

export const getAIEditorResponse = async (userQuestion: string): Promise<string> => {
  if (!userQuestion || userQuestion.trim().length === 0) {
    throw new Error("Question cannot be empty.");
  }

  try {
    const response = await apiService.askAI(userQuestion.trim());

    if (!response.success) {
      throw new Error(response.error?.message || "AI service request failed");
    }

    if (!response.data?.answer) {
      throw new Error("AI service returned empty response");
    }

    return response.data.answer;
  } catch (error) {
    console.error("Error fetching AI editor response:", error);
    if (error instanceof Error) {
      throw new Error(`AI editor service failed to respond: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI editor service.");
  }
};

export const getAISummary = async (articleContent: string): Promise<string> => {
  if (!articleContent || articleContent.trim().length === 0) {
    throw new Error("Article content cannot be empty.");
  }

  try {
    const response = await apiService.generateSummary(articleContent.trim());

    if (!response.success) {
      throw new Error(response.error?.message || "AI service request failed");
    }

    if (!response.data?.summary) {
      throw new Error("AI service returned empty response");
    }

    return response.data.summary;
  } catch (error) {
    console.error("Error fetching AI summary:", error);
    if (error instanceof Error) {
      throw new Error(`AI summary service failed to respond: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI summary service.");
  }
};

export const checkAIStatus = async (): Promise<boolean> => {
  try {
    const response = await apiService.getAIStatus();
    return response.success && response.data?.available === true;
  } catch (error) {
    console.error("Error checking AI status:", error);
    return false;
  }
};
