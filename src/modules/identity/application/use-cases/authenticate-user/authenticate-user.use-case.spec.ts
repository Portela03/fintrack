import { AuthenticateUserUseCase } from './authenticate-user.use-case';
import { IUserRepository } from '../../../domain/repositories/i-user.repository';
import { IPasswordHasher } from '../../ports/i-password-hasher.port';
import { ITokenGenerator } from '../../ports/i-token-generator.port';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';

const mockUser = User.create({
  email: 'joao@email.com',
  name: 'João',
  passwordHash: 'hash',
});

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockPasswordHasher: jest.Mocked<IPasswordHasher> = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockTokenGenerator: jest.Mocked<ITokenGenerator> = {
  generatePair: jest.fn(),
  verify: jest.fn(),
};

describe('AuthenticateUserUseCase', () => {
  let sut: AuthenticateUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new AuthenticateUserUseCase(
      mockUserRepo,
      mockPasswordHasher,
      mockTokenGenerator,
    );
  });

  it('should authenticate and return tokens', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    mockPasswordHasher.compare.mockResolvedValue(true);
    mockTokenGenerator.generatePair.mockReturnValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    const result = await sut.execute({
      email: 'joao@email.com',
      password: 'MinhaSenh@123',
    });

    expect(result.accessToken).toBe('access');
  });

  it('should throw UnauthorizedException for unknown email', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      sut.execute({ email: 'x@x.com', password: '12345678' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for wrong password', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    mockPasswordHasher.compare.mockResolvedValue(false);

    await expect(
      sut.execute({ email: 'joao@email.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
