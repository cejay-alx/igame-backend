import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/middleware';
import { loginUser, logoutUser } from '@/services/auth';
import { getUserByUsername, signUpUser } from '@/services/user';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const handleLogin = async (req: Request, res: Response): Promise<void> => {
	logger.info('Handling user login');
	let userData;
	const credentials = req.body;

	if (!credentials || !credentials.username) {
		res.status(StatusCodes.BAD_REQUEST).json({ user: null, error: 'Invalid credentials' });
		return;
	}

	let { user } = await getUserByUsername(credentials.username);
	if (!user) {
		let { user } = await signUpUser(credentials.username);
		userData = user;
	} else {
		userData = user;
	}

	const now = new Date();
	if (userData?.session_ends_in) {
		if (now <= new Date(userData?.session_ends_in)) {
			res.status(StatusCodes.FORBIDDEN).json({ user: null, error: 'User has an active session' });
		}
	}

	const maxAge = 3600000; // 1 hour in milliseconds
	const sessionEndsIn = new Date(now.getTime() + maxAge);
	const payload = { username: credentials.username, session_ends_in: sessionEndsIn };

	const { credentials: loginData } = await loginUser(payload);

	logger.info(`Setting accessToken cookie for user: ${credentials.username}`);

	res.cookie('access_token', loginData?.accessToken, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge,
		path: '/',
	});

	res.status(StatusCodes.OK).json({ user: userData, error: null });
	try {
	} catch (error: any) {}
};

export const handleLogout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	logger.info('Handling user logout');
	let username: string = '';

	if (req.user && typeof req.user === 'string') {
		username = req.user;
	} else {
		res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid user' });
		return;
	}

	logger.info(`Logging out user: ${username}`);

	const { error } = await logoutUser(username);

	if (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Logout failed' });
		return;
	}

	res.clearCookie('access_token', {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/',
	});

	res.status(StatusCodes.OK).json({ message: `Logged out successfully` });
};
