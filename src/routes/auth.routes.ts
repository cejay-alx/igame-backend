import { handleLogin, handleLogout, handleVerifyMe } from '@/controllers/auth';
import { authorize } from '@/middleware';
import { json, Router } from 'express';

const router = Router();

router.use(json());

// POST /api/v1/auth/login - Login user
router.post('/login', handleLogin);

// GET /api/v1/auth/logout - Log Out user
router.get('/logout', authorize, handleLogout);

// GET /api/v1/auth/verify -Verify user
router.get('/verify', authorize, handleVerifyMe);

export default router;
