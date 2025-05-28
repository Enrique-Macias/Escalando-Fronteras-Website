# 🛠️ Instalación

Sigue estos pasos para instalar y configurar el proyecto Escalando Fronteras en tu entorno local.

## 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/Escalando-Fronteras-Website.git
cd Escalando-Fronteras-Website
```

## 2. Configura el backend

```bash
cd backend
cp .env.example .env # Crea tu archivo de variables de entorno
npm install
```

Edita el archivo `.env` con tus credenciales de base de datos PostgreSQL y otras variables necesarias (JWT_SECRET, SMTP, etc.).

Para desarrollo local puedes usar Railway, Supabase o una instancia local de PostgreSQL.

## 3. Ejecuta las migraciones de la base de datos

```bash
npx prisma migrate dev --name init
```

## 4. Inicia el backend en modo desarrollo

```bash
npm run dev
```

El backend estará disponible en [http://localhost:3000](http://localhost:3000)

## 5. Configura el frontend

```bash
cd ../frontend
# Si usas dependencias, instálalas (opcional)
# npm install
```

Abre el archivo `index.html` en tu navegador o sirve la carpeta con un servidor estático.

## 6. Documentación

Desde la raíz del proyecto:

```bash
cd ../docs-escalando
npm install
npm run start
```

La documentación estará disponible en [http://localhost:3000](http://localhost:3000)

---

¿Listo? Continúa con la [guía de uso](./guia-uso.md) para aprender a trabajar con el proyecto. 