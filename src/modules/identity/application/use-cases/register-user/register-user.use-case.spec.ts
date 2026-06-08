import { RegisterUserUseCase } from './register-user.use-case';
import { IUserRepository } from '../../../domain/repositories/i-user.repository';
import { IPasswordHasher } from '../../ports/i-password-hasher.port';
import { ITokenGenerator } from '../../ports/i-token-generator.port';
import { ConflictException } from '@nestjs/common';
import { InvalidEmailError } from '@shared/domain';

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

describe('RegisterUserUseCase', () => {
  let sut: RegisterUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new RegisterUserUseCase(
      mockUserRepo,
      mockPasswordHasher,
      mockTokenGenerator,
    );
    mockPasswordHasher.hash.mockResolvedValue('hashed_password');
    mockTokenGenerator.generatePair.mockReturnValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });

  it('should register a new user and return tokens', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    const result = await sut.execute({
      email: 'joao@email.com',
      name: 'João Silva',
      password: 'MinhaSenh@123',
    });

    expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
  });

  it('should throw ConflictException if email already exists', async () => {
    const { User } = await import('../../../domain/entities/user.entity');
    mockUserRepo.findByEmail.mockResolvedValue(
      User.create({ email: 'joao@email.com', name: 'João', passwordHash: 'h' }),
    );

    await expect(
      sut.execute({
        email: 'joao@email.com',
        name: 'João Silva',
        password: 'MinhaSenh@123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw InvalidEmailError for invalid email', async () => {
    await expect(
      sut.execute({
        email: 'not-an-email',
        name: 'João Silva',
        password: 'MinhaSenh@123',
      }),
    ).rejects.toBeInstanceOf(InvalidEmailError);
  });
});
