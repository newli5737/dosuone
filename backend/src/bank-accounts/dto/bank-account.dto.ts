import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBankAccountDto {
  @IsString()
  @MinLength(2)
  bank_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  bank_code: string;

  @IsString()
  @MinLength(4)
  account_number: string;

  @IsString()
  @MinLength(2)
  account_holder: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  bank_name?: string;

  @IsOptional()
  @IsString()
  bank_code?: string;

  @IsOptional()
  @IsString()
  account_number?: string;

  @IsOptional()
  @IsString()
  account_holder?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}
