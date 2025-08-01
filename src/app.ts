import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { metricsMiddleware, metricsEndpoint } from '@/middleware/metrics';

import { swaggerSpec } from '@/config/swagger';
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { validationErrorHandler } from '@/middleware/validationErrorHandler';
import { setupRoutes } from '@/routes';
import { healthRoutes } from '@/routes/health';
import { logger } from '@/utils/logger';

export async function initializeApp(): Promise<Application> {
  const app = express();

  // Trust proxy (important for rate limiting behind reverse proxy)
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',') || false
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Compression middleware
  app.use(compression());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Prometheus metrics (if enabled)
  if (process.env.ENABLE_METRICS === 'true') {
    app.use(metricsMiddleware);
    
    // Metrics endpoint
    app.get('/metrics', metricsEndpoint);
  }

  // Request logging
  app.use(requestLogger);

  // Health check routes (before authentication)
  app.use('/health', healthRoutes);

  // API documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Bens Seguros API Documentation',
  }));

  // API routes
  app.use('/api', setupRoutes());

  // 404 handler
  app.use(notFoundHandler);

  // Validation error handler (must be before general error handler)
  app.use(validationErrorHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  logger.info('Express app initialized successfully');
  return app;
}

export default initializeApp;