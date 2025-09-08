import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/middleware';
import { activeGamesService, newGameService } from '@/services/game-session';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const getActiveGames = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const { game, error } = await activeGamesService();

		if (error) {
			logger.error('Active Games controller: error occured while fetching active games', error);
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: error.message });
			return;
		}

		res.status(StatusCodes.OK).json({ game, error: null });
	} catch (error: any) {
		res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: error.message });
	}
};
export const createNewGames = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const user = req.user_id || '';

		if (!user) {
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: 'User ID not found in request' });
			return;
		}

		const { game: oldGame, error: oldGameError } = await activeGamesService();

		if (oldGameError) {
			logger.error('New Games controller: error occured while checking for existing active game', oldGameError);
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: oldGameError.message || 'Failed to check for existing active game' });
			return;
		}

		if (oldGame) {
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: 'An active game session already exists. Please finish the current game before creating a new one.' });
			return;
		}

		const { game, error } = await newGameService(user);

		if (error || !game) {
			logger.error('New Games controller: error occured while creating new game', error);
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: error?.message || 'Failed to create new game' });
			return;
		}

		res.status(StatusCodes.OK).json({ game, error: null });
		return;
	} catch (error: any) {
		res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: error.message });
	}
};
