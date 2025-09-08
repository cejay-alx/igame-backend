import { createNewGames, getActiveGames } from '@/controllers/game-session';
import { authorize } from '@/middleware';
import { json, Router } from 'express';

const router = Router();

router.use(json());

// GET /api/v1/games/active -Get Active Games
router.get('/active', authorize, getActiveGames);

// POST /api/v1/games/new-game - Create New Game
router.post('/new-game', authorize, createNewGames);

export default router;
