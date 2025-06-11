FROM php:8.2-apache

# Cambiar el DocumentRoot a /public
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# Habilitar mod_rewrite para URLs amigables
RUN a2enmod rewrite

# Instalar extensiones necesarias de PHP
RUN docker-php-ext-install pdo pdo_mysql

# Copiar el backend (código fuente)
COPY backend/api/ /var/www/html/

# Crear directorio de subidas y asignar permisos
RUN mkdir -p /var/www/html/uploads/sustancias && \
    chown -R www-data:www-data /var/www/html/uploads && \
    chmod -R 775 /var/www/html/uploads

EXPOSE 80

# Iniciar Apache en primer plano
CMD ["apache2-foreground"]
