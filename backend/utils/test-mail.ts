import { sendMail } from './mailer';

async function main() {
  try {
    await sendMail({
      to: 'admin@escalando.org', // Usa el correo de tu inbox de Mailtrap
      subject: 'Prueba de correo desde Escalando Fronteras',
      html: '<h1>¡Funciona!</h1><p>Este es un correo de prueba.</p>',
    });
    console.log('Correo enviado correctamente');
  } catch (err) {
    console.error('Error enviando correo:', err);
  }
}

main();