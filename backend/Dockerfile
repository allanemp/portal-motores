FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Gera o Prisma Client a partir do schema (precisa da CLI, que é devDependency)
# e depois remove as dependências de desenvolvimento.
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate && npm prune --omit=dev

COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000

# Roda sem privilégios de root (usuário "node" já existe na imagem oficial).
USER node
CMD ["node", "src/server.js"]
