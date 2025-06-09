import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticateToken, requireEditor } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  getGalleryCategories,
  getGalleryCategory,
  createGalleryCategory,
  updateGalleryCategory,
  deleteGalleryCategory,
} from '../controllers/galleryCategoryController';

const router = Router();

// Validation rules
const createGalleryCategoryValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('slug').optional().isSlug().withMessage('Invalid slug format'),
  body('description').optional().isString(),
  body('color').optional().isString(),
];

const updateGalleryCategoryValidation = [
  param('id').notEmpty().withMessage('Gallery category ID is required'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('slug').optional().isSlug().withMessage('Invalid slug format'),
  body('description').optional().isString(),
  body('color').optional().isString(),
  body('isActive').optional().isBoolean(),
];

const getGalleryCategoryValidation = [
  param('id').notEmpty().withMessage('Gallery category ID is required'),
];

const getGalleryCategoriesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['name', 'createdAt', 'updatedAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

// Public routes
router.get('/', getGalleryCategoriesValidation, validateRequest, getGalleryCategories);
router.get('/:id', getGalleryCategoryValidation, validateRequest, getGalleryCategory);

// Protected routes (require authentication and editor role)
router.post(
  '/',
  authenticateToken,
  requireEditor,
  createGalleryCategoryValidation,
  validateRequest,
  createGalleryCategory
);

router.put(
  '/:id',
  authenticateToken,
  requireEditor,
  updateGalleryCategoryValidation,
  validateRequest,
  updateGalleryCategory
);

router.delete(
  '/:id',
  authenticateToken,
  requireEditor,
  getGalleryCategoryValidation,
  validateRequest,
  deleteGalleryCategory
);

export default router;
