export interface GameSession {
	id: string;
	session_date: string;
	winning_number: number | null;
	status: 'waiting' | 'active' | 'finished';
	max_players: number;
	current_players: number;
	session_duration: number;
	created_at: string;
	started_at: string;
	ended_at: string;
}

export interface GameSessionResponse {
	game: GameSession | null;
	error: { name: string; message: string; status?: string } | null;
}
