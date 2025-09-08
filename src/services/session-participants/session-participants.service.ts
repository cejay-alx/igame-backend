import logger from '@/config/logger';
import { createAdminClient } from '@/config/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { SessinPaticipantPayload, SessionParticipantResponse } from './session-participants.types';

const supabase: SupabaseClient | null = createAdminClient();

if (!supabase) {
	const errorMsg = 'Failed to create Supabase admin client for SessionParticipantsService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
	logger.error(errorMsg);
}

export const newParticipantService = async (payload: SessinPaticipantPayload): Promise<SessionParticipantResponse> => {
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
