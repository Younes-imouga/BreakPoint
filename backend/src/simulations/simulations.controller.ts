import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  BadRequestException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SimulationsService } from './simulations.service';
import { SimulationDto, UpdateSimulationDto } from './dto/simulation.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { RoleGuard } from '../guards/roles.guard';
import { AttemptsService } from '../attempts/attempts.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

const DIFFICULTY_FILTERS = ['Easy', 'Normal', 'Hard', 'Insane'] as const;
const STATUS_FILTERS = ['Active', 'Locked'] as const;

type DifficultyFilter = (typeof DIFFICULTY_FILTERS)[number];
type StatusFilter = (typeof STATUS_FILTERS)[number];

function parseDifficultyFilter(value?: string): DifficultyFilter | undefined {
  if (!value) return undefined;
  return DIFFICULTY_FILTERS.includes(value as DifficultyFilter)
    ? (value as DifficultyFilter)
    : undefined;
}

function parseStatusFilter(value?: string): StatusFilter | undefined {
  if (!value) return undefined;
  return STATUS_FILTERS.includes(value as StatusFilter)
    ? (value as StatusFilter)
    : undefined;
}

@Controller('simulations')
@ApiTags('Simulations')
export class SimulationsController {
  constructor(
    private readonly simulationsService: SimulationsService,
    private readonly attemptsService: AttemptsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get simulations with optional filters and pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'difficulty', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated simulations list' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('difficulty') difficulty?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
    const limitNum = Math.min(
      50,
      Math.max(1, parseInt(limit ?? '20', 10) || 20),
    );

    return this.simulationsService.getSimulations(pageNum, limitNum, {
      difficulty: parseDifficultyFilter(difficulty),
      status: parseStatusFilter(status),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get simulation by id' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.simulationsService.getSimulationById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create simulation (admin)' })
  @ApiBody({ type: SimulationDto })
  async create(@Req() req: Request, @Body() dto: SimulationDto) {
    const userId = (req as any).user?.id ?? req.header('x-user-id');
    if (!userId) {
      throw new BadRequestException(
        'Missing user id (provide in auth or x-user-id header)',
      );
    }
    return this.simulationsService.createSimulation(userId, dto);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Start simulation attempt for current user' })
  @ApiParam({ name: 'id', type: String })
  async startSimulation(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.id ?? req.header('x-user-id');
    if (!userId) {
      throw new BadRequestException('Missing user id');
    }

    // Validate simulation existence before creating attempt.
    await this.simulationsService.getSimulationById(id);
    return this.attemptsService.startSimulationAttempt(userId, id);
  }

  @Get(':simulationId/attempts')
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get attempts for simulation (admin)' })
  @ApiParam({ name: 'simulationId', type: String })
  async getSimulationAttempts(@Param('simulationId') simulationId: string) {
    return this.simulationsService.getSimulationAttempts(simulationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update simulation (admin)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateSimulationDto })
  async update(@Param('id') id: string, @Body() dto: UpdateSimulationDto) {
    return this.simulationsService.updateSimulation(id, dto as SimulationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete simulation (admin)' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string) {
    return this.simulationsService.deleteSimulation(id);
  }
}
