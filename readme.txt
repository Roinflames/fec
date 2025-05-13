🐧 Postgresql en MAC
brew services start postgresql@15  - iniciar el postgresql

🐧 Postgres en Windows
where php

;extension=pgsql
;extension=pdo_pgsql

🐧 JWT
php artisan jwt:secret
jwt-auth secret [doNDKcYZ7nq42ozSk0UAwlV7KCxcLAFuppfSo5ZmVSxeMuFrYh7R0N1WHXfGA8Fl] set successfully.

🐧 Deploy
✅ 1. Instala las dependencias
composer update
composer fund
composer install

✅ 2. Copia el archivo .env

✅ 3. Genera la clave de la aplicación
php artisan key:generate

✅ 4. Configura el archivo .env

✅ 5. Ejecuta las migraciones (si aplica)
php artisan migrate
php artisan db:seed

✅ 6. Levanta el servidor local
php artisan serve

✅ 7. Instala las dependencias front-end (si usa Vue, React, etc.)
npm install
npm run dev

php artisan serve

🐧 Revisar Migraciones
php artisan migrate:status

