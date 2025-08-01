import { Router } from 'express';
import { authenticate } from '@/middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/v1/claims:
 *   get:
 *     summary: Get user claims
 *     description: Retrieve claims for the authenticated user
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: status
 *         in: query
 *         description: Filter claims by status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [submitted, under_review, investigating, approved, denied, closed, reopened]
 *     responses:
 *       200:
 *         description: Claims retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', authenticate, (req, res) => {
  res.json({
    success: true,
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    },
    message: 'Claims endpoint - implementation pending'
  });
});

/**
 * @swagger
 * /api/v1/claims/{id}:
 *   get:
 *     summary: Get claim by ID
 *     description: Retrieve a specific claim by ID
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Claim ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Claim retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authenticate, (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'Claim detail endpoint - implementation pending'
  });
});

export { router as claimRoutes };
export default router;