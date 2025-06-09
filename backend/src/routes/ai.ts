import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { askAIEditor, generateAISummary, getAIStatus } from '../controllers/aiController';

const router = Router();

// Validation rules
const aiEditorValidation = [
  body('question')
    .notEmpty()
    .withMessage('Question is required')
    .isString()
    .withMessage('Question must be a string')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Question must be between 1 and 1000 characters'),
];

const aiSummaryValidation = [
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isString()
    .withMessage('Content must be a string')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
];

// Public routes
router.get('/status', getAIStatus);
router.post('/ask', aiEditorValidation, validateRequest, askAIEditor);
router.post('/summarize', aiSummaryValidation, validateRequest, generateAISummary);

export default router;
