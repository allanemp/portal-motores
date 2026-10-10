// Configuração da CLI do Prisma (prisma generate / prisma db pull).
// A URL só é necessária para comandos que acessam o banco, como `db pull`;
// a aplicação em si conecta pelo driver adapter (ver PrismaDatabase.js).
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
