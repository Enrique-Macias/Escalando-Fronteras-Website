import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // Mailtrap no usa SSL por defecto
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string}) {
    return transporter.sendMail({
        from: '"Escalando Fronteras" <no-reply@climbingborders.org>',
        to,
        subject,
        html,
    });
}