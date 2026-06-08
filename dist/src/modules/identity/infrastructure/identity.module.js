"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const i_user_repository_1 = require("../domain/repositories/i-user.repository");
const i_password_hasher_port_1 = require("../application/ports/i-password-hasher.port");
const i_token_generator_port_1 = require("../application/ports/i-token-generator.port");
const prisma_user_repository_1 = require("./repositories/prisma-user.repository");
const bcrypt_password_hasher_1 = require("./adapters/bcrypt-password-hasher");
const jwt_token_generator_1 = require("./adapters/jwt-token-generator");
const jwt_strategy_1 = require("./guards/jwt.strategy");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const auth_controller_1 = require("./http/auth.controller");
const register_user_use_case_1 = require("../application/use-cases/register-user/register-user.use-case");
const authenticate_user_use_case_1 = require("../application/use-cases/authenticate-user/authenticate-user.use-case");
let IdentityModule = class IdentityModule {
};
exports.IdentityModule = IdentityModule;
exports.IdentityModule = IdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET') ?? 'default-secret',
                    signOptions: { expiresIn: '7d' },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            { provide: i_user_repository_1.USER_REPOSITORY, useClass: prisma_user_repository_1.PrismaUserRepository },
            { provide: i_password_hasher_port_1.PASSWORD_HASHER, useClass: bcrypt_password_hasher_1.BcryptPasswordHasher },
            { provide: i_token_generator_port_1.TOKEN_GENERATOR, useClass: jwt_token_generator_1.JwtTokenGenerator },
            jwt_strategy_1.JwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            register_user_use_case_1.RegisterUserUseCase,
            authenticate_user_use_case_1.AuthenticateUserUseCase,
        ],
        exports: [jwt_auth_guard_1.JwtAuthGuard, jwt_1.JwtModule, i_user_repository_1.USER_REPOSITORY],
    })
], IdentityModule);
//# sourceMappingURL=identity.module.js.map