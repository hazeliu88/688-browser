const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp, service }) => {
    return `${timestamp} [${service}] ${level}: ${message}`;
});

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        colorize(),
        logFormat
    ),
    defaultMeta: { service: 'puppeteer-bit' },
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' })
    ]
});

// 导出日志方法
module.exports = {
    browser: (message) => logger.log({ level: 'info', message, service: 'Browser' }),
    puppeteer: (message) => logger.log({ level: 'info', message, service: 'Puppeteer' }),
    debug: (message) => logger.log({ level: 'debug', message, service: 'Debug' }),
    error: (message) => logger.log({ level: 'error', message, service: 'Error' })
};