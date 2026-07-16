// Geração dos parâmetros PKCE (RFC 7636) e do state anti-CSRF do fluxo Authorization Code.
// O code_verifier e o state ficam no sessionStorage entre o redirect para o back e o retorno em /authorized.

const VERIFIER_KEY = "com.venyx.tiktokshop/pkce_verifier";
const STATE_KEY = "com.venyx.tiktokshop/oauth_state";

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function randomString(length = 64): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64UrlEncode(array).slice(0, length);
}

export function generateCodeVerifier(): string {
  return randomString(64);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

export function generateState(): string {
  return randomString(32);
}

export const saveCodeVerifier = (verifier: string) =>
  sessionStorage.setItem(VERIFIER_KEY, verifier);
export const getCodeVerifier = () => sessionStorage.getItem(VERIFIER_KEY);
export const removeCodeVerifier = () => sessionStorage.removeItem(VERIFIER_KEY);

export const saveState = (state: string) => sessionStorage.setItem(STATE_KEY, state);
export const getState = () => sessionStorage.getItem(STATE_KEY);
export const removeState = () => sessionStorage.removeItem(STATE_KEY);
