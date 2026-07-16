import { TOKEN_KEY } from "../utils/system";

// Resposta do endpoint /oauth2/token (access + refresh token).
export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
};

export const saveAuthData = (loginResponse: LoginResponse) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(loginResponse));
};

export const getAuthData = (): LoginResponse => {
  const raw = localStorage.getItem(TOKEN_KEY) ?? "{}";
  return JSON.parse(raw) as LoginResponse;
};

export const removeAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
};
