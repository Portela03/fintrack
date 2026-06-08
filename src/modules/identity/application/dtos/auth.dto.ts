import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'MinhaSenh@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class AuthenticateUserDto {
  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MinhaSenh@123' })
  @IsString()
  password!: string;
}
