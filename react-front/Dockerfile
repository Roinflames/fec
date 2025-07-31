FROM node:20-alpine AS builder
WORKDIR /app

# Copia los archivos de lock y package.json (usa * para que copie el que exista)
COPY ./package.json ./package-lock.json* ./pnpm-lock.yaml* ./

# Instala dependencias con npm (o pnpm si usas ese gestor)
RUN npm install

# Copia todo el código fuente
COPY . .

COPY .env ./

# Ejecuta build de Vite (generará la carpeta dist)
RUN npm run build

# Etapa para servir con nginx
FROM nginx:alpine

# Copia la carpeta dist generada en la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80 para Nginx
EXPOSE 80

# Comando para iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
