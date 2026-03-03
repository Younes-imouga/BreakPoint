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

@Controller('simulations')
export class SimulationsController {
	constructor(private readonly simulationsService: SimulationsService) {}

	@Get()
	async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
		const pageNum = parseInt(page) || 1;
		const limitNum = parseInt(limit) || 20;
		return this.simulationsService.getSimulations(pageNum, limitNum);
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		return this.simulationsService.getSimulationById(id);
	}

	@Post()
	@UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
	async create(@Req() req: Request, @Body() dto: SimulationDto) {
		const userId = (req as any).user?.id ?? req.header('x-user-id');
		if (!userId) {
			throw new BadRequestException('Missing user id (provide in auth or x-user-id header)');
		}
		return this.simulationsService.createSimulation(userId, dto);
	}

	@Post(':id/start')
	@UseGuards(JwtAuthGuard)
	async startSimulation(@Param('id') id: string, @Req() req: Request) {
		const userId = (req as any).user?.id ?? req.header('x-user-id');
		if (!userId) {
			throw new BadRequestException('Missing user id');
		}
		return this.simulationsService.startSimulation(id, userId);
	}

	@Get(':simulationId/attempts')
	@UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
	async getSimulationAttempts(@Param('simulationId') simulationId: string) {
		return this.simulationsService.getSimulationAttempts(simulationId);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
	async update(@Param('id') id: string, @Body() dto: UpdateSimulationDto) {
		return this.simulationsService.updateSimulation(id, dto as SimulationDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
	async remove(@Param('id') id: string) {
		return this.simulationsService.deleteSimulation(id);
	}
}
