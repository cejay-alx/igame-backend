import { createNewGames, endGameSession, getActiveGames, getGamesByDate, getTopPlayers, joinGameSession, leaveGameSession, setUserNumber } from '@/controllers/game-session';
import { authorize } from '@/middleware';
import { manageGame, updateGame, validateRequestBody } from '@/middleware/validation';
import { json, Router } from 'express';

const router = Router();

router.use(json());

// GET /api/v1/games/active -Get Active Games
router.get('/active', authorize, getActiveGames);

// POST /api/v1/games/new-game - Create New Game
router.post('/new-game', authorize, createNewGames);

// POST /api/v1/games/set-number - Set User Number
router.post('/set-number', authorize, validateRequestBody(updateGame), setUserNumber);

// POST /api/v1/games/join-game - Join Game Session
router.post('/join-game', authorize, validateRequestBody(manageGame), joinGameSession);

// POST /api/v1/games/leave-game - Leave Game Session
router.post('/leave-game', authorize, validateRequestBody(manageGame), leaveGameSession);

// POST /api/v1/games/end-game - End Game Session
router.post('/end-game', authorize, validateRequestBody(manageGame), endGameSession);

// GET /api/v1/games/top-players - Get Top Players
router.get('/top-players', authorize, getTopPlayers);

// GET /api/v1/games/:date - Get Game History by Date
router.get('/:date', authorize, getGamesByDate);

export default router;
