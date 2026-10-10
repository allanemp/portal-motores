// Toda configuração vem de variáveis de ambiente.
// Os valores padrão aqui são apenas para dados NÃO sensíveis;
// a senha do banco nunca tem valor fixo no código.
const env = {
  port: Number(process.env.API_PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};

module.exports = env;
