# Use an official PHP image with Apache
FROM php:8.2-apache

# Set Apache DocumentRoot to /var/www/html/public
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# Enable mod_rewrite if needed
RUN a2enmod rewrite

# Copy the whole backend/api directory (including app, public, etc.)
COPY backend/api/ /var/www/html/

# Install PDO and PDO MySQL extensions
RUN docker-php-ext-install pdo pdo_mysql

# List the contents of the /var/www/html directory recursively
RUN ls -lR /var/www/html/

# Expose port 80
EXPOSE 80