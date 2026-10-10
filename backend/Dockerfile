FROM node:22-alpine

WORKDIR /app

# Instala só as dependências de produção, aproveitando o cache de camadas.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000

# Roda sem privilégios de root (usuário "node" já existe na imagem oficial).
USER node
CMD ["node", "src/server.js"]
