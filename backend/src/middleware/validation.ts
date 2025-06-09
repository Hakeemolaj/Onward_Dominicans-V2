import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { createError } from './errorHandler';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined,
    }));

    // Log detailed validation errors for debugging
    console.error('Validation errors:', {
      url: req.url,
      method: req.method,
      body: req.body,
      errors: errorMessages,
    });

    const detailedMessage = errorMessages.map(e => `${e.field}: ${e.message} (received: ${JSON.stringify(e.value)})`).join(', ');
    throw createError(`Validation failed: ${detailedMessage}`, 400);
  }

  next();
};
