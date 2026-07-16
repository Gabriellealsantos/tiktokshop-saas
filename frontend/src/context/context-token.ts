// Claims do access token (JWT) emitido pelo Authorization Server.
// Ver AuthorizationServerConfig#tokenCustomizer no back: uid, username, name, phone, authorities.

export type TokenPayload = {
  uid: string;
  username: string;
  name?: string;
  phone?: string;
  authorities: string[];
  sub?: string;
  exp: number;
  iat?: number;
};
