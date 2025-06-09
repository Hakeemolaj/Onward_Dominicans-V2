import { Router } from 'express';
import { db } from '../services/database';
import { ApiResponse } from '../types';

const router = Router();

// Get all tags
router.get('/', async (req, res, next) => {
  try {
    const tags = await db.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: tags,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
