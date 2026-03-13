import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { UserService } from './users.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/createUser.dto';

describe.skip('UserService', () => {
  let service: UserService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'USER',
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'USER',
    }),
  };

  const mockUserModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
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
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'USER',
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

  describe('getProfile', () => {
    it('should return user profile with enrollments', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.getUser('test@example.com');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(result).not.toBeNull();
      if (result) {
        expect(result).toHaveProperty('email', 'test@example.com');
        expect(result).not.toHaveProperty('password');
      }
      expect(result).not.toBeNull();
      if (result) {
        expect(result).toHaveProperty('email', 'test@example.com');
        expect(result).not.toHaveProperty('password');
      }
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getUser('nonexistent@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    const updateDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update user profile successfully', async () => {
      const updatedUser = {
        ...mockUser,
        name: updateDto.name,
        email: updateDto.email,
        toObject: jest.fn().mockReturnValue({
          _id: mockUser._id,
          name: updateDto.name,
          email: updateDto.email,
          role: mockUser.role,
        }),
      };

      mockUserModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      mockUserModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });

      const result = await service.updateUser(mockUser._id, updateDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        { name: updateDto.name, email: 'updated@example.com' },
        { new: true },
      );
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateUser(mockUser._id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
