import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { AttemptsService } from '../attempts/attempts.service';
import { BadRequestException } from '@nestjs/common';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

describe('UserController (Unit Tests)', () => {
  let controller: UserController;
  let userService: UserService;
  let attemptsService: AttemptsService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    role: 'PARTICIPANT',
    total_score: 0,
    exp: 0,
    badge: 'BEGINNER',
    completed_simulations: [],
  };

  const mockUsers = {
    data: [mockUser],
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  };

  const mockStats = {
    total_score: 150,
    total_attempts: 5,
    successful_attempts: 3,
    failed_attempts: 2,
    exp: 150,
    badge: 'INTERMEDIATE',
  };

  const mockAttempts = [
    {
      _id: '507f1f77bcf86cd799439013',
      simulation_id: '507f1f77bcf86cd799439012',
      success: true,
      final_score: 50,
    },
  ];

  const mockUserService = {
    getLeaderboard: jest.fn(),
    getMyProfile: jest.fn(),
    updateMyProfile: jest.fn(),
    deleteMyAccount: jest.fn(),
    getUserStats: jest.fn(),
    getAllUsers: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    changeRole: jest.fn(),
    getUserById: jest.fn(),
  };

  const mockAttemptsService = {
    getAttemptsByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AttemptsService,
          useValue: mockAttemptsService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    attemptsService = module.get<AttemptsService>(AttemptsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLeaderboard', () => {
    it('should return top 10 users', async () => {
      mockUserService.getLeaderboard.mockResolvedValue([mockUser]);

      const result = await controller.getLeaderboard();

      expect(mockUserService.getLeaderboard).toHaveBeenCalledWith(10);
      expect(result).toEqual([mockUser]);
    });
  });

  describe('getMyProfile', () => {
    it('should return user profile', async () => {
      mockUserService.getMyProfile.mockResolvedValue(mockUser);

      const mockRequest = { user: { id: '507f1f77bcf86cd799439011' } };

      const result = await controller.getMyProfile(mockRequest as any);

      expect(mockUserService.getMyProfile).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if user id is missing', async () => {
      const mockRequest = { user: {}, header: () => undefined };

      await expect(controller.getMyProfile(mockRequest as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateMyProfile', () => {
    it('should update user profile', async () => {
      const updateDto: UpdateProfileDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const updated = { ...mockUser, ...updateDto };
      mockUserService.updateMyProfile.mockResolvedValue(updated);

      const mockRequest = { user: { id: '507f1f77bcf86cd799439011' } };

      const result = await controller.updateMyProfile(
        mockRequest as any,
        updateDto,
      );

      expect(mockUserService.updateMyProfile).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
      );
      expect(result).toEqual(updated);
    });

    it('should throw BadRequestException if user id is missing', async () => {
      const mockRequest = { user: {}, header: () => undefined };
      const updateDto: UpdateProfileDto = { name: 'Updated' };

      await expect(
        controller.updateMyProfile(mockRequest as any, updateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteMyAccount', () => {
    it('should delete user account', async () => {
      mockUserService.deleteMyAccount.mockResolvedValue({
        message: 'User deleted',
      });

      const mockRequest = { user: { id: '507f1f77bcf86cd799439011' } };

      const result = await controller.deleteMyAccount(mockRequest as any);

      expect(mockUserService.deleteMyAccount).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result.message).toContain('delete');
    });

    it('should throw BadRequestException if user id is missing', async () => {
      const mockRequest = { user: {}, header: () => undefined };

      await expect(
        controller.deleteMyAccount(mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyStats', () => {
    it('should return user statistics', async () => {
      mockUserService.getUserStats.mockResolvedValue(mockStats);

      const mockRequest = { user: { id: '507f1f77bcf86cd799439011' } };

      const result = await controller.getMyStats(mockRequest as any);

      expect(mockUserService.getUserStats).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockStats);
    });

    it('should throw BadRequestException if user id is missing', async () => {
      const mockRequest = { user: {}, header: () => undefined };

      await expect(controller.getMyStats(mockRequest as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getMyAttempts', () => {
    it('should return user attempts', async () => {
      mockAttemptsService.getAttemptsByUser.mockResolvedValue(mockAttempts);

      const mockRequest = { user: { id: '507f1f77bcf86cd799439011' } };

      const result = await controller.getMyAttempts(mockRequest as any);

      expect(mockAttemptsService.getAttemptsByUser).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockAttempts);
    });

    it('should throw BadRequestException if user id is missing', async () => {
      const mockRequest = { user: {}, header: () => undefined };

      await expect(
        controller.getMyAttempts(mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users (admin only)', async () => {
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();

      expect(mockUserService.getAllUsers).toHaveBeenCalledWith(1, 20);
      expect(result).toEqual(mockUsers);
    });

    it('should handle pagination parameters', async () => {
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      await controller.getAllUsers('2', '10');

      expect(mockUserService.getAllUsers).toHaveBeenCalledWith(2, 10);
    });
  });

  describe('updateUser', () => {
    it('should update a user (admin only)', async () => {
      const updateDto = { role: 'ADMIN' };
      mockUserService.updateUser.mockResolvedValue({
        ...mockUser,
        role: 'ADMIN',
      });

      const result = await controller.updateUser(
        '507f1f77bcf86cd799439011',
        updateDto,
      );

      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
      );
      expect(result.role).toBe('ADMIN');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user (admin only)', async () => {
      mockUserService.deleteUser.mockResolvedValue({ message: 'User deleted' });

      const result = await controller.deleteUser('507f1f77bcf86cd799439011');

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result.message).toContain('delete');
    });
  });

  describe('changeUserRole', () => {
    it('should change user role (admin only)', async () => {
      const updateRoleDto: UpdateRoleDto = { role: 'ADMIN' };
      mockUserService.changeRole.mockResolvedValue({
        ...mockUser,
        role: 'ADMIN',
      });

      const result = await controller.changeUserRole(
        '507f1f77bcf86cd799439011',
        updateRoleDto,
      );

      expect(mockUserService.changeRole).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'ADMIN',
      );
      expect(result.role).toBe('ADMIN');
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      mockUserService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById('507f1f77bcf86cd799439011');

      expect(mockUserService.getUserById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserStats', () => {
    it('should return stats for a specific user', async () => {
      mockUserService.getUserStats.mockResolvedValue(mockStats);

      const result = await controller.getUserStats('507f1f77bcf86cd799439011');

      expect(mockUserService.getUserStats).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('getUserAttempts', () => {
    it('should return attempts for a user (admin only)', async () => {
      mockAttemptsService.getAttemptsByUser.mockResolvedValue(mockAttempts);

      const result = await controller.getUserAttempts(
        '507f1f77bcf86cd799439011',
      );

      expect(mockAttemptsService.getAttemptsByUser).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockAttempts);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
