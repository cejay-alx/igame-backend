import logger from '@/config/logger';
import { GameSession, updateGameService } from '@/services/game-session';

export const hasGameHasEnded = async (game: GameSession): Promise<boolean> => {
	const now = new Date();
	const gameEndAt = new Date(new Date(game.created_at).getTime() + game.session_duration * 1000);

	logger.info(`Game session ID ${game.id} started at ${new Date(game.created_at).toISOString()} ends at ${gameEndAt.toISOString()}, current time is ${now.toISOString()}`);

	if (now >= gameEndAt) {
		logger.info(`Game session ID ${game.id} has expired. Marking as finished.`);
		const { error: updateError } = await updateGameService(game.id, { status: 'finished' });
		if (updateError) {
			logger.error(`Error updating game session status to finished for session ID ${game.id}:`, updateError);
		}
		return true;
	}
	return false;
};
