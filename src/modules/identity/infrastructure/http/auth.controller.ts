import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/register-user/register-user.use-case';
import { AuthenticateUserUseCase } from '../../application/use-cases/authenticate-user/authenticate-user.use-case';
import { RegisterUserDto, AuthenticateUserDto } from '../../application/dtos/auth.dto';

@ApiTags('1. Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly authenticateUser: AuthenticateUserUseCase,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description: 'Cria uma nova conta de usuário e retorna tokens de acesso (access + refresh). O email deve ser único no sistema.',
  })
  @ApiBody({ type: RegisterUserDto })
  @ApiCreatedResponse({ description: 'Usuário criado com sucesso. Retorna `accessToken` e `refreshToken`.' })
  @ApiBadRequestResponse({ description: 'Dados inválidos (email mal formatado, senha curta etc.)' })
  @ApiConflictResponse({ description: 'Email já cadastrado no sistema.' })
  async register(@Body() dto: RegisterUserDto) {
    return this.registerUser.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autenticar usuário',
    description: 'Autentica com email e senha. Retorna `accessToken` (7 dias) e `refreshToken` (30 dias). Use o `accessToken` como Bearer Token nos demais endpoints.',
  })
  @ApiBody({ type: AuthenticateUserDto })
  @ApiOkResponse({ description: 'Login bem-sucedido. Retorna `accessToken` e `refreshToken`.' })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas.' })
  async login(@Body() dto: AuthenticateUserDto) {
    return this.authenticateUser.execute(dto);
  }
}
