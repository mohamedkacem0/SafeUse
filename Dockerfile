# Use an official PHP image with Apache
FROM php:8.2-apache

# Enable mod_rewrite if needed
RUN a2enmod rewrite

# Copy your code to the Apache document root
COPY backend/api/public/ /var/www/html/

# Set working directory
WORKDIR /var/www/html

# Expose port 80
EXPOSE 80