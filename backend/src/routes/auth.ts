import { Router } from 'express';
import { csrfProtection } from '../middlewares/csrf';
import { login } from '../controllers/authController';
import { forgotPassword } from '../controllers/authController';
import { resetPassword } from '../controllers/authController';

const router = Router();

router.post('/login', csrfProtection, login);
router.post('/forgot', forgotPassword);
router.post('/reset', resetPassword);

export default router; 