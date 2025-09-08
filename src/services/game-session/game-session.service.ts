import logger from '@/config/logger';
import { createAdminClient } from '@/config/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { GameSessionResponse } from './game-session.type';
import { newParticipantService, SessinPaticipantPayload } from '../session-participants';

const supabase: SupabaseClient | null = createAdminClient();

if (!supabase) {
	const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
	logger.error(errorMsg);
}

export const activeGamesService = async (): Promise<GameSessionResponse> => {
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

		const now = new Date();
		const gameEndAt = new Date(new Date(game.created_at).getTime() + game.session_duration * 1000);

		logger.info(`Game session ID ${game.id} started at ${new Date(game.created_at).toISOString()} ends at ${gameEndAt.toISOString()}, current time is ${now.toISOString()}`);

		if (now > gameEndAt) {
			logger.info(`Game session ID ${game.id} has expired. Marking as finished.`);
			const { error: updateError } = await supabase.from('game_sessions').update({ status: 'finished' }).eq('id', game.id);
			if (updateError) {
				logger.error(`Error updating game session status to finished for session ID ${game.id}:`, updateError);
			}
			return { game: null, error: null };
		}

		return { game, error: null };
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

	let newParticipant: SessinPaticipantPayload;

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
		};

		await newParticipantService(newParticipant);

		return { game, error: null };
	} catch (error: any) {
		logger.error(`Unexpected error in newGameService service`, error);
		return { game: null, error: { name: 'UnexpectedError', message: error.message || 'An unexpected error occurred' } };
	}
};
