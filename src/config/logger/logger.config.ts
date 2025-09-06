import winston from 'winston';
import { inspect } from 'util';

// Custom filter format for the console
const consoleLogFilter = winston.format((info) => {
	// Log if SHOW_LOGS is true OR if the log entry is marked as important
	if (info.isImportant === true || process.env.SHOW_LOGS === 'true') {
		return info; // Pass the log through
	}
	return false; // Filter out the log
});

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || 'info',
	format: winston.format.combine(
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }) // Adds timestamp to all log info objects
	),
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				consoleLogFilter(), // Apply our custom filter first
				winston.format.colorize(), // Add colors for readability in the console
				winston.format.printf((info) => {
					// Custom print format for console
					const { timestamp, level, message, isImportant, ...meta } = info;
					let processedMessage = message;
					if (typeof message === 'object' && message !== null) {
						// If the primary message is an object, inspect it.
						// Pass false for showHidden, 2 for depth, and true for colorize.
						processedMessage = inspect(message, false, 2, true);
					}

					let logStr = `${timestamp} [${level}]: ${processedMessage}`;

					if (isImportant === true && process.env.SHOW_LOGS != 'true') {
						logStr += ` [IMPORTANT]`;
					}

					// Cleanly inspect any remaining metadata
					const displayMeta = { ...meta };
					if (displayMeta.hasOwnProperty('isImportant')) {
						delete displayMeta.isImportant; // Already handled
					}
					// Remove splat which winston adds for variadic arguments to logger methods
					if (displayMeta.hasOwnProperty('splat')) {
						delete displayMeta.splat;
					}

					if (Object.keys(displayMeta).length > 0) {
						// Use util.inspect for better object formatting.
						// Pass false for showHidden, 2 for depth, and true for colorize.
						logStr += ` ${inspect(displayMeta, { showHidden: false, depth: 2, colors: true })}`;
					}
					return logStr;
				})
			),
		}),
	],
});

export default logger;
