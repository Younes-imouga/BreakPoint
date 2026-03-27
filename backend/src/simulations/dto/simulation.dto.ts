import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SimulationComponentDto {
  @ApiProperty({ example: 'index.html' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiPropertyOptional({ example: 'html' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ example: '<h1>Vulnerable page</h1>' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class SimulationDto {
  @ApiProperty({ example: 'XSS Basic' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'xss-basic' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'BP{sample_token}' })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiProperty({ example: 'Find reflected XSS and obtain token' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ['Easy', 'Normal', 'Hard', 'Insane'], example: 'Easy' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['Easy', 'Normal', 'Hard', 'Insane'])
  difficulty: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  token_count?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  minimum_exp?: number;

  @ApiPropertyOptional({ enum: ['Active', 'Locked'], example: 'Active' })
  @IsString()
  @IsOptional()
  @IsEnum(['Active', 'Locked'])
  status?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Try inspecting page source'],
  })
  @IsArray()
  @IsOptional()
  hint?: string[];

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  score?: number;

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [SimulationComponentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimulationComponentDto)
  @IsOptional()
  components?: SimulationComponentDto[];
}

export class UpdateSimulationDto extends PartialType(SimulationDto) {}
