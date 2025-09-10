import logger from '@/config/logger';
import { GameSession, updateGameService } from '@/services/game-session';
import { getAllParticipantsService, updateParticipantService } from '@/services/session-participants';
import { updateUserService } from '@/services/user';

export const hasGameHasEnded = async (game: GameSession): Promise<boolean> => {
	const now = new Date();
	const gameEndAt = new Date(new Date(game.created_at).getTime() + game.session_duration * 1000);

	logger.info(`Game session ID ${game.id} started at ${new Date(game.created_at).toISOString()} ends at ${gameEndAt.toISOString()}, current time is ${now.toISOString()}`);

	if (now >= gameEndAt) {
		logger.info(`Game session ID ${game.id} has expired. Marking as finished.`);

		const min = 1,
			max = 9;

		const winningNumber = Math.floor(Math.random() * (max - min + 1)) + min;

		const { error: updateError } = await updateGameService(game.id, { status: 'finished', winning_number: winningNumber });
		if (updateError) {
			logger.error(`Error updating game session status to finished for session ID ${game.id}:`, updateError);
		}

		const { participants } = await getAllParticipantsService(game.id);

		if (participants) {
			for (const participant of participants) {
				const isWinner = participant.chosen_number === winningNumber;
				participant.is_winner = isWinner;
				await updateParticipantService(participant.id, { is_winner: isWinner, updated_at: new Date().toISOString() });

				const total_losses = Number(participant.user?.total_losses || 0) + (isWinner ? 0 : 1);

				const total_wins = Number(participant.user?.total_wins || 0) + (isWinner ? 1 : 0);

				await updateUserService(participant.user_id, { total_losses, total_wins });
			}
		}
		return true;
	}
	return false;
};
