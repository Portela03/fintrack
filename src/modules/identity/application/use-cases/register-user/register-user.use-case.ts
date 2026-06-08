import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
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
import { RegisterUserDto } from '../../dtos/auth.dto';
import { InvalidEmailError } from '@shared/domain';

@Injectable()
export class RegisterUserUseCase
  implements UseCase<RegisterUserDto, TokenPair>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: ITokenGenerator,
  ) {}

  async execute(input: RegisterUserDto): Promise<TokenPair> {
    const emailOrError = Email.create(input.email);
    if (emailOrError.isLeft()) {
      throw emailOrError.value as InvalidEmailError;
    }

    const existing = await this.userRepository.findByEmail(
      emailOrError.value.value,
    );
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = User.create({
      email: emailOrError.value.value,
      name: input.name,
      passwordHash,
    });

    await this.userRepository.save(user);

    return this.tokenGenerator.generatePair({
      sub: user.id,
      email: user.email,
    });
  }
}
