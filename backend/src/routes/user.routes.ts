import { Router } from 'express';
import { createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { validateBody } from '../middlewares/validate';
import { userCreateSchema, userUpdateSchema } from '../validators/user.schema';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.post('/', authMiddleware, requireAdmin, validateBody(userCreateSchema), createUser);
router.put('/:id', authMiddleware, requireAdmin, validateBody(userUpdateSchema), updateUser);
router.delete('/:id', authMiddleware, requireAdmin, deleteUser);

export default router;
