import { Router } from 'express';
import upload from '../config/multer';
import { uploadCover, uploadGallery } from '../controllers/uploadController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/cover', authMiddleware, upload.single('image'), uploadCover);
router.post('/gallery', authMiddleware, upload.array('images', 10), uploadGallery);

export default router;
