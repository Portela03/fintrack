import { RegisterUserUseCase } from '../../application/use-cases/register-user/register-user.use-case';
import { AuthenticateUserUseCase } from '../../application/use-cases/authenticate-user/authenticate-user.use-case';
import { RegisterUserDto, AuthenticateUserDto } from '../../application/dtos/auth.dto';
export declare class AuthController {
    private readonly registerUser;
    private readonly authenticateUser;
    constructor(registerUser: RegisterUserUseCase, authenticateUser: AuthenticateUserUseCase);
    register(dto: RegisterUserDto): Promise<import("../../application/ports/i-token-generator.port").TokenPair>;
    login(dto: AuthenticateUserDto): Promise<import("../../application/ports/i-token-generator.port").TokenPair>;
}
