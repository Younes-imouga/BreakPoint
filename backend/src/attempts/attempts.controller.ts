import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Param,
  Delete,
  Patch,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import {
  CreateAttemptDto,
  AddAttemptEntryDto,
  CompleteAttemptDto,
} from './dto/attempt.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { AttemptsOwnerGuard } from '../guards/attempts-owner.guard';
import { RoleGuard } from '../guards/roles.guard';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';

class SubmitTokenBodyDto {
  @ApiProperty({ example: 'BP{sample_token}' })
  token: string;
}

@Controller('attempts')
@UseGuards(JwtAuthGuard)
@ApiTags('Attempts')
@ApiBearerAuth('JWT-auth')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  @ApiOperation({ summary: 'Create attempt for current user' })
  @ApiBody({ type: CreateAttemptDto })
  async create(@Req() req: Request, @Body() dto: CreateAttemptDto) {
    const userId = (req as any).user?.id ?? req.header('x-user-id');
    if (!userId) throw new BadRequestException('Missing user id');
    return this.attemptsService.createAttempt(userId, dto);
  }

  @UseGuards(AttemptsOwnerGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get attempt by id (owner)' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    const attempt = await this.attemptsService.getAttemptById(id);
    return this.attemptsService.sanitizeAttempt(attempt);
  }

  @UseGuards(AttemptsOwnerGuard)
  @Get(':id/hints')
  @ApiOperation({ summary: 'Get hint for attempt (owner)' })
  @ApiParam({ name: 'id', type: String })
  async getHints(@Param('id') id: string) {
    return this.attemptsService.getHintForAttempt(id);
  }

  @Get('/user/:userId')
  @UseGuards(RoleGuard(['ADMIN']))
  @ApiOperation({ summary: 'Get attempts by user (admin)' })
  @ApiParam({ name: 'userId', type: String })
  async findByUser(@Param('userId') userId: string) {
    return this.attemptsService.getAttemptsByUser(userId);
  }

  @Get('/simulation/:simulationId')
  @UseGuards(RoleGuard(['ADMIN']))
  @ApiOperation({ summary: 'Get attempts by simulation (admin)' })
  @ApiParam({ name: 'simulationId', type: String })
  async findBySimulation(@Param('simulationId') simulationId: string) {
    return this.attemptsService.getAttemptsBySimulation(simulationId);
  }

  @UseGuards(AttemptsOwnerGuard)
  @Patch(':id/entry')
  @ApiOperation({ summary: 'Append attempt entry (owner)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: AddAttemptEntryDto })
  async addEntry(@Param('id') id: string, @Body() dto: AddAttemptEntryDto) {
    return this.attemptsService.addEntry(id, dto);
  }

  @UseGuards(AttemptsOwnerGuard)
  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete attempt (owner)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CompleteAttemptDto })
  async complete(@Param('id') id: string, @Body() dto: CompleteAttemptDto) {
    return this.attemptsService.completeAttempt(id, dto);
  }

  @UseGuards(AttemptsOwnerGuard, new RateLimitGuard(5, 10))
  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit token for attempt (owner)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: SubmitTokenBodyDto })
  async submit(@Param('id') id: string, @Body() body: { token: string }) {
    return this.attemptsService.submitToken(id, body.token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('hint/active')
  @ApiOperation({ summary: 'Get hint for current active attempt' })
  async getHint(@Req() req: Request) {
    const userId = (req as any).user?.id ?? req.header('x-user-id');
    if (!userId) throw new BadRequestException('Missing user id');
    return this.attemptsService.getHintForUser(userId);
  }

  @UseGuards(AttemptsOwnerGuard)
  @Post(':id/give-up')
  @ApiOperation({ summary: 'Give up current attempt (owner)' })
  @ApiParam({ name: 'id', type: String })
  async giveUp(@Param('id') id: string) {
    return this.attemptsService.giveUp(id);
  }

  @UseGuards(AttemptsOwnerGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete attempt (owner)' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string) {
    return this.attemptsService.deleteAttempt(id);
  }
}
