FROM node:20-alpine

WORKDIR /app

# Copiar todos os arquivos necessários
COPY . .

# Instalar dependências
RUN npm ci

# Gerar cliente Prisma
RUN npx prisma generate

# Build
RUN npm run build

EXPOSE 3000

# Command para rodar migrations e iniciar
CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]