import { Controller, Post, Body, Req, Get, Param, Delete, Patch, BadRequestException, UseGuards } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto, AddAttemptEntryDto, CompleteAttemptDto } from './dto/attempt.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { AttemptsOwnerGuard } from '../guards/attempts-owner.guard';
import { RoleGuard } from '../guards/roles.guard';
import { RateLimitGuard } from '../guards/rate-limit.guard';

@Controller('attempts')
@UseGuards(JwtAuthGuard)
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateAttemptDto) {
    const userId = (req as any).user?.id ?? req.header('x-user-id');
    if (!userId) throw new BadRequestException('Missing user id');
    return this.attemptsService.createAttempt(userId, dto);
  }

  @UseGuards(AttemptsOwnerGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.attemptsService.getAttemptById(id);
  }

  @UseGuards(AttemptsOwnerGuard)
  @Get(':id/hints')
  async getHints(@Param('id') id: string) {
    return this.attemptsService.getHintForAttempt(id);
  }

  @Get('/user/:userId')
  @UseGuards(RoleGuard(['ADMIN']))
  async findByUser(@Param('userId') userId: string) {
    return this.attemptsService.getAttemptsByUser(userId);
  }

  @Get('/simulation/:simulationId')
  @UseGuards(RoleGuard(['ADMIN']))
  async findBySimulation(@Param('simulationId') simulationId: string) {
    return this.attemptsService.getAttemptsBySimulation(simulationId);
  }

  @UseGuards(AttemptsOwnerGuard)
  @Patch(':id/entry')
  async addEntry(@Param('id') id: string, @Body() dto: AddAttemptEntryDto) {
    return this.attemptsService.addEntry(id, dto);
  }

  @UseGuards(AttemptsOwnerGuard)
  @Patch(':id/complete')
  async complete(@Param('id') id: string, @Body() dto: CompleteAttemptDto) {
    return this.attemptsService.completeAttempt(id, dto);
  }

  @UseGuards(AttemptsOwnerGuard, new RateLimitGuard(5, 10))
  @Post(':id/submit')
  async submit(@Param('id') id: string, @Body() body: { token: string }) {
    return this.attemptsService.submitToken(id, body.token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('hint/active')
  async getHint(@Req() req: Request) {
    const userId = (req as any).user?.id ?? req.header('x-user-id');
    if (!userId) throw new BadRequestException('Missing user id');
    return this.attemptsService.getHintForUser(userId);
  }

  @UseGuards(AttemptsOwnerGuard)
  @Post(':id/give-up')
  async giveUp(@Param('id') id: string) {
    return this.attemptsService.giveUp(id);
  }

  @UseGuards(AttemptsOwnerGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.attemptsService.deleteAttempt(id);
  }
}
