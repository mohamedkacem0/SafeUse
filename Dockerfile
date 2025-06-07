# Use an official PHP image with Apache
FROM php:8.2-apache

# Enable mod_rewrite if needed
RUN a2enmod rewrite

# Copy the whole backend/api directory (including app, public, etc.)
COPY backend/api/ /var/www/html/

# Set working directory
WORKDIR /var/www/html/public

# Expose port 80
EXPOSE 80