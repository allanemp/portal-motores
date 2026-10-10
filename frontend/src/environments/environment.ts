// URL base da API. Caminho relativo: o navegador chama o mesmo host/porta em que
// abriu o front, e quem encaminha para a API é o nginx (Docker) ou o proxy do
// `ng serve` (proxy.conf.json). Assim o front não depende de "localhost".
export const environment = {
  apiUrl: '/api',
};
