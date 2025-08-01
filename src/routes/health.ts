import { Router, Request, Response } from 'express';
import { db } from '@/config/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     description: Returns the basic health status of the application
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: Application is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    node: process.version,
    memory: process.memoryUsage(),
  };

  res.status(200).json(healthCheck);
}));

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check
 *     description: Returns detailed health status including database connectivity
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: One or more services are unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/detailed', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const checks: Record<string, any> = {};
  let overallStatus = 'healthy';

  // Database health check
  try {
    const startTime = Date.now();
    await db.raw('SELECT 1+1 AS result');
    const responseTime = Date.now() - startTime;
    
    checks.database = {
      status: 'connected',
      responseTime: `${responseTime}ms`,
    };
  } catch (error) {
    overallStatus = 'unhealthy';
    checks.database = {
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    logger.error('Database health check failed:', error);
  }

  // Memory check
  const memoryUsage = process.memoryUsage();
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  
  checks.memory = {
    status: memoryUsagePercent < 90 ? 'healthy' : 'warning',
    usage: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      percentage: `${memoryUsagePercent.toFixed(2)}%`,
    },
  };

  if (memoryUsagePercent >= 95) {
    overallStatus = 'unhealthy';
  }

  // CPU check (simplified)
  const cpuUsage = process.cpuUsage();
  checks.cpu = {
    status: 'healthy',
    user: cpuUsage.user,
    system: cpuUsage.system,
  };

  const healthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    node: process.version,
    checks,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
}));

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check
 *     description: Kubernetes readiness probe endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is ready to serve traffic
 *       503:
 *         description: Application is not ready
 */
router.get('/ready', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connectivity
    await db.raw('SELECT 1+1 AS result');
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}));

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check
 *     description: Kubernetes liveness probe endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is alive
 */
router.get('/live', (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export { router as healthRoutes };
export default router;