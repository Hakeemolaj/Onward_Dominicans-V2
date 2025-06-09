import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticateToken, requireEditor } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  getAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from '../controllers/authorController';

const router = Router();

// Validation rules
const createAuthorValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('bio').optional().isString(),
  body('avatarUrl').optional().isURL().withMessage('Invalid avatar URL'),
];

const updateAuthorValidation = [
  param('id').notEmpty().withMessage('Author ID is required'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('bio').optional().isString(),
  body('avatarUrl').optional().isURL().withMessage('Invalid avatar URL'),
  body('isActive').optional().isBoolean(),
];

const getAuthorValidation = [
  param('id').notEmpty().withMessage('Author ID is required'),
];

const getAuthorsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['name', 'createdAt', 'updatedAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

// Public routes
router.get('/', getAuthorsValidation, validateRequest, getAuthors);
router.get('/:id', getAuthorValidation, validateRequest, getAuthor);

// Protected routes (require authentication and editor role)
router.post(
  '/',
  authenticateToken,
  requireEditor,
  createAuthorValidation,
  validateRequest,
  createAuthor
);

router.put(
  '/:id',
  authenticateToken,
  requireEditor,
  updateAuthorValidation,
  validateRequest,
  updateAuthor
);

router.delete(
  '/:id',
  authenticateToken,
  requireEditor,
  getAuthorValidation,
  validateRequest,
  deleteAuthor
);

export default router;
