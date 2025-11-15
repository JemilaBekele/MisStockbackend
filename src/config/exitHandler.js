// exitHandler.js
const logger = require('./logger');

// Graceful exit handler
const exitHandler = (server, error) => {
  if (error) {
    logger.error(error.stack || error);
  }

  if (process.env.NODE_ENV === 'development') {
    // In development, stop the server to notice errors
    if (server) {
      server.close(() => {
        logger.info('Server closed in development');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  } else {
    // In production, just log the error and keep server running
    logger.info('Production: server continues running after error');
  }
};

module.exports = exitHandler;
