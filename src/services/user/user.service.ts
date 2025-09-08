import { createAdminClient } from '@/config/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserResponse } from './user.type';
import logger from '@/config/logger';

const supabase: SupabaseClient | null = createAdminClient();

if (!supabase) {
	const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
	logger.error(errorMsg);
}

export const getUserByUsername = async (username: string): Promise<UserResponse> => {
	logger.info(`Fetching user by username: ${username}`);
	if (!username) {
		return { user: null, error: { name: 'Input Error', message: 'Username is required' } };
	}

	if (!supabase) {
		const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
		logger.error(errorMsg);
		return { user: null, error: { name: 'ClientInitializationError', message: 'Supabase admin client not initialized' } };
	}

	try {
		const { data, error } = await supabase.from('users').select('*').eq('username', username).single();

		if (error) {
			logger.error(`Error fetching user by username ${username}:`, error);
			return { user: null, error };
		}

		return { user: data, error: null };
	} catch (err: any) {
		logger.error(`Unexpected error in getUserByUsername service for user ${username}:`, err);
		return { user: null, error: { name: 'UnexpectedError', message: err.message || 'An unexpected error occurred' } };
	}
};

export const signUpUser = async (username: string): Promise<UserResponse> => {
	if (!username) {
		return { user: null, error: { name: 'Input Error', message: 'Username is required' } };
	}

	if (!supabase) {
		const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
		logger.error(errorMsg);
		return { user: null, error: { name: 'ClientInitializationError', message: 'Supabase admin client not initialized' } };
	}

	try {
		const { data, error } = await supabase.from('users').insert({ username }).select().single();
		if (error) {
			return { user: null, error };
		}

		return { user: data, error: null };
	} catch (err: any) {
		logger.error(`Unexpected error in signUpUser service for user ${username}:`, err);
		return { user: null, error: { name: 'UnexpectedError', message: err.message || 'An unexpected error occurred' } };
	}
};
