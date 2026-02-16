# Deploy en Render (Laravel + Inertia React) con Docker

## Recomendación
- Usar `render.yaml` incluido en este repo (Blueprint deploy con Docker).

## Variables de entorno mínimas (Render Dashboard)
- `APP_KEY` (obligatoria, generada una sola vez).
- `APP_URL` (URL pública de tu servicio en Render).
- `APP_ENV=production`
- `APP_DEBUG=false`
- `LOG_CHANNEL=stderr`
- `INERTIA_SSR_ENABLED=false`
- Variables de base de datos (`DB_*`) usando PostgreSQL de Render.

## Nota importante de Inertia
- Si `INERTIA_SSR_ENABLED=true` y no corres el servidor SSR, fallará al llegar a `Inertia::render(...)`.
- En Render estándar, dejar `INERTIA_SSR_ENABLED=false`.

## Arranque del contenedor
- El contenedor ejecuta:
  - `php artisan migrate --force`
  - `php artisan serve --host 0.0.0.0 --port ${PORT:-10000}`
