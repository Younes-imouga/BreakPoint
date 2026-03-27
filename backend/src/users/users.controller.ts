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
import type { UpdateQuery } from 'mongoose';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { RoleGuard } from '../guards/roles.guard';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AttemptsService } from '../attempts/attempts.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './schemas/user.schema';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

type RequestUser = {
  id?: string;
};

type AuthenticatedRequest = Request & {
  user?: RequestUser;
};

@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AttemptsService))
    private readonly attemptsService: AttemptsService,
  ) {}

  private getUserId(req: Request): string {
    const typedReq = req as AuthenticatedRequest;
    const userId = typedReq.user?.id ?? typedReq.header('x-user-id');
    if (!userId) {
      throw new BadRequestException('Missing user id');
    }
    return userId;
  }

  @Get('leaderboard/top')
  @ApiOperation({ summary: 'Get participants leaderboard' })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Leaderboard entries returned' })
  async getLeaderboard(@Query('limit') limit?: string) {
    const parsedLimit = parseInt(limit ?? '10', 10) || 10;
    const clampedLimit = Math.max(1, Math.min(100, parsedLimit));
    return this.userService.getLeaderboard(clampedLimit);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMyProfile(@Req() req: Request) {
    return this.userService.getMyProfile(this.getUserId(req));
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateProfileDto })
  async updateMyProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    return this.userService.updateMyProfile(this.getUserId(req), dto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete current user account' })
  async deleteMyAccount(@Req() req: Request) {
    return this.userService.deleteMyAccount(this.getUserId(req));
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user statistics' })
  async getMyStats(@Req() req: Request) {
    return this.userService.getUserStats(this.getUserId(req));
  }

  @Get('me/attempts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user attempts' })
  async getMyAttempts(@Req() req: Request) {
    return this.attemptsService.getAttemptsByUser(this.getUserId(req));
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get paginated users list (admin)' })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page ?? '1', 10) || 1;
    const limitNum = parseInt(limit ?? '20', 10) || 20;
    return this.userService.getAllUsers(pageNum, limitNum);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a user by id (admin)' })
  @ApiParam({ name: 'id', type: String })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateQuery<User>,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a user by id (admin)' })
  @ApiParam({ name: 'id', type: String })
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user role (admin)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateRoleDto })
  async changeUserRole(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.userService.changeRole(id, body.role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', type: String })
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user stats by id' })
  @ApiParam({ name: 'id', type: String })
  async getUserStats(@Param('id') id: string) {
    return this.userService.getUserStats(id);
  }

  @Get(':userId/attempts')
  @UseGuards(JwtAuthGuard, RoleGuard(['ADMIN']))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get attempts for a user (admin)' })
  @ApiParam({ name: 'userId', type: String })
  async getUserAttempts(@Param('userId') userId: string) {
    return this.attemptsService.getAttemptsByUser(userId);
  }
}
