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

/** Limpa a sessão local e revoga a sessão no servidor. */
export const logout = async () => {
  const authData = getAuthData();

  // 1. Revogar o Token no Authorization Server
  if (authData?.access_token) {
    try {
      const params = QueryString.stringify({
        token: authData.access_token,
        client_id: CLIENT_ID,
      });

      await axios.post(`${BASE_URL}/oauth2/revoke`, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    } catch (e) {
      console.error("Erro ao revogar o token", e);
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
  history.replace("/login");
};

// REQUEST INTERCEPTOR
axios.interceptors.request.use(
  (config) => config,
  (error: unknown) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR — refresh automático em 401.
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
            const response = await requestRefresh(authData.refresh_token);
            saveAuthData(response.data);
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] =
                "Bearer " + response.data.access_token;
            }
            return axios.request(originalRequest);
          } catch {
            removeAuthData();
            history.replace("/login");
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
