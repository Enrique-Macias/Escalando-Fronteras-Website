import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { sendMail } from '../../utils/mailer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Email o contraseña incorrectos' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Email o contraseña incorrectos' });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Email o contraseña incorrectos' });
    return;
  }
  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
  // CSRF token: usa req.csrfToken si tienes csurf, si no, genera uno simple
  const csrfToken = req.csrfToken ? req.csrfToken() : '';
  res.cookie('csrf-token', csrfToken, { httpOnly: false, sameSite: 'strict' });
  res.status(200).json({ token });
  return;
} 

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  // Siempre responde 200 para no revelar si el email existe
  if (!user) {
    // Por seguridad, responde 200 aunque el usuario no exista
    res.status(200).json({ message: 'Si el email existe, se ha enviado un enlace de recuperación.' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, purpose: 'password_reset' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
  const resetUrl = `https://tusitio.com/reset?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'Recupera tu contraseña',
    html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
           <a href="${resetUrl}">${resetUrl}</a>`,
  });

  // Log simple (puedes guardar en BD si quieres)
  console.log({
    userId: user.id,
    timestamp: new Date().toISOString(),
    email: user.email,
    action: 'password_reset_email_sent',
  });

  res.status(200).json({ message: 'Si el email existe, se ha enviado un enlace de recuperación.' });
  return;
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    res.status(400).json({ code: 'INVALID_TOKEN', message: 'Token o nueva contraseña faltante' });
    return;
  }

  try {
    // 1. Verifica si el token ya fue usado
    const alreadyUsed = await prisma.usedToken.findUnique({ where: { token } });
    if (alreadyUsed) {
      res.status(400).json({ code: 'INVALID_TOKEN', message: 'Token ya fue utilizado' });
      return;
    }

    // 2. Verifica el token y el propósito
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (payload.purpose !== 'password_reset') {
      res.status(400).json({ code: 'INVALID_TOKEN', message: 'Token inválido' });
      return;
    }

    // 3. Hashea la nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 4. Actualiza el usuario
    await prisma.user.update({
      where: { id: payload.userId },
      data: { passwordHash },
    });

    // 5. Guarda el token como usado
    await prisma.usedToken.create({ data: { token } });

    res.status(200).json({ message: 'Contraseña actualizada' });
    return;
  } catch (err) {
    res.status(400).json({ code: 'INVALID_TOKEN', message: 'Token inválido o expirado' });
    return;
  }
}