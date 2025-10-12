export interface JwtHeader {
  alg: 'HS256' | 'RS256' | string;
  typ: string;
}

export interface JwtPayload {
  [key: string]: any;
  iss?: string;
  sub?: string;
  aud?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  raw: {
    header: string;
    payload: string;
    token: string;
  };
}

export interface VerificationResult {
  isValid: boolean;
  reason: string;
}

export interface DecoderData {
    token: string;
    key: string;
    audience?: string;
    issuer?: string;
}
