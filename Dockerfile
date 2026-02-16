FROM php:8.2-cli

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    zip \
    libpq-dev \
    libzip-dev \
    libonig-dev \
    ca-certificates \
    gnupg \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_MEMORY_LIMIT=-1

RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-progress \
    --no-interaction \
    --optimize-autoloader \
    --no-scripts
RUN php artisan package:discover --ansi
RUN npm ci
RUN npm run build

RUN chmod -R 775 storage bootstrap/cache

EXPOSE 10000

CMD ["sh", "-lc", "if [ \"${RUN_MIGRATIONS_ON_BOOT:-false}\" = \"true\" ]; then for i in 1 2 3; do php artisan migrate --force && break; echo \"migrate intento $i fallo, reintentando...\"; sleep 5; done; fi; php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]
