export interface LoginRequest {
	username: string;
	session_ends_in: Date;
}

export interface Credentials {
	username: string;
	accessToken: string;
}

export interface LoginResponse {
	credentials: Credentials | null;
	error: { name: string; message: string; status?: string } | null;
}
