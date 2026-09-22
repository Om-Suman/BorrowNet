import app from './app.js';
import config from './config/index.js';
import { prisma } from './core/prisma.js';
import { redis } from './core/redis.js';
import logger from './core/logger.js';

async function start() {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL');

    const server = app.listen(config.port, () => {
      logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
    });

    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      
      server.close(() => {
        logger.info('HTTP server closed.');
      });

      try {
        await prisma.$disconnect();
        logger.info('Prisma disconnected.');
      } catch (err) {
        logger.error('Error during Prisma disconnect', { error: err.message });
      }

      if (redis) {
        try {
          await redis.quit();
          logger.info('Redis disconnected.');
        } catch (err) {
          logger.error('Error during Redis disconnect', { error: err.message });
        }
      }

      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
  process.exit(1);
});

start();
