import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttemptDto {
  @ApiProperty({ example: '67f4f1aa12aabbccddeeff00' })
  @IsString()
  @IsNotEmpty()
  simulation_id: string;
}

export class AddAttemptEntryDto {
  @ApiProperty({ example: 'Tried script payload in comment box' })
  @IsString()
  @IsNotEmpty()
  entry: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  hintsUsed?: number;
}

export class CompleteAttemptDto {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  success?: boolean;

  @ApiPropertyOptional({ example: 85 })
  @IsNumber()
  @IsOptional()
  final_score?: number;
}
