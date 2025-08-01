import { db } from '@/config/database';
import { logger } from '@/utils/logger';
import { Application } from 'express';
import { initializeApp } from '@/app';

let app: Application;

// Global test application instance
export const getTestApp = (): Application => {
  if (!app) {
    throw new Error('Test app not initialized. Call setupTestApp() first.');
  }
  return app;
};

// Setup test application
export const setupTestApp = async (): Promise<Application> => {
  if (!app) {
    app = await initializeApp();
  }
  return app;
};

// Setup integration test environment
beforeAll(async () => {
  // Initialize test application
  await setupTestApp();
  
  // Run migrations for test database
  try {
    await db.migrate.latest();
    logger.info('Integration test database migrations completed');
  } catch (error) {
    logger.error('Integration test database migration failed:', error);
    throw error;
  }
});

// Cleanup after each test
afterEach(async () => {
  // Clear all tables except migrations
  const tables = await db.raw(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename != 'knex_migrations' 
    AND tablename != 'knex_migrations_lock';
  `);
  
  for (const table of tables.rows) {
    await db.raw(`TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE;`);
  }
});

// Cleanup test database
afterAll(async () => {
  try {
    await db.destroy();
    logger.info('Integration test database connection closed');
  } catch (error) {
    logger.error('Error closing integration test database connection:', error);
  }
});

// Increase test timeout for integration tests
jest.setTimeout(60000);