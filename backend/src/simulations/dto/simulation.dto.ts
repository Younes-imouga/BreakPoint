import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsEnum,
    IsArray,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class SimulationDto {
    @IsString()
    @IsNotEmpty()
    name: string;

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
}

export class UpdateSimulationDto extends PartialType(SimulationDto) { }
