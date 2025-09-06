import { handleLogin, handleLogout } from '@/controllers/auth';
import { authorize } from '@/middleware';
import { json, Router } from 'express';

const router = Router();

router.use(json());

// POST /api/v1/auth/login - Login user
router.post('/login', handleLogin);

// GET /api/v1/auth/logout - Log Out user
router.get('/logout', authorize, handleLogout);

export default router;
