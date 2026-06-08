export interface TokenPayload {
  sub: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenGenerator {
  generatePair(payload: TokenPayload): TokenPair;
  verify(token: string): TokenPayload;
}

export const TOKEN_GENERATOR = Symbol('ITokenGenerator');
