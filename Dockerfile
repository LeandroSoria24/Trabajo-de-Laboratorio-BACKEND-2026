FROM node:22-slim

# Instalar dependencias necesarias (OpenSSL para Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar dependencias y schema de Prisma antes del install
# (Requerido para el script "postinstall": "prisma generate")
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Puerto por defecto del backend
EXPOSE 3000

CMD ["npm", "start"]
