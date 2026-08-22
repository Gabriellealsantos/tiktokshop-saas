import axios, { type AxiosRequestConfig } from "axios";
import QueryString from "qs";

import { history } from "./history";
import {
  getAuthData,
  removeAuthData,
  saveAuthData,
} from "../localStorage/access-token-repository";
import { BASE_URL, CLIENT_ID, REDIRECT_URI, OAUTH_SCOPE } from "./system";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
  getCodeVerifier,
  removeCodeVerifier,
  removeState,
  saveCodeVerifier,
  saveState,
} from "./pkce";

// ─────────────────────────────────────────────────────────────────────────────
// OAuth2 Authorization Code + PKCE (client público — sem client-secret no front).
// Fluxo: loginRedirect() → back /oauth2/authorize → back /login → volta em
// REDIRECT_URI (/authorized) com ?code → exchangeCodeForToken() troca por tokens.
// ─────────────────────────────────────────────────────────────────────────────

/** Monta a URL do /oauth2/authorize com PKCE e redireciona o browser para o back. */
export const loginRedirect = async () => {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  saveCodeVerifier(verifier);
  saveState(state);

  const params = QueryString.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: OAUTH_SCOPE,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  window.location.assign(`${BASE_URL}/oauth2/authorize?${params}`);
};

/** Troca o authorization code (retornado em /authorized) pelos tokens. */
export const exchangeCodeForToken = (code: string) => {
  const verifier = getCodeVerifier();

  const data = QueryString.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: verifier,
  });

  return axios({
    method: "POST",
    baseURL: BASE_URL,
    url: "/oauth2/token",
    data,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

/** Renova a sessão usando o refresh_token (grant refresh_token, client público). */
export const requestRefresh = (refreshToken: string) => {
  const data = QueryString.stringify({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
  });

  return axios({
    method: "POST",
    baseURL: BASE_URL,
    url: "/oauth2/token",
    data,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

/** Requisição autenticada para a API. Use withCredentials para anexar o Bearer. */
export const requestBackend = (config: AxiosRequestConfig) => {
  const headers = config.withCredentials
    ? {
      ...config.headers,
      Authorization: "Bearer " + getAuthData().access_token,
    }
    : config.headers;

  return axios({ ...config, baseURL: BASE_URL, headers });
};

/**
 * Limpa a sessão local e revoga a sessão no servidor.
 * `redirectTo: null` deixa a navegação a cargo de quem chamou — necessário para
 * fluxos que precisam cair numa tela específica sem competir com o /login.
 */
export const logout = async (redirectTo: string | null = "/login") => {
  const authData = getAuthData();

  // 1. Encerrar a autorização OAuth2 no servidor.
  // Não usa /oauth2/revoke: o client é público (sem secret no browser) e aquele
  // endpoint exige autenticação de client, então respondia 302 pro /login sem
  // revogar nada — o que deixava a sessão "ativa" no banco por até 15 min e
  // travava o próximo login quando a sessão única está ligada.
  if (authData?.access_token) {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, null, {
        headers: {
          Authorization: "Bearer " + authData.access_token,
        },
      });
    } catch (e) {
      console.error("Erro ao encerrar a sessão no servidor", e);
    }
  }

  // 2. Encerrar a Sessão de Cookies (JSESSIONID) no /logout
  try {
    await axios.post(`${BASE_URL}/logout`, null, {
      withCredentials: true,
    });
  } catch (e) {
    console.error("Erro ao destruir a sessão JSESSIONID", e);
  }

  // 3. Limpeza local e redirecionamento
  removeAuthData();
  removeCodeVerifier();
  removeState();
  if (redirectTo) {
    history.replace(redirectTo);
  }
};

// REQUEST INTERCEPTOR
axios.interceptors.request.use(
  (config) => config,
  (error: unknown) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR — refresh automático em 401.
// Fila de refresh: quando múltiplas requisições recebem 401 ao mesmo tempo
// (ex: reload da página), apenas a primeira faz o refresh e as demais esperam
// o resultado, evitando consumir um refresh_token já rotacionado.
let refreshPromise: Promise<string> | null = null;

function runRefresh(refreshToken: string): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = requestRefresh(refreshToken)
      .then((response) => {
        saveAuthData(response.data);
        return response.data.access_token as string;
      })
      .catch((refreshError) => {
        removeAuthData();
        history.replace("/login");
        throw refreshError;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

const EXPIRY_SKEW_MS = 60_000;

function expiresAt(token: string): number {
  try {
    const normalized = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(normalized));
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

/** Devolve um token válido por pelo menos 60s, renovando pela mesma fila do interceptor. */
export const ensureFreshToken = async (): Promise<string> => {
  const authData = getAuthData();
  const token = authData.access_token ?? "";

  if (token && expiresAt(token) - Date.now() > EXPIRY_SKEW_MS) {
    return token;
  }
  if (!authData.refresh_token) {
    return token;
  }
  return runRefresh(authData.refresh_token);
};

axios.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Não tenta refresh no próprio endpoint de token.
    const isTokenCall = originalRequest?.url?.includes("/oauth2/token");

    if (error.response?.status === 401 && !isTokenCall) {
      // Conta bloqueada — desloga imediatamente.
      if ((error.response.data as { error?: string })?.error === "Account Locked") {
        removeAuthData();
        history.replace("/login");
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;
        const authData = getAuthData();

        if (authData.refresh_token) {
          try {
            const newAccessToken = await runRefresh(authData.refresh_token);
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] =
                "Bearer " + newAccessToken;
            }
            return axios.request(originalRequest);
          } catch {
            // Refresh falhou — já tratado acima (removeAuthData + redirect).
            return Promise.reject(error);
          }
        } else {
          removeAuthData();
          history.replace("/login");
        }
      }
    }

    return Promise.reject(error);
  },
);