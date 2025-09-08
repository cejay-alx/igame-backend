import { SupabaseClient } from '@supabase/supabase-js';
import { LoginRequest, LoginResponse } from './auth.type';
import jwt from 'jsonwebtoken';
import { createAdminClient } from '@/config/supabase';
import logger from '@/config/logger';

const supabase: SupabaseClient | null = createAdminClient();

if (!supabase) {
	const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
	logger.error(errorMsg);
}

export const loginUser = async (payload: LoginRequest): Promise<LoginResponse> => {
	const { username, session_ends_in } = payload;

	if (!supabase) {
		const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
		logger.error(errorMsg);
		return { error: { name: 'ClientInitializationError', message: 'Supabase admin client not initialized' }, credentials: null };
	}

	try {
		const { error } = await supabase.from('users').update({ is_logged_in: true, session_ends_in }).eq('username', username);

		if (error) {
			return { credentials: null, error: { status: error.hint, message: error.message, name: error.name } };
		}

		const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: Number(process.env.MAX_AGE!) });

		return { credentials: { username, accessToken }, error: null };
	} catch (error: unknown) {
		return { error: null, credentials: null };
	}
};

export const logoutUser = async (username: string): Promise<{ error: string | null }> => {
	if (!supabase) {
		const errorMsg = 'Failed to create Supabase admin client for UsersService. Check environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
		logger.error(errorMsg);
		return { error: 'Supabase admin client not initialized' };
	}

	try {
		const { error } = await supabase.from('users').update({ is_logged_in: false, session_ends_in: null }).eq('username', username);
		return { error: error ? error.message : null };
	} catch (error: unknown) {
		return { error: null };
	}
};
