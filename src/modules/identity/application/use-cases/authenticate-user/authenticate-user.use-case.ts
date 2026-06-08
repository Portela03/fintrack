import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/i-user.repository';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '../../ports/i-password-hasher.port';
import {
  ITokenGenerator,
  TOKEN_GENERATOR,
  TokenPair,
} from '../../ports/i-token-generator.port';
import { AuthenticateUserDto } from '../../dtos/auth.dto';

@Injectable()
export class AuthenticateUserUseCase
  implements UseCase<AuthenticateUserDto, TokenPair>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: ITokenGenerator,
  ) {}

  async execute(input: AuthenticateUserDto): Promise<TokenPair> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.tokenGenerator.generatePair({
      sub: user.id,
      email: user.email,
    });
  }
}
