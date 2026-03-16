import {
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  Delete,
  Body,
  Patch,
  Query,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { RoleGuard } from '../guards/roles.guard';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AttemptsService } from '../attempts/attempts.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AttemptsService))
    private readonly attemptsService: AttemptsService,
  ) {}

  private getUserId(req: Request): string {
    const userId = (req as any).user?.id ?? req.header('x-user-id');
    if (!userId) {
      throw new BadRequestException('Missing user id');
    }
    return userId;
  }

  @Get('leaderboard/top')
  async getLeaderboard() {
    return this.userService.getLeaderboard(10);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Req() req: Request) {
    return this.userService.getMyProfile(this.getUserId(req));
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    return this.userService.updateMyProfile(this.getUserId(req), dto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMyAccount(@Req() req: Request) {
    return this.userService.deleteMyAccount(this.getUserId(req));
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  async getMyStats(@Req() req: Request) {
    return this.userService.getUserStats(this.getUserId(req));
  }

  @Get('me/attempts')
  @UseGuards(JwtAuthGuard)
  async getMyAttempts(@Req() req: Request) {
    return this.attemptsService.getAttemptsByUser(this.getUserId(req));
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  async getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = parseInt(page ?? '1', 10) || 1;
    const limitNum = parseInt(limit ?? '20', 10) || 20;
    return this.userService.getAllUsers(pageNum, limitNum);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  async updateUser(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  async changeUserRole(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.userService.changeRole(id, body.role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Param('id') id: string) {
    return this.userService.getUserStats(id);
  }

  @Get(':userId/attempts')
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  async getUserAttempts(@Param('userId') userId: string) {
    return this.attemptsService.getAttemptsByUser(userId);
  }
}
