import type { TokenPayload } from "../context/context-token";
import { getAuthData } from "../localStorage/access-token-repository";

// Decodifica o payload (parte central) de um JWT sem validar assinatura — só para
// ler claims no client (a validação real é do Resource Server no back).
function decodeJwtPayload(token: string): TokenPayload | undefined {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      window
        .atob(normalized)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json) as TokenPayload;
  } catch {
    return undefined;
  }
}

export function getAccessTokenPayload(): TokenPayload | undefined {
  const { access_token } = getAuthData();
  if (!access_token) return undefined;
  return decodeJwtPayload(access_token);
}

export function isAuthenticated(): boolean {
  const payload = getAccessTokenPayload();
  if (!payload) return false;
  // exp em segundos; considera válido se ainda não expirou.
  return Date.now() < payload.exp * 1000;
}
