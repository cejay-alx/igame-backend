import express from 'express';
import authRoutes from './auth.routes';
import gamesRoutes from './game-session.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/games', gamesRoutes);

export default router;
