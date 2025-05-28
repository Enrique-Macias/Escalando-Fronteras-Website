import { Router } from 'express';
import { 
    getEventList, 
    getEventById, 
    createEvent, 
    updateEvent, 
    deleteEvent 
} from '../controllers/event.controller';
import { validateBody } from '../middlewares/validate';
import { eventSchema } from '../validators/event.schema';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getEventList);
router.get('/:id', getEventById);
router.post('/', authMiddleware, validateBody(eventSchema), createEvent);
router.put('/:id', authMiddleware, validateBody(eventSchema), updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);

export default router;