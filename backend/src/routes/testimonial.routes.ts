import { Router } from 'express';
import { 
    createTestimonial, 
    deleteTestimonial, 
    getTestimonialById, 
    getTestimonialList, 
    updateTestimonial 
} from '../controllers/testimonial.controller';
import { validateBody } from '../middlewares/validate';
import { testimonialSchema } from '../validators/testimonial.schema';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getTestimonialList);
router.get('/:id', getTestimonialById);
router.post('/', authMiddleware, validateBody(testimonialSchema), createTestimonial);
router.put('/:id', authMiddleware, validateBody(testimonialSchema), updateTestimonial);
router.delete('/:id', authMiddleware, deleteTestimonial);

export default router;