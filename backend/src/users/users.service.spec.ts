import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserService } from './users.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/createUser.dto';

jest.mock('bcrypt');

describe('UserService (Unit Tests)', () => {
  let service: UserService;
  let mockUserModel: any;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'PARTICIPANT',
    total_score: 0,
    exp: 0,
    badge: 'BEGINNER',
    completed_simulations: [],
    save: jest.fn(),
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd79 9439011',
      name: 'Test User',
      email: 'test@example.com',
      role: 'PARTICIPANT',
      total_score: 0,
      exp: 0,
      badge: 'BEGINNER',
      completed_simulations: [],
    }),
  };

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'PARTICIPANT',
    };

    it('should create a new user successfully', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.createUser(createUserDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });
  });

  describe('getUser', () => {
    it('should return a user by email', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.getUser('test@example.com');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getUser('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return a user by id without password', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.getUserById('507f1f77bcf86cd799439011');

      expect(mockUserModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.getUserById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMyProfile', () => {
    it('should return user profile without password', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.getMyProfile('507f1f77bcf86cd799439011');

      expect(mockUserModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.getMyProfile('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateMyProfile', () => {
    it('should update user name', async () => {
      const updateDto = { name: 'Updated Name' };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.updateMyProfile('507f1f77bcf86cd799439011', updateDto);

      expect(mockUserModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should update user email if not already in use', async () => {
      const updateDto = { email: 'new@example.com' };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.updateMyProfile('507f1f77bcf86cd799439011', updateDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'new@example.com',
        _id: { $ne: mockUser._id },
      });
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email is already in use', async () => {
      const updateDto = { email: 'existing@example.com' };
      const existingUser = { email: 'existing@example.com' };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });

      await expect(
        service.updateMyProfile('507f1f77bcf86cd799439011', updateDto),
      ).rejects.toThrow(ConflictException);
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it('should hash password if provided', async () => {
      const updateDto = { password: 'newpassword' };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new_password');

      await service.updateMyProfile('507f1f77bcf86cd799439011', updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateMyProfile('invalid-id', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteMyAccount', () => {
    it('should delete user account', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.deleteMyAccount('507f1f77bcf86cd799439011');

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result.message).toContain('deleted');
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const users = [mockUser];
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(users),
            }),
          }),
        }),
      });
      mockUserModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.getAllUsers(1, 20);

      expect(result.data).toEqual(users);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should handle pagination correctly', async () => {
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([mockUser]),
            }),
          }),
        }),
      });
      mockUserModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(50),
      });

      await service.getAllUsers(2, 10);

      expect(mockUserModel.find().select().skip).toHaveBeenCalledWith(10);
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      const updateDto = { name: 'Updated' };
      const updatedUserDoc = {
        ...mockUser,
        name: 'Updated',
        toObject: jest.fn().mockReturnValue({
          _id: mockUser._id,
          name: 'Updated',
          email: mockUser.email,
          role: mockUser.role,
          total_score: mockUser.total_score,
          exp: mockUser.exp,
          badge: mockUser.badge,
          completed_simulations: mockUser.completed_simulations,
        }),
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUserDoc),
      });

      const result = await service.updateUser(
        '507f1f77bcf86cd799439011',
        updateDto,
      );

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
        { new: true },
      );
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateUser('invalid-id', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.deleteUser('507f1f77bcf86cd799439011');

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result.message).toContain('deleted');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteUser('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changeRole', () => {
    it('should change user role to ADMIN', async () => {
      const adminUser = {
        ...mockUser,
        role: 'ADMIN',
        toObject: jest.fn().mockReturnValue({
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: 'ADMIN',
          total_score: mockUser.total_score,
          exp: mockUser.exp,
          badge: mockUser.badge,
          completed_simulations: mockUser.completed_simulations,
        }),
      };
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(adminUser),
      });

      const result = await service.changeRole(
        '507f1f77bcf86cd799439011',
        'ADMIN',
      );

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { role: 'ADMIN' },
        { new: true },
      );
      expect(result.role).toBe('ADMIN');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.changeRole('invalid-id', 'ADMIN')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserProgress', () => {
    it('should update user progress with simulation completion', async () => {
      const userWithProgress = {
        ...mockUser,
        completed_simulations: [],
        total_score: 0,
        exp: 0,
        save: jest.fn(),
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithProgress),
      });

      await service.updateUserProgress(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
        100,
      );

      expect(mockUserModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(userWithProgress.save).toHaveBeenCalled();
    });

    it('should not add simulation twice to completed list', async () => {
      const userWithCompletion = {
        ...mockUser,
        completed_simulations: ['507f1f77bcf86cd799439012'],
        save: jest.fn(),
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithCompletion),
      });

      await service.updateUserProgress(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
        50,
      );

      expect(userWithCompletion.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateUserProgress(
          'invalid-id',
          '507f1f77bcf86cd799439012',
          50,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUser),
          }),
        }),
      });

      const result = await service.getUserStats('507f1f77bcf86cd799439011');

      expect(mockUserModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(service.getUserStats('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getLeaderboard', () => {
    it('should return top users ordered by exp', async () => {
      const topUsers = [{ ...mockUser, exp: 1000, badge: 'EXPERT' }];
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(topUsers),
            }),
          }),
        }),
      });

      const result = await service.getLeaderboard(10);

      expect(mockUserModel.find).toHaveBeenCalledWith({ role: 'PARTICIPANT' });
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
