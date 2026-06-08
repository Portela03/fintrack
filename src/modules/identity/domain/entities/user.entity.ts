import { AggregateRoot } from '@shared/domain';

interface UserProps {
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

export class User extends AggregateRoot<UserProps> {
  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  static create(
    props: { email: string; name: string; passwordHash: string },
    id?: string,
  ): User {
    return new User(
      { ...props, createdAt: new Date() },
      id,
    );
  }

  static reconstitute(
    props: UserProps & { id: string },
  ): User {
    return new User(
      {
        email: props.email,
        name: props.name,
        passwordHash: props.passwordHash,
        createdAt: props.createdAt,
      },
      props.id,
    );
  }
}
