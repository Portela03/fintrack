import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { USER_REPOSITORY } from '../domain/repositories/i-user.repository';
import { PASSWORD_HASHER } from '../application/ports/i-password-hasher.port';
import { TOKEN_GENERATOR } from '../application/ports/i-token-generator.port';

import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { BcryptPasswordHasher } from './adapters/bcrypt-password-hasher';
import { JwtTokenGenerator } from './adapters/jwt-token-generator';
import { JwtStrategy } from './guards/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthController } from './http/auth.controller';

import { RegisterUserUseCase } from '../application/use-cases/register-user/register-user.use-case';
import { AuthenticateUserUseCase } from '../application/use-cases/authenticate-user/authenticate-user.use-case';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'default-secret',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_GENERATOR, useClass: JwtTokenGenerator },
    JwtStrategy,
    JwtAuthGuard,
    RegisterUserUseCase,
    AuthenticateUserUseCase,
  ],
  exports: [JwtAuthGuard, JwtModule, USER_REPOSITORY],
})
export class IdentityModule {}
