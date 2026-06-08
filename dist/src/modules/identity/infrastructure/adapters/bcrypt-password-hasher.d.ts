import { IPasswordHasher } from '../../application/ports/i-password-hasher.port';
export declare class BcryptPasswordHasher implements IPasswordHasher {
    private readonly SALT_ROUNDS;
    hash(password: string): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
}
