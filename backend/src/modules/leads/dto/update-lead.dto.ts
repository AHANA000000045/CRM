import { IsEmail, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedValue?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
