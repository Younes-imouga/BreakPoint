import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  Delete,
  Body,
  Patch,
} from '@nestjs/common';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { RoleGuard } from '../guards/roles.guard';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  async getAllUsers() {
    return this.userService.getAllUsers();
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
}
