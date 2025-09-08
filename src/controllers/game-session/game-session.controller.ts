import logger from '@/config/logger';
import { createAdminClient } from '@/config/supabase';
import { hasGameHasEnded } from '@/lib/helpers';
import { AuthenticatedRequest } from '@/middleware';
import { activeGamesService, getGameByIdService, newGameService, updateGameService } from '@/services/game-session';
import { getParticipantByUserIdService, newParticipantService, updateParticipantService } from '@/services/session-participants';
import { SupabaseClient } from '@supabase/supabase-js';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const supabase: SupabaseClient | null = createAdminClient();

if (!supabase) {
	const errorMsg = 'Failed to create Supabase admin client for SessionParticipantsService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
	logger.error(errorMsg);
}

export const getActiveGames = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const user = req.user_id || '';

		if (!user) {
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: 'User ID not found in request' });
			return;
		}

		const { game, error, participant, count } = await activeGamesService(user);

		if (error) {
			logger.error('Active Games controller: error occured while fetching active games', error);
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: error.message });
			return;
		}

		res.status(StatusCodes.OK).json({ game, error: null, participant, count });
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

		const { game: oldGame, error: oldGameError } = await activeGamesService(user);

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
		logger.error('New Games controller: unexpected error', error);
		res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: error.message });
	}
};

export const setUserNumber = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const { chosen_number, game_id } = req.body;
		const user = req.user_id || '';

		if (!game_id || !chosen_number || !user) {
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: 'Session ID and chosen number are required' });
			return;
		}

		const { game, error } = await getGameByIdService(game_id);
		if (error || !game) {
			logger.error('Set User Number controller: error occured while fetching game by ID', error);
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: error?.message || 'Failed to fetch game by ID' });
			return;
		}

		if (game.status == 'finished') {
			logger.error('Set User Number controller: Cannot set a number for a finished game.', error);
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: 'The game has ended' });
			return;
		}

		const gameEnded = await hasGameHasEnded(game);

		if (gameEnded) {
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: 'The game has ended' });
			return;
		}

		const { participant, error: participantError } = await getParticipantByUserIdService(user, game.id);
		if (participantError || !participant) {
			logger.error('Set User Number controller: error occured while fetching participant by user ID', participantError);
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: 'You need to join the game before selecting a number' });
			return;
		}

		const { error: updateError } = await updateParticipantService(participant?.id, { chosen_number });

		if (updateError) {
			logger.error('Set User Number controller: error occured while updating participant chosen number', updateError);
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: updateError.message || 'Failed to set chosen number' });
			return;
		}

		res.status(StatusCodes.OK).json({ game, error: null });
	} catch (error: any) {
		logger.error('Set User Number controller: unexpected error', error);
		res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: error.message });
	}
};

export const joinGameSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => manageGameSession(req, res, 'join');

export const leaveGameSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => manageGameSession(req, res, 'leave');

async function manageGameSession(req: AuthenticatedRequest, res: Response, type: 'leave' | 'join') {
	try {
		const { game_id } = req.body;
		const user = req.user_id || '';

		if (!game_id || !user) {
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: 'Session ID is required' });
			return;
		}

		if (!supabase) {
			const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
			logger.error(errorMsg);
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: 'A server error occurred' });
			return;
		}

		const { game, error } = await getGameByIdService(game_id);
		if (error || !game) {
			logger.error('Set User Number controller: error occured while fetching game by ID', error);
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: error?.message || 'Failed to fetch game by ID' });
			return;
		}

		const gameEnded = await hasGameHasEnded(game);

		if (gameEnded) {
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: 'The game has ended' });
			return;
		}

		const { participant, error: participantError } = await getParticipantByUserIdService(user, game.id);
		if (participantError) {
			logger.error('Join Game controller: error occured while fetching participant by user ID', participantError);
			res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: participantError.message || 'Failed to fetch participant by user ID' });
			return;
		}

		if (type == 'join') {
			if (participant) {
				res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: 'You have already joined this game session' });
				return;
			}

			if (game.current_players + 1 >= game.max_players) {
				res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: 'The game session is full and cannot accept more players' });
				return;
			}

			const { newParticipant, error: newParticipantError } = await newParticipantService({
				user_id: user,
				session_id: game.id,
			});

			if (newParticipantError) {
				logger.error(`${type.toLocaleUpperCase()} Game controller: error occured while creating new participant`, newParticipantError);
				res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: newParticipantError.message || `Failed to ${type.toLocaleUpperCase()} game session` });
				return;
			}

			await updateGameService(game.id, { current_players: game.current_players + 1 });

			res.status(StatusCodes.OK).json({ game, error: null, participant: newParticipant });
		} else {
			logger.info(`User ID ${user} is attempting to leave game session ID ${game.id}`);
			if (!participant) {
				res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: 'You have not joined this game session so you cannot leave.' });
				return;
			}

			logger.info(`User ID ${user} is leaving game session ID ${game.id} as participant ID ${participant.id}`);

			// ensure the delete returns the deleted row so we can verify a row was removed
			const { data, error } = await supabase.from('session_participants').delete().eq('id', participant.id).select().maybeSingle();

			if (error || !data) {
				logger.error('Error deleting participation record:', error, data);
				res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: error?.message || 'An error occurred while attempting to leave game.' });
				return;
			}

			await updateGameService(game.id, { current_players: game.current_players - 1 });

			res.status(StatusCodes.OK).json({ game: null, error: null });
		}
	} catch (error: any) {
		logger.error(`${type.toLocaleUpperCase()} Game controller: unexpected error`, error);
		res.status(StatusCodes.BAD_REQUEST).json({ game: null, error: error.message });
	}
}
