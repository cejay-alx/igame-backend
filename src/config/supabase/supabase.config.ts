import 'dotenv/config';
import logger from '@/config/logger';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string | undefined = process.env.SUPABASE_URL;
const supabaseAnonKey: string | undefined = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	logger.error('Supabase URL and Anon Key must be provided in the .env file.');
	process.exit(1);
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const createAdminClient = (): SupabaseClient | null => {
	const serviceRoleKey: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceRoleKey) {
		logger.error('Supabase URL and Service Role Key must be provided in the .env file for admin client.');
		return null;
	}

	return createClient(supabaseUrl, serviceRoleKey);
};

export { supabase, createAdminClient };
