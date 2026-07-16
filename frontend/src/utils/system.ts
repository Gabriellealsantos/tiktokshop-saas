// Constantes de ambiente da aplicação. Espelha o padrão do projeto controlededividas,
// adaptado para OAuth2 Authorization Code + PKCE (client público, sem client-secret no front).

export const TOKEN_KEY = "com.venyx.tiktokshop/Token";

export const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080";

export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? "myclientid";

export const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN ?? "http://localhost:5173";

export const REDIRECT_URI =
  import.meta.env.VITE_OAUTH_REDIRECT_URI ?? `${APP_DOMAIN}/authorized`;

export const OAUTH_SCOPE =
  import.meta.env.VITE_OAUTH_SCOPE ?? "openid profile read write offline_access";
