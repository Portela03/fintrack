import { UseCase } from "../../../../../shared/application/use-case.interface";
import { IUserRepository } from '../../../domain/repositories/i-user.repository';
import { IPasswordHasher } from '../../ports/i-password-hasher.port';
import { ITokenGenerator, TokenPair } from '../../ports/i-token-generator.port';
import { RegisterUserDto } from '../../dtos/auth.dto';
export declare class RegisterUserUseCase implements UseCase<RegisterUserDto, TokenPair> {
    private readonly userRepository;
    private readonly passwordHasher;
    private readonly tokenGenerator;
    constructor(userRepository: IUserRepository, passwordHasher: IPasswordHasher, tokenGenerator: ITokenGenerator);
    execute(input: RegisterUserDto): Promise<TokenPair>;
}
