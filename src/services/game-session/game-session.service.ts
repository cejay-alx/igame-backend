import logger from '@/config/logger';
import { createAdminClient } from '@/config/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { GameSessionPayload, GameSessionResponse } from './game-session.type';
import { getParticipantByUserIdService, newParticipantService, SessionPaticipantPayload } from '../session-participants';
import { hasGameHasEnded } from '@/lib/helpers';

const supabase: SupabaseClient | null = createAdminClient();

if (!supabase) {
	const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
	logger.error(errorMsg);
}

export const activeGamesService = async (user_id: string): Promise<GameSessionResponse> => {
	if (!supabase) {
		const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
		logger.error(errorMsg);
		return { error: { name: 'ClientInitializationError', message: 'Supabase admin client not initialized' }, game: null };
	}

	try {
		const { data: game, error } = await supabase.from('game_sessions').select('*').in('status', ['active', 'waiting']).maybeSingle();

		if (error) {
			logger.error(`Error fetching active game session:`, error);
			return { game: null, error };
		}

		if (!game) {
			return { game: null, error: null };
		}

		const gameEnded = await hasGameHasEnded(game);

		if (gameEnded) return { game: null, error: null };

		const { participant } = await getParticipantByUserIdService(user_id, game.id);

		const { count } = await supabase.from('session_participants').select('*', { count: 'exact', head: true }).eq('session_id', game.id);

		return { game, error: null, participant, count };
	} catch (err: any) {
		logger.error(`Unexpected error in activeGamesService service`, err);
		return { game: null, error: { name: 'UnexpectedError', message: err.message || 'An unexpected error occurred' } };
	}
};

export const newGameService = async (user: string): Promise<GameSessionResponse> => {
	if (!supabase) {
		const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
		logger.error(errorMsg);
		return { error: { name: 'ClientInitializationError', message: 'Supabase admin client not initialized' }, game: null };
	}

	let newParticipant: SessionPaticipantPayload;

	try {
		const { data: game, error } = await supabase
			.from('game_sessions')
			.insert({
				status: 'waiting',
				session_duration: parseInt(process.env.GAME_DURATION || '100', 10),
				max_players: parseInt(process.env.MAX_USERS_PER_SESSION || '10', 10),
			})
			.select()
			.maybeSingle();

		if (error) {
			logger.error(`Error creating new game session:`, error);
			return { game: null, error };
		}

		newParticipant = {
			user_id: user,
			is_starter: true,
			session_id: game.id,
		};

		await newParticipantService(newParticipant);

		await updateGameService(game.id, { current_players: game.current_players + 1 });

		return { game, error: null };
	} catch (error: any) {
		logger.error(`Unexpected error in newGameService service`, error);
		return { game: null, error: { name: 'UnexpectedError', message: error.message || 'An unexpected error occurred' } };
	}
};

export const getGameByIdService = async (id: string): Promise<GameSessionResponse> => {
	if (!supabase) {
		const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
		logger.error(errorMsg);
		return { error: { name: 'ClientInitializationError', message: 'Supabase admin client not initialized' }, game: null };
	}

	try {
		const { data: game, error } = await supabase.from('game_sessions').select('*').eq('id', id).single();

		if (error) {
			logger.error(`Error fetching game session by ID:`, error);
			return { game: null, error };
		}

		return { game, error: null };
	} catch (error: any) {
		logger.error(`Unexpected error in getGameByIdService service`, error);
		return { game: null, error: { name: 'UnexpectedError', message: error.message || 'An unexpected error occurred' } };
	}
};

export const updateGameService = async (gameId: string, updates: Partial<GameSessionPayload>): Promise<GameSessionResponse> => {
	if (!supabase) {
		const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
		logger.error(errorMsg);
		return { error: { name: 'ClientInitializationError', message: 'Supabase admin client not initialized' }, game: null };
	}

	try {
		const { data, error } = await supabase.from('game_sessions').update(updates).eq('id', gameId).select().maybeSingle();

		if (error) {
			logger.error('Error updating game:', error);
			return { game: null, error };
		}

		return { game: data, error: null };
	} catch (error: any) {
		logger.error(`Unexpected error in updateGameService service`, error);
		return { game: null, error: { name: 'UnexpectedError', message: error.message || 'An unexpected error occurred' } };
	}
};
