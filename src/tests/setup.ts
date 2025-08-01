import { db } from '@/config/database';
import { logger } from '@/utils/logger';

// Setup test environment
beforeAll(async () => {
  // Run migrations for test database
  try {
    await db.migrate.latest();
    logger.info('Test database migrations completed');
  } catch (error) {
    logger.error('Test database migration failed:', error);
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
    logger.info('Test database connection closed');
  } catch (error) {
    logger.error('Error closing test database connection:', error);
  }
});

// Increase test timeout for database operations
jest.setTimeout(30000);