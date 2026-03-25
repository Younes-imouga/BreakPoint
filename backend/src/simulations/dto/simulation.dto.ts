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

class SimulationComponentDto {
    @IsString()
    @IsNotEmpty()
    fileName: string;

    @IsString()
    @IsOptional()
    language?: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}

export class SimulationDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString()
    @IsOptional()
    token?: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(['Easy', 'Normal', 'Hard', 'Insane'])
    difficulty: string;

    @IsNumber()
    @IsOptional()
    token_count?: number;

    @IsNumber()
    @IsOptional()
    minimum_exp?: number;

    @IsString()
    @IsOptional()
    @IsEnum(['Active', 'Locked'])
    status?: string;

    @IsArray()
    @IsOptional()
    hint?: string[];

    @IsNumber()
    @IsOptional()
    score?: number;

    @IsObject()
    @IsOptional()
    metadata?: Record<string, unknown>;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SimulationComponentDto)
    @IsOptional()
    components?: SimulationComponentDto[];
}

export class UpdateSimulationDto extends PartialType(SimulationDto) { }
