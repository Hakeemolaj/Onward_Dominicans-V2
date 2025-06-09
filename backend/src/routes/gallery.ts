import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticateToken, requireEditor } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  getGalleryItems,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/galleryController';

const router = Router();

// Validation rules
const createGalleryItemValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('imageUrl').custom((value) => {
    // Accept both regular URLs and data URLs
    if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:image/'))) {
      return true;
    }
    throw new Error('Valid image URL or data URL is required');
  }),
  body('thumbnailUrl').optional({ nullable: true }).custom((value) => {
    // Accept both regular URLs and data URLs, or null/undefined
    if (!value || (typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:image/')))) {
      return true;
    }
    throw new Error('Valid thumbnail URL or data URL is required');
  }),
  body('description').optional({ nullable: true }).isString(),
  body('categoryId').optional({ nullable: true }).isString(),
  body('photographer').optional({ nullable: true }).isString(),
  body('dateTaken').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  body('location').optional({ nullable: true }).isString(),
  body('tags').optional({ nullable: true }).isArray(),
  body('tags.*').optional().isString(),
  body('stackGroup').optional({ nullable: true }).isString(),
  body('stackOrder').optional({ nullable: true }).isInt({ min: 0 }),
  body('isStackCover').optional({ nullable: true }).isBoolean(),
];

const updateGalleryItemValidation = [
  param('id').notEmpty().withMessage('Gallery item ID is required'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('imageUrl').optional().custom((value) => {
    // Accept both regular URLs and data URLs
    if (!value || (typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:image/')))) {
      return true;
    }
    throw new Error('Valid image URL or data URL is required');
  }),
  body('thumbnailUrl').optional({ nullable: true }).custom((value) => {
    // Accept both regular URLs and data URLs, or null/undefined
    if (!value || (typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:image/')))) {
      return true;
    }
    throw new Error('Valid thumbnail URL or data URL is required');
  }),
  body('description').optional({ nullable: true }).isString(),
  body('categoryId').optional({ nullable: true }).isString(),
  body('photographer').optional({ nullable: true }).isString(),
  body('dateTaken').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  body('location').optional({ nullable: true }).isString(),
  body('tags').optional({ nullable: true }).isArray(),
  body('tags.*').optional().isString(),
  body('stackGroup').optional({ nullable: true }).isString(),
  body('stackOrder').optional({ nullable: true }).isInt({ min: 0 }),
  body('isStackCover').optional({ nullable: true }).isBoolean(),
  body('isActive').optional({ nullable: true }).isBoolean(),
];

const getGalleryItemValidation = [
  param('id').notEmpty().withMessage('Gallery item ID is required'),
];

const getGalleryItemsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'title', 'dateTaken']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('categoryId').optional().isString(),
  query('search').optional().isString(),
];

// Public routes
router.get('/', getGalleryItemsValidation, validateRequest, getGalleryItems);
router.get('/:id', getGalleryItemValidation, validateRequest, getGalleryItem);

// Protected routes (require authentication and editor role)
router.post(
  '/',
  authenticateToken,
  requireEditor,
  createGalleryItemValidation,
  validateRequest,
  createGalleryItem
);

router.put(
  '/:id',
  authenticateToken,
  requireEditor,
  updateGalleryItemValidation,
  validateRequest,
  updateGalleryItem
);

router.delete(
  '/:id',
  authenticateToken,
  requireEditor,
  getGalleryItemValidation,
  validateRequest,
  deleteGalleryItem
);

export default router;
