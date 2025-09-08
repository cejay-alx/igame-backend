import { SessionParticipant } from '../session-participants';

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
	participant?: SessionParticipant | null;
	count?: number | null;
	error: { name: string; message: string; status?: string } | null;
}

export interface GameSessionPayload {
	session_date: string;
	winning_number: number | null;
	status: 'waiting' | 'active' | 'finished';
	max_players: number;
	current_players: number;
	session_duration: number;
	started_at: string;
	ended_at: string;
}
