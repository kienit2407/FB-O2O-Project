import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  full_name: string;

  @IsEnum(['customer', 'driver', 'merchant', 'merchant_staff', 'admin'])
  role: 'customer' | 'driver' | 'merchant' | 'merchant_staff' | 'admin';

  @IsOptional()
  avatar?: string;

  @IsOptional()
  @IsString()
  password_hash?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString({ each: true })
  auth_methods?: string[];
}
