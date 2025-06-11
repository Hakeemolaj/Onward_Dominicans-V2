import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { db } from '../services/database';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { safePrismaOperation, rawSqlFallbacks } from '../utils/prismaHelper';
import {
  ApiResponse,
  CreateUserData,
  LoginData,
  AuthResponse,
} from '../types';

// Register new user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CreateUserData = req.body;

    // Check if user already exists
    const existingUser = await db.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
        ],
      },
    });

    if (existingUser) {
      throw createError('User with this email or username already exists', 400);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // Create user
    const user = await db.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError('JWT secret not configured', 500);
    }

    const token = (jwt as any).sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const authResponse: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role,
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    };

    const response: ApiResponse = {
      success: true,
      data: authResponse,
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password }: LoginData = req.body;

    // Use raw SQL directly to avoid prepared statement conflicts
    console.log('🔄 Using raw SQL for user lookup to avoid prepared statement conflicts');
    console.log('🔍 Login attempt for email:', email);

    const user = await rawSqlFallbacks.findUserByEmail(email);

    console.log('👤 User found:', user ? `${user.email} (${user.role})` : 'No user found');
    console.log('🔒 User active:', user ? user.isActive : 'N/A');

    if (!user || !user.isActive) {
      console.log('❌ Login failed: User not found or inactive');
      throw createError('Invalid credentials', 401);
    }

    // Verify password
    console.log('🔑 Testing password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🧪 Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Login failed: Invalid password');
      throw createError('Invalid credentials', 401);
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError('JWT secret not configured', 500);
    }

    const token = (jwt as any).sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const authResponse: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role,
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    };

    const response: ApiResponse = {
      success: true,
      data: authResponse,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Get user profile
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Use raw SQL directly to avoid prepared statement conflicts
    console.log('🔄 Using raw SQL for profile lookup to avoid prepared statement conflicts');
    const user = await rawSqlFallbacks.findUserById(req.user!.id);

    if (!user) {
      throw createError('User not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
