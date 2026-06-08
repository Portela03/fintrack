import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ITokenGenerator,
  TokenPayload,
  TokenPair,
} from '../../application/ports/i-token-generator.port';

@Injectable()
export class JwtTokenGenerator implements ITokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  generatePair(payload: TokenPayload): TokenPair {
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }

  verify(token: string): TokenPayload {
    return this.jwtService.verify<TokenPayload>(token);
  }
}
