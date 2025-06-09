import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticateToken, requireEditor } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController';

const router = Router();

// Validation rules
const createArticleValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('summary').notEmpty().withMessage('Summary is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('authorId').notEmpty().withMessage('Author ID is required'),
  body('slug').optional().isSlug().withMessage('Invalid slug format'),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('categoryId').optional().isString(),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED']),
];

const updateArticleValidation = [
  param('id').notEmpty().withMessage('Article ID is required'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('summary').optional().notEmpty().withMessage('Summary cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  body('slug').optional().isSlug().withMessage('Invalid slug format'),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('categoryId').optional().isString(),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
];

const getArticleValidation = [
  param('id').notEmpty().withMessage('Article ID is required'),
];

const getArticlesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'title', 'publishedAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
];

// Public routes
router.get('/', getArticlesValidation, validateRequest, getArticles);
router.get('/:id', getArticleValidation, validateRequest, getArticle);

// Protected routes (require authentication and editor role)
router.post(
  '/',
  authenticateToken,
  requireEditor,
  createArticleValidation,
  validateRequest,
  createArticle
);

router.put(
  '/:id',
  authenticateToken,
  requireEditor,
  updateArticleValidation,
  validateRequest,
  updateArticle
);

router.delete(
  '/:id',
  authenticateToken,
  requireEditor,
  getArticleValidation,
  validateRequest,
  deleteArticle
);

export default router;
