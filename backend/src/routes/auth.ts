import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { login, register, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;
