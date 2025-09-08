export interface SessionParticipant {
	id: string;
	session_id: string;
	user_id: string;
	chosen_number: number;
	is_winner: boolean;
	joined_at: string;
	is_starter: boolean;
	updated_at: string;
}

export interface SessionParticipantResponse {
	newParticipant: SessionParticipant | null;
	error: { name: string; message: string; status?: string } | null;
}

export interface SessinPaticipantPayload {
	user_id: string;
	is_starter?: boolean;
	chosen_number?: number;
	is_winner?: boolean;
}
