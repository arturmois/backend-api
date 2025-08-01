import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeApp } from '@/app';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/config/database';
import { gracefulShutdown } from '@/utils/gracefulShutdown';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer(): Promise<void> {
  try {
    // Initialize database connection
    await connectDatabase();
    logger.info('Database connected successfully');

    // Initialize Express app
    const app = await initializeApp();
    const server = createServer(app);

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🔍 Health Check: http://localhost:${PORT}/health`);
      if (process.env.ENABLE_METRICS === 'true') {
        logger.info(`📊 Metrics: http://localhost:${process.env.METRICS_PORT || 9090}/metrics`);
      }
    });

    // Setup graceful shutdown
    gracefulShutdown(server);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer().catch((error) => {
    logger.error('Server startup failed:', error);
    process.exit(1);
  });
}

export { startServer };