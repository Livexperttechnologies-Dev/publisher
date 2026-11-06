import app from './app';
import { ENV } from './config/env';
import { logger } from './utils/logger';

const server = app.listen(ENV.PORT, () => {
  logger.info(`========================================================`);
  logger.info(`  KIBO360 Enterprise Financial ERP Backend Started`);
  logger.info(`  Listening on Port: ${ENV.PORT}`);
  logger.info(`  Environment: ${ENV.NODE_ENV}`);
  logger.info(`  Health Endpoint: http://localhost:${ENV.PORT}/api/v1/health`);
  logger.info(`========================================================`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Performing graceful shutdown...');
  server.close(() => {
    logger.info('Process terminated gracefully.');
  });
});
