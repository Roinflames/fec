✅ 2. Cambios básicos en tu proyecto Laravel
2.1. Procfile para Render
php artisan serve --host 0.0.0.0 --port 8000
 
2.2. Asegúrate de tener SQLite o PostgreSQL en .env
DB_CONNECTION=sqlite
DB_DATABASE=/etc/database/database.sqlite

DB_CONNECTION=pgsql
DB_HOST=YOUR_DB_HOST
DB_PORT=5432
DB_DATABASE=YOUR_DB_NAME
DB_USERNAME=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASS
 
3.1. Ir a: https://dashboard.render.com
build command:
 composer install --no-dev

start command:
php artisan serve --host 0.0.0.0 --port 8000

3.2. Genera APP_KEY automáticamente
build command:
composer install --no-dev && php artisan key:generate

✅ 4. Habilita CORS para tu frontend en Vercel
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['https://tudominio.vercel.app'],

✅ 5. Verifica el deploy y prueba desde el frontend
