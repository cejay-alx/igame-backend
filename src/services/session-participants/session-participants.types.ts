export interface SessionParticipant {
	id: string;
	session_id: string;
	user_id: string;
	chosen_number: number;
	is_winner: boolean;
	joined_at: string;
	is_starter: boolean;
	updated_at: string;
	user: {
		total_wins?: number;
		total_losses?: number;
		username?: string;
	} | null;
}

export interface SessionParticipantResponse {
	newParticipant: SessionParticipant | null;
	error: { name: string; message: string; status?: string } | null;
}

export interface ParticipantResponse {
	participant: SessionParticipant | null;
	error: { name: string; message: string; status?: string } | null;
}

export interface ParticipantsResponse {
	participants: SessionParticipant[] | null;
	error: { name: string; message: string; status?: string } | null;
}

export interface SessionPaticipantPayload {
	user_id: string;
	is_starter?: boolean;
	chosen_number?: number;
	is_winner?: boolean;
	session_id: string;
	updated_at?: string;
}
