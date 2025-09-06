export interface UserData {
	id: string;
	username: string;
	total_wins: string;
	total_losses: string;
	created_at: string;
	is_logged_in: boolean;
	session_ends_in: string | null;
}

export interface UserResponse {
	user: UserData | null;
	error: { name: string; message: string; status?: string } | null;
}
