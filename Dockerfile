# Etapa 1: Build de dependencias
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
# RUN composer install --no-dev --prefer-dist --optimize-autoloader

# Etapa 2: Imagen PHP con Apache
FROM php:8.2-apache

# Instalar extensiones de PHP necesarias para Laravel
RUN apt-get update && apt-get install -y \
    git unzip zip libpq-dev libzip-dev libonig-dev \
    && docker-php-ext-install pdo pdo_pgsql zip

# Habilitar mod_rewrite
RUN a2enmod rewrite

# Copiar dependencias de Laravel
COPY --from=vendor /app/vendor /var/www/html/vendor

# Copiar aplicación Laravel al contenedor
COPY . /var/www/html

# Establecer permisos para Laravel
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Establecer directorio de trabajo
WORKDIR /var/www/html

# Configuración por defecto de Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public

# Actualizar el VirtualHost
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Puerto expuesto por Apache
EXPOSE 80

# Comando de inicio
CMD ["apache2-foreground"]