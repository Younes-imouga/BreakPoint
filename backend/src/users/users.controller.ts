import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  Delete,
  Body,
  Patch,
  Query,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { RoleGuard } from '../guards/roles.guard';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AttemptsService } from '../attempts/attempts.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AttemptsService))
    private readonly attemptsService: AttemptsService,
  ) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  async getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
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

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Param('id') id: string) {
    return this.userService.getUserStats(id);
  }

  @Get('leaderboard/top')
  async getLeaderboard() {
    return this.userService.getLeaderboard(10);
  }

  @Get(':userId/attempts')
  @UseGuards(JwtAuthGuard)
  async getUserAttempts(@Param('userId') userId: string) {
    return this.attemptsService.getAttemptsByUser(userId);
  }
}
