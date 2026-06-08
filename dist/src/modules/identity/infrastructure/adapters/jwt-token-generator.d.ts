import { JwtService } from '@nestjs/jwt';
import { ITokenGenerator, TokenPayload, TokenPair } from '../../application/ports/i-token-generator.port';
export declare class JwtTokenGenerator implements ITokenGenerator {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    generatePair(payload: TokenPayload): TokenPair;
    verify(token: string): TokenPayload;
}
