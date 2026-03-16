import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateAttemptDto {
  @IsString()
  @IsNotEmpty()
  simulation_id: string;
}

export class AddAttemptEntryDto {
  @IsString()
  @IsNotEmpty()
  entry: string;

  @IsNumber()
  @IsOptional()
  hintsUsed?: number;
}

export class CompleteAttemptDto {
  @IsBoolean()
  @IsOptional()
  success?: boolean;

  @IsNumber()
  @IsOptional()
  final_score?: number;
}
