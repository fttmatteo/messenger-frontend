# ETAPA 1: BUILD
FROM node:20-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Variables de entorno para el build (usando la red interna de Docker por defecto)
# Estas pueden sobreescribirse con --build-arg
ARG VITE_API_URL=http://localhost:8080
ARG VITE_GOOGLE_MAPS_API_KEY=
ARG VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY

# Compilar la aplicación
RUN npm run build

# ETAPA 2: RUN
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
