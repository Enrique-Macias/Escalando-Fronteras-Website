import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { customCors } from './middlewares/cors';
import { csrfProtection, sendCsrfToken } from './middlewares/csrf';
import authRouter from './routes/auth';
import protectedRouter from './routes/protected';
import newsRouter from './routes/newsRoutes';
import eventRouter from './routes/event.routes';
import testimonialRouter from './routes/testimonial.routes';
import auditRouter from './routes/audit.routes';
import userRouter from './routes/user.routes';
import uploadRouter from './routes/uploadRoutes';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(customCors);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/protected', protectedRouter);
app.use('/api/v1/news', newsRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/testimonials', testimonialRouter);
app.use('/api/v1/audit', auditRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/uploads', uploadRouter);

// Endpoint para obtener el token CSRF
app.get('/api/v1/auth/login', csrfProtection, sendCsrfToken, (req, res) => {
  res.json({ message: 'CSRF token sent in header' });
});

// Ejemplo de ruta protegida por CSRF
app.post('/api/v1/protected', csrfProtection, (req, res) => {
  res.json({ message: 'POST con CSRF token válido' });
});

// Tus rutas aquí
app.get('/', (req, res) => {
  res.send('Backend is running and CORS OK');
});

app.get('/error', (req, res) => {
  throw new Error('Esto es un error de prueba');
});

// Handler para rutas no encontradas (después de todas las rutas)
app.use((req, res, next) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Route not found' });
});

// Middleware global de manejo de errores (al final)
import { errorHandler } from './middlewares/errorHandler';
app.use(errorHandler);

export default app; 