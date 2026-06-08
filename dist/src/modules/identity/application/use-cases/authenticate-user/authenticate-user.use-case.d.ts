import { UseCase } from "../../../../../shared/application/use-case.interface";
import { IUserRepository } from '../../../domain/repositories/i-user.repository';
import { IPasswordHasher } from '../../ports/i-password-hasher.port';
import { ITokenGenerator, TokenPair } from '../../ports/i-token-generator.port';
import { AuthenticateUserDto } from '../../dtos/auth.dto';
export declare class AuthenticateUserUseCase implements UseCase<AuthenticateUserDto, TokenPair> {
    private readonly userRepository;
    private readonly passwordHasher;
    private readonly tokenGenerator;
    constructor(userRepository: IUserRepository, passwordHasher: IPasswordHasher, tokenGenerator: ITokenGenerator);
    execute(input: AuthenticateUserDto): Promise<TokenPair>;
}
