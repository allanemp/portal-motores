# Etapa 1: build de produção do Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# URL da API usada pelo navegador. O padrão é o mesmo do environment.ts;
# o docker-compose passa outro valor quando API_PORT é alterada no .env.
ARG API_URL=http://localhost:3000/api
RUN sed -i "s|apiUrl: '.*'|apiUrl: '${API_URL}'|" src/environments/environment.ts \
 && grep -q "apiUrl: '${API_URL}'" src/environments/environment.ts \
 && npx ng build --configuration production

# Etapa 2: só os arquivos estáticos servidos pelo nginx (imagem final pequena)
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
