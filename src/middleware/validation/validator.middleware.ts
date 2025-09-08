import { Response, NextFunction } from 'express';
import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '../auth.middleware';

interface ValidationErrorDetail {
	message: string;
	path: (string | number)[];
	type: string;
}

export const validateRequestBody = (schema: Joi.Schema) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
		const context = req.joiContext || {};
		const { error, value } = schema.validate(req.body, {
			abortEarly: false,
			stripUnknown: true,
			allowUnknown: false,
			context,
		});

		if (error) {
			logger.warn('Request body validation failed:', {
				details: error.details.map((d) => ({ message: d.message, path: d.path, type: d.type })),
				url: req.originalUrl,
				method: req.method,
			});

			const validationErrors: ValidationErrorDetail[] = error.details.map((detail) => ({
				message: detail.message.replace(/['"]/g, ''),
				path: detail.path,
				type: detail.type,
			}));

			res.status(StatusCodes.BAD_REQUEST).json({
				status: 'error',
				message: 'Validation failed',
				errors: validationErrors,
			});
			return;
		}

		req.body = value;
		next();
	};
};
