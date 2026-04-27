import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { register, login, logout, getMe, updateProfile, deleteAccount } from '../controllers/auth.js';

const router = Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.delete('/account', auth, deleteAccount);

export default router;