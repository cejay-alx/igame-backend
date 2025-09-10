import logger from '@/config/logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
	user?: string;
	user_id?: string;
	joiContext?: any;
}

export const authorize = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	const accessToken = req.cookies && req.cookies['igame_access_token_live'];

	if (!accessToken) {
		res.status(StatusCodes.UNAUTHORIZED).json({ status: 'error', message: 'Not authorized, Invalid token in cookie' });
		return;
	}

	jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!, (err: jwt.VerifyErrors | null, user: JwtPayload | string | undefined) => {
		if (err) {
			logger.error(`Token verification error:`, err);
			return res.status(StatusCodes.FORBIDDEN).json({ status: 'error', message: 'Token is not valid' });
		}
		if (typeof user === 'object' && user !== null && 'username' in user) {
			req.user = (user as JwtPayload).username as string;
			req.user_id = (user as JwtPayload).id as string;
		} else {
			req.user = undefined;
		}
		next();
	});
};
