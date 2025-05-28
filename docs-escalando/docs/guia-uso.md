# 📖 Guía de Uso

Esta guía te ayudará a utilizar el backend de Escalando Fronteras, desde la autenticación hasta la gestión de contenido y usuarios.

## Autenticación

### Login

Para iniciar sesión, envía una solicitud POST a `/api/auth/login` con tu correo y contraseña. Ejemplo (usando curl):

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@email.com","password":"tu_password"}'
```

Si la autenticación es exitosa, recibirás un token JWT (en el campo “token”) y un token CSRF (en el header “X-Csrf-Token”). Guarda ambos para las solicitudes autenticadas.

### Protección de Rutas

Para acceder a rutas protegidas (por ejemplo, crear, actualizar o eliminar contenido), debes incluir en tus solicitudes el header “Authorization” con el valor “Bearer” seguido de tu token JWT, y el header “X-Csrf-Token” con el token CSRF. Ejemplo:

```bash
curl -X POST http://localhost:3000/api/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -H "X-Csrf-Token: TU_CSRF_TOKEN" \
  -d '{"title":"Nueva Noticia","content":"Contenido de la noticia","published":true}'
```

## Gestión de Contenido (CRUD)

### Noticias (News)

- **Crear Noticia (POST /api/news)**: Envía un objeto JSON con “title”, “content” y “published” (opcional).  
- **Obtener Noticias (GET /api/news)**: Consulta la lista de noticias (puedes usar parámetros de paginación).  
- **Actualizar Noticia (PUT /api/news/:id)**: Actualiza una noticia existente (envía “title”, “content” y “published” según sea necesario).  
- **Eliminar Noticia (DELETE /api/news/:id)**: Elimina la noticia con el id indicado.

### Eventos (Event)

- **Crear Evento (POST /api/events)**: Envía un objeto JSON con “title”, “description”, “date” (formato ISO) y “published” (opcional).  
- **Obtener Eventos (GET /api/events)**: Consulta la lista de eventos (puedes usar paginación).  
- **Actualizar Evento (PUT /api/events/:id)**: Actualiza un evento existente (envía “title”, “description”, “date” y “published” según sea necesario).  
- **Eliminar Evento (DELETE /api/events/:id)**: Elimina el evento con el id indicado.

### Testimonios (Testimonial)

- **Crear Testimonio (POST /api/testimonials)**: Envía un objeto JSON con “name”, “content” y “published” (opcional).  
- **Obtener Testimonios (GET /api/testimonials)**: Consulta la lista de testimonios (puedes usar paginación).  
- **Actualizar Testimonio (PUT /api/testimonials/:id)**: Actualiza un testimonio existente (envía “name”, “content” y “published” según sea necesario).  
- **Eliminar Testimonio (DELETE /api/testimonials/:id)**: Elimina el testimonio con el id indicado.

## Gestión de Usuarios (Solo Administradores)

- **Crear Usuario (POST /api/users)**: Envía un objeto JSON con “email”, “password” y “role” (por ejemplo, “admin” o “user”).  
- **Obtener Usuarios (GET /api/users)**: Consulta la lista de usuarios (puedes usar paginación).  
- **Actualizar Usuario (PUT /api/users/:id)**: Actualiza un usuario existente (envía “email”, “password” (opcional) y “role” según sea necesario).  
- **Eliminar Usuario (DELETE /api/users/:id)**: Elimina el usuario con el id indicado.

## Recuperación de Contraseña

- **Solicitar Recuperación (POST /api/auth/forgot-password)**: Envía tu correo electrónico. Si el correo existe, se enviará un enlace (por ejemplo, a través de Mailtrap) para restablecer tu contraseña.  
- **Restablecer Contraseña (POST /api/auth/reset-password)**: Envía el token (recibido por correo) y tu nueva contraseña.

---

¡Con esta guía ya puedes empezar a trabajar con el backend de Escalando Fronteras! Si necesitas más detalles o ejemplos, consulta la [referencia de la API](./api-reference.md). 