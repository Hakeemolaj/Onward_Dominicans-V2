/**
 * Enhanced error handling utilities for better error management
 */

export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  NETWORK = 'NETWORK_ERROR',
  DATABASE = 'DATABASE_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  statusCode: number;
  details?: any;
  timestamp: string;
  retryable: boolean;
}

/**
 * Create standardized error objects
 */
export const createAppError = (
  type: ErrorType,
  message: string,
  statusCode: number = 500,
  details?: any,
  retryable: boolean = false
): AppError => ({
  type,
  message,
  statusCode,
  details,
  timestamp: new Date().toISOString(),
  retryable
});

/**
 * Common error creators
 */
export const ErrorCreators = {
  validation: (message: string, details?: any) =>
    createAppError(ErrorType.VALIDATION, message, 400, details),

  authentication: (message: string = 'Authentication required') =>
    createAppError(ErrorType.AUTHENTICATION, message, 401),

  authorization: (message: string = 'Insufficient permissions') =>
    createAppError(ErrorType.AUTHORIZATION, message, 403),

  notFound: (resource: string = 'Resource') =>
    createAppError(ErrorType.NOT_FOUND, `${resource} not found`, 404),

  conflict: (message: string) =>
    createAppError(ErrorType.CONFLICT, message, 409),

  rateLimit: (message: string = 'Too many requests') =>
    createAppError(ErrorType.RATE_LIMIT, message, 429, undefined, true),

  network: (message: string = 'Network error occurred') =>
    createAppError(ErrorType.NETWORK, message, 503, undefined, true),

  database: (message: string = 'Database operation failed') =>
    createAppError(ErrorType.DATABASE, message, 500, undefined, true),

  externalApi: (service: string, message?: string) =>
    createAppError(
      ErrorType.EXTERNAL_API,
      message || `External service ${service} is unavailable`,
      503,
      { service },
      true
    ),

  unknown: (message: string = 'An unexpected error occurred') =>
    createAppError(ErrorType.UNKNOWN, message, 500)
};

/**
 * Error boundary for React components
 */
export class ErrorBoundary {
  private static instance: ErrorBoundary;
  private errorHandlers: Map<ErrorType, (error: AppError) => void> = new Map();

  static getInstance(): ErrorBoundary {
    if (!ErrorBoundary.instance) {
      ErrorBoundary.instance = new ErrorBoundary();
    }
    return ErrorBoundary.instance;
  }

  /**
   * Register error handler for specific error type
   */
  onError(type: ErrorType, handler: (error: AppError) => void): void {
    this.errorHandlers.set(type, handler);
  }

  /**
   * Handle error with appropriate handler
   */
  handleError(error: AppError): void {
    const handler = this.errorHandlers.get(error.type);
    if (handler) {
      handler(error);
    } else {
      // Default error handling
      console.error('Unhandled error:', error);
      this.showUserFriendlyMessage(error);
    }
  }

  private showUserFriendlyMessage(error: AppError): void {
    const userMessage = this.getUserFriendlyMessage(error);
    
    // In a real app, you might show a toast notification or modal
    console.warn('User-friendly error:', userMessage);
  }

  private getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Please check your internet connection and try again.';
      case ErrorType.AUTHENTICATION:
        return 'Please log in to continue.';
      case ErrorType.AUTHORIZATION:
        return 'You don\'t have permission to perform this action.';
      case ErrorType.NOT_FOUND:
        return 'The requested item could not be found.';
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.';
      case ErrorType.VALIDATION:
        return error.message; // Validation messages are usually user-friendly
      default:
        return 'Something went wrong. Please try again later.';
    }
  }
}

/**
 * Retry utility for retryable errors
 */
export class RetryManager {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      delay?: number;
      backoffMultiplier?: number;
      retryCondition?: (error: any) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      delay = 1000,
      backoffMultiplier = 2,
      retryCondition = (error) => error.retryable
    } = options;

    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !retryCondition(error)) {
          throw error;
        }

        const waitTime = delay * Math.pow(backoffMultiplier, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} in ${waitTime}ms`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError;
  }
}

/**
 * Error logging utility
 */
export class ErrorLogger {
  static log(error: AppError, context?: any): void {
    const logEntry = {
      ...error,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    // In production, you'd send this to your logging service
    console.error('Error logged:', logEntry);
  }

  static logPerformance(operation: string, duration: number, success: boolean): void {
    const logEntry = {
      operation,
      duration,
      success,
      timestamp: new Date().toISOString()
    };

    console.log('Performance log:', logEntry);
  }
}

/**
 * Hook for error handling in React components
 */
export const useErrorHandler = () => {
  const errorBoundary = ErrorBoundary.getInstance();

  const handleError = (error: any, context?: any) => {
    let appError: AppError;

    if (error.type && error.message) {
      // Already an AppError
      appError = error;
    } else if (error.response) {
      // HTTP error
      appError = createAppError(
        ErrorType.NETWORK,
        error.response.data?.message || error.message,
        error.response.status,
        error.response.data
      );
    } else if (error.message) {
      // Generic error
      appError = createAppError(
        ErrorType.UNKNOWN,
        error.message,
        500,
        error
      );
    } else {
      // Unknown error format
      appError = ErrorCreators.unknown('An unexpected error occurred');
    }

    ErrorLogger.log(appError, context);
    errorBoundary.handleError(appError);

    return appError;
  };

  const handleAsyncError = async <T>(
    operation: () => Promise<T>,
    context?: any
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };

  return { handleError, handleAsyncError };
};
