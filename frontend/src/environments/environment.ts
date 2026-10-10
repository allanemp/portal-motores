// URL base da API. O navegador acessa a API diretamente pela porta publicada no host.
// No build Docker, este valor é substituído pelo argumento API_URL (ver frontend/Dockerfile),
// que o docker-compose monta a partir de API_PORT. Sem .env, fica exatamente este.
export const environment = {
  apiUrl: 'http://localhost:3000/api',
};
