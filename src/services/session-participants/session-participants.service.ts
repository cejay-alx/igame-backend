import logger from '@/config/logger';
import { createAdminClient } from '@/config/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { ParticipantResponse, SessionParticipant, SessionParticipantResponse, SessionPaticipantPayload } from './session-participants.types';

const supabase: SupabaseClient | null = createAdminClient();

if (!supabase) {
	const errorMsg = 'Failed to create Supabase admin client for SessionParticipantsService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
	logger.error(errorMsg);
}

export const newParticipantService = async (payload: SessionPaticipantPayload): Promise<SessionParticipantResponse> => {
	if (!supabase) {
		const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
		logger.error(errorMsg);
		return { error: { name: 'ClientInitializationError', message: 'Supabase admin client not initialized' }, newParticipant: null };
	}

	try {
		const { data: newParticipant, error } = await supabase.from('session_participants').insert(payload).select().maybeSingle();

		if (error) {
			logger.error(`Error creating new session participant:`, error);
			return { newParticipant: null, error };
		}

		return { newParticipant, error: null };
	} catch (error: any) {
		logger.error(`Unexpected error in newParticipantService service`, error);
		return { newParticipant: null, error: { name: 'UnexpectedError', message: error.message || 'An unexpected error occurred' } };
	}
};

export const getParticipantByUserIdService = async (user_id: string, session_id: string): Promise<ParticipantResponse> => {
	if (!supabase) {
		const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
		logger.error(errorMsg);
		return { error: { name: 'ClientInitializationError', message: 'Supabase admin client not initialized' }, participant: null };
	}

	try {
		const { data, error } = await supabase.from('session_participants').select('*').eq('user_id', user_id).eq('session_id', session_id).limit(1).maybeSingle();

		if (error) {
			logger.error('Error fetching participant by user ID:', error);
			return { participant: null, error };
		}

		return { participant: data, error: null };
	} catch (error: any) {
		logger.error(`Unexpected error in getParticipantByUserIdService service`, error);
		return { participant: null, error: { name: 'UnexpectedError', message: error.message || 'An unexpected error occurred' } };
	}
};

export const updateParticipantService = async (participantId: string, updates: Partial<SessionPaticipantPayload>): Promise<ParticipantResponse> => {
	if (!supabase) {
		const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
		logger.error(errorMsg);
		return { error: { name: 'ClientInitializationError', message: 'Supabase admin client not initialized' }, participant: null };
	}

	try {
		const { data, error } = await supabase.from('session_participants').update(updates).eq('id', participantId).select().maybeSingle();

		if (error) {
			logger.error('Error updating participant:', error);
			return { participant: null, error };
		}

		return { participant: data, error: null };
	} catch (error: any) {
		logger.error(`Unexpected error in updateParticipantService service`, error);
		return { participant: null, error: { name: 'UnexpectedError', message: error.message || 'An unexpected error occurred' } };
	}
};
