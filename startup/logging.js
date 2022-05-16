const morgan = require('morgan')
const winston = require('winston')
require('express-async-errors')

const defaultTransports = [
	// - Write all logs with level `error` and below to `error.log`
	new winston.transports.File({
		level: 'error',
		filename: 'error.log',
		format: winston.format.combine(winston.format.colorize(), winston.format.json()),
	}),
	// - Write all warnings through Http
	new winston.transports.Http({
		level: 'warn',
		format: winston.format.json(),
	}),
	// - Write all logs with level `info` and below to `combined.log`
	new winston.transports.File({
		level: 'info',
		filename: 'combined.log',
		format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
	}),
]

const logger = winston.createLogger({
	// If we're not in production then log to the `console` with the format:
	// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
	transports:
		process.env.NODE_ENV === 'production'
			? defaultTransports
			: [
					...defaultTransports,
					new winston.transports.Console({
						format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
					}),
			  ],
	exceptionHandlers: [
		// - Write all unhandled exception logs to `exceptions.log`
		new winston.transports.File({ filename: 'exceptions.log' }),
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), winston.format.prettyPrint()),
		}),
	],
	rejectionHandlers: [
		// - Write all unhandled rejection logs to `rejections.log`
		new winston.transports.File({ filename: 'rejections.log' }),
	],
})

const setupLogging = server => {
	// Also add in morgan logging middleware for dev
	if (process.env.NODE_ENV !== 'production') {
		server.use(morgan('dev'))
		logger.info('Morgan enabled...')
	}
}

module.exports = {
	setupLogging,
	logger,
}
