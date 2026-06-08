import { AggregateRoot } from "../../../../shared/domain";
interface UserProps {
    email: string;
    name: string;
    passwordHash: string;
    createdAt: Date;
}
export declare class User extends AggregateRoot<UserProps> {
    get email(): string;
    get name(): string;
    get passwordHash(): string;
    get createdAt(): Date;
    static create(props: {
        email: string;
        name: string;
        passwordHash: string;
    }, id?: string): User;
    static reconstitute(props: UserProps & {
        id: string;
    }): User;
}
export {};
