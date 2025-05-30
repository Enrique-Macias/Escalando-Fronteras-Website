import { Router } from 'express';
import upload from '../config/multer';
import { createNews, getNewsList, getNewsById, updateNews, deleteNews } from '../controllers/news.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validate';
import { newsSchema } from '../validators/news.schema';

const router = Router();

router.get('/', getNewsList);
router.get('/:id', getNewsById);
router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  validateBody(newsSchema),
  createNews
);
router.put(
  '/:id',
  authMiddleware,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  validateBody(newsSchema),
  updateNews
);
router.delete('/:id', authMiddleware, deleteNews);

export default router; 