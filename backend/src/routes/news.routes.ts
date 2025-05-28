import { Router } from 'express';
import {
  getNewsList,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/news.controller';
import { validateBody } from '../middlewares/validate';
import { newsSchema } from '../validators/news.schema';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getNewsList);
router.get('/:id', getNewsById);
router.post('/', authMiddleware, validateBody(newsSchema), createNews);
router.put('/:id', authMiddleware, validateBody(newsSchema), updateNews);
router.delete('/:id', authMiddleware, deleteNews);

export default router;