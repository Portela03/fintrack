"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const i_user_repository_1 = require("../../../domain/repositories/i-user.repository");
const i_password_hasher_port_1 = require("../../ports/i-password-hasher.port");
const i_token_generator_port_1 = require("../../ports/i-token-generator.port");
let AuthenticateUserUseCase = class AuthenticateUserUseCase {
    userRepository;
    passwordHasher;
    tokenGenerator;
    constructor(userRepository, passwordHasher, tokenGenerator) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenGenerator = tokenGenerator;
    }
    async execute(input) {
        const user = await this.userRepository.findByEmail(input.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordValid = await this.passwordHasher.compare(input.password, user.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.tokenGenerator.generatePair({
            sub: user.id,
            email: user.email,
        });
    }
};
exports.AuthenticateUserUseCase = AuthenticateUserUseCase;
exports.AuthenticateUserUseCase = AuthenticateUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(i_user_repository_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(i_password_hasher_port_1.PASSWORD_HASHER)),
    __param(2, (0, common_1.Inject)(i_token_generator_port_1.TOKEN_GENERATOR)),
    __metadata("design:paramtypes", [Object, Object, Object])
], AuthenticateUserUseCase);
//# sourceMappingURL=authenticate-user.use-case.js.map