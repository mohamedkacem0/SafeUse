FROM php:8.2-apache

RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

RUN a2enmod rewrite

COPY backend/api/ /var/www/html/

RUN docker-php-ext-install pdo pdo_mysql

# ✅ Asegurar permisos para carpeta de subidas
RUN mkdir -p /var/www/html/uploads/sustancias && \
    chown -R www-data:www-data /var/www/html/uploads && \
    chmod -R 755 /var/www/html/uploads

RUN ls -lR /var/www/html/

EXPOSE 80
