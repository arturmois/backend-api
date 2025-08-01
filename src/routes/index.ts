import { Router } from 'express';
import { userRoutes } from '@/routes/users';
import { authRoutes } from '@/routes/auth';
import { policyRoutes } from '@/routes/policies';
import { claimRoutes } from '@/routes/claims';

export function setupRoutes(): Router {
  const router = Router();

  // API versioning
  const v1Router = Router();

  // Mount route modules
  v1Router.use('/auth', authRoutes);
  v1Router.use('/users', userRoutes);
  v1Router.use('/policies', policyRoutes);
  v1Router.use('/claims', claimRoutes);

  // Mount versioned routes
  router.use('/v1', v1Router);

  // Default route (redirect to latest version)
  router.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Bens Seguros API',
      version: '1.0.0',
      documentation: `${req.protocol}://${req.get('host')}/api-docs`,
      health: `${req.protocol}://${req.get('host')}/health`,
    });
  });

  return router;
}

export default setupRoutes;