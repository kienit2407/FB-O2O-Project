import { IsEmail, IsString, MinLength, IsOptional, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class MerchantRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  full_name: string;

  @IsString()
  phone: string;
}

export class MerchantLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class MerchantBasicInfoDto {
  @IsString()
  store_name: string;

  @IsString()
  store_phone: string;

  @IsString()
  store_address: string;

  @IsString()
  store_category: string;

  @IsOptional()
  @IsString()
  description?: string;
}
