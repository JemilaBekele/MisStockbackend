const winston = require('winston');

const { format, createLogger, transports } = winston;
const { printf, combine, timestamp, colorize, uncolorize } = format;

const config = require('./config'); // should contain config.env

// Custom log format
const winstonFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts}: ${level}: ${stack || message}`;
});

// Create logger
const logger = createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp(),
    winstonFormat,
    config.env === 'development' ? colorize() : uncolorize(),
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
