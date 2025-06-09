import { Request, Response, NextFunction } from 'express';
import { getAIEditorResponse, getAISummary, isAIServiceAvailable } from '../services/aiService';
import { ApiResponse } from '../types';

// AI Editor Query endpoint
export const askAIEditor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Question is required and must be a non-empty string',
        },
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    if (!isAIServiceAvailable()) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'AI service is not available. Please try again later.',
        },
        timestamp: new Date().toISOString(),
      };
      res.status(503).json(response);
      return;
    }

    const aiResponse = await getAIEditorResponse(question);

    const response: ApiResponse = {
      success: true,
      data: {
        question: question.trim(),
        answer: aiResponse,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('AI Editor query failed:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'AI service failed to respond',
      },
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

// AI Summary endpoint
export const generateAISummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Content is required and must be a non-empty string',
        },
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    if (!isAIServiceAvailable()) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'AI service is not available. Please try again later.',
        },
        timestamp: new Date().toISOString(),
      };
      res.status(503).json(response);
      return;
    }

    const summary = await getAISummary(content);

    const response: ApiResponse = {
      success: true,
      data: {
        originalContent: content.trim(),
        summary: summary,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('AI Summary generation failed:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'AI service failed to generate summary',
      },
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

// AI Service Status endpoint
export const getAIStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isAvailable = isAIServiceAvailable();

    const response: ApiResponse = {
      success: true,
      data: {
        available: isAvailable,
        status: isAvailable ? 'ready' : 'unavailable',
        message: isAvailable 
          ? 'AI service is ready to process requests' 
          : 'AI service is not configured or unavailable',
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('AI Status check failed:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Failed to check AI service status',
      },
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};
