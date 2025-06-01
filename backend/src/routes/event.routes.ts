import { Router } from 'express';
import { 
    getEventList, 
    getEventById, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    getEventTranslationById 
} from '../controllers/event.controller';
import { validateBody } from '../middlewares/validate';
import { eventSchema, eventUpdateSchema } from '../validators/event.schema';
import { authMiddleware } from '../middlewares/authMiddleware';
import upload from '../config/multer';

const router = Router();

router.get('/', getEventList);
router.get('/:id', getEventById);
router.get('/:id/translation', getEventTranslationById);
router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  validateBody(eventSchema),
  createEvent
);
router.put(
  '/:id',
  authMiddleware,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  validateBody(eventUpdateSchema),
  updateEvent
);
router.delete('/:id', authMiddleware, deleteEvent);

export default router;