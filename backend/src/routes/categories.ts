import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticateToken, requireEditor } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';

const router = Router();

// Validation rules
const createCategoryValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('slug').optional().isSlug().withMessage('Invalid slug format'),
  body('description').optional().isString(),
  body('color').optional().isString(),
];

const updateCategoryValidation = [
  param('id').notEmpty().withMessage('Category ID is required'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('slug').optional().isSlug().withMessage('Invalid slug format'),
  body('description').optional().isString(),
  body('color').optional().isString(),
  body('isActive').optional().isBoolean(),
];

const getCategoryValidation = [
  param('id').notEmpty().withMessage('Category ID is required'),
];

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryValidation, validateRequest, getCategory);

// Protected routes (require authentication and editor role)
router.post(
  '/',
  authenticateToken,
  requireEditor,
  createCategoryValidation,
  validateRequest,
  createCategory
);

router.put(
  '/:id',
  authenticateToken,
  requireEditor,
  updateCategoryValidation,
  validateRequest,
  updateCategory
);

router.delete(
  '/:id',
  authenticateToken,
  requireEditor,
  getCategoryValidation,
  validateRequest,
  deleteCategory
);

export default router;
