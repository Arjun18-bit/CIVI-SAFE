const knex = require('knex');
const logger = require('../utils/logger');

// Database configuration
const config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'civisafe',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: 20,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    directory: '../database/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: '../database/seeds',
  },
  debug: process.env.NODE_ENV === 'development',
  log: {
    warn(message) {
      logger.warn('Database warning:', message);
    },
    error(message) {
      logger.error('Database error:', message);
    },
    deprecate(message) {
      logger.warn('Database deprecation:', message);
    },
    debug(message) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Database debug:', message);
      }
    },
  },
};

// Create knex instance
const db = knex(config);

// Test the connection
db.raw('SELECT 1')
  .then(() => {
    logger.info('✅ Database connection established');
  })
  .catch((error) => {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Handle database errors
db.on('error', (error) => {
  logger.error('Database error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await db.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
});

module.exports = db; 