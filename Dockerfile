# Używamy oficjalnego obrazu PHP 8.1 z Apache
FROM php:8.1-apache

# Instalacja cURL i włączenie rozszerzenia
RUN apt-get update && apt-get install -y \
    curl \
    && docker-php-ext-install curl

# Włączenie modułu rewrite Apache
RUN a2enmod rewrite

# Skopiowanie plików aplikacji do katalogu Apache
COPY ./app /var/www/html

# Ustawienie katalogu roboczego
WORKDIR /var/www/html

# Ustawienie praw do plików
RUN chown -R www-data:www-data /var/www/html

# Eksponowanie portu HTTP (portu Apache)
EXPOSE 80
