import { Test, TestingModule } from '@nestjs/testing';
import { AttemptsService } from './attempts.service';
import { getModelToken } from '@nestjs/mongoose';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../users/users.service';
import { Types } from 'mongoose';

describe('AttemptsService (Unit Tests)', () => {
  let service: AttemptsService;
  let mockAttemptModel: any;
  let mockSimulationModel: any;
  let mockUserService: any;

  const mockAttempt = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
    user_id: new Types.ObjectId('507f1f77bcf86cd799439012'),
    simulation_id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    token: 'ABC123DEF456',
    attempts: [],
    hints_used: 0,
    success: null,
    final_score: null,
    save: jest.fn(),
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439013',
      user_id: '507f1f77bcf86cd799439012',
      simulation_id: '507f1f77bcf86cd799439011',
      token: 'ABC123DEF456',
      attempts: [],
      hints_used: 0,
      success: null,
      final_score: null,
    }),
  };

  const mockSimulation = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Test Simulation',
    score: 100,
    hint: ['Hint 1', 'Hint 2', 'Hint 3'],
    components: [
      {
        fileName: 'test-simulation.html',
        language: 'html',
        content: '<html><body>Test</body></html>',
      },
    ],
  };

  beforeEach(async () => {
    mockAttempt.attempts = [];
    mockAttempt.hints_used = 0;
    mockAttempt.success = null;
    mockAttempt.final_score = null;

    mockAttemptModel = jest.fn().mockImplementation((data) => {
      const instance = {
        ...data,
        save: jest.fn().mockResolvedValue(data),
        toObject: jest.fn().mockReturnValue({ ...data }),
      };
      return instance;
    });
    mockAttemptModel.findById = jest.fn();
    mockAttemptModel.findOne = jest.fn();
    mockAttemptModel.find = jest.fn();
    mockAttemptModel.findByIdAndDelete = jest.fn();

    mockSimulationModel = {
      findById: jest.fn(),
    };

    mockSimulationModel.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSimulation),
        }),
      }),
      exec: jest.fn().mockResolvedValue(mockSimulation),
    });

    mockUserService = {
      updateUserProgress: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptsService,
        {
          provide: getModelToken('Attempt'),
          useValue: mockAttemptModel,
        },
        {
          provide: getModelToken('Simulation'),
          useValue: mockSimulationModel,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<AttemptsService>(AttemptsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAttempt', () => {
    it('should create a new attempt', async () => {
      const dto = { simulation_id: '507f1f77bcf86cd799439011' };
      mockAttemptModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
        exec: jest.fn().mockResolvedValue(null),
      });

      const mockNewAttempt = {
        ...mockAttempt,
        save: jest.fn().mockResolvedValue(mockAttempt),
      };

      jest.spyOn(service, 'sanitizeAttempt').mockReturnValue(mockAttempt);

      // Mock the constructor behavior
      const result = await service.createAttempt(
        '507f1f77bcf86cd799439012',
        dto,
      );

      expect(mockAttemptModel.findOne).toHaveBeenCalled();
      expect(mockAttemptModel).toHaveBeenCalledWith(
        expect.objectContaining({
          component: expect.objectContaining({
            fileName: 'test-simulation.html',
            content: expect.not.stringContaining('ATTEMPT_TOKEN'),
          }),
        }),
      );

      const firstCallArg = mockAttemptModel.mock.calls[0]?.[0];
      expect(firstCallArg.component).toBeDefined();
      expect(firstCallArg.component.content).toBeDefined();
    });

    it('should throw ConflictException if user has active attempt', async () => {
      const dto = { simulation_id: '507f1f77bcf86cd799439011' };
      mockAttemptModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockAttempt),
          }),
        }),
        exec: jest.fn().mockResolvedValue(mockAttempt),
      });

      await expect(
        service.createAttempt('507f1f77bcf86cd799439012', dto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('startSimulationAttempt', () => {
    it('should start a new simulation attempt', async () => {
      mockAttemptModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
        exec: jest.fn().mockResolvedValue(null),
      });
      jest.spyOn(service, 'sanitizeAttempt').mockReturnValue(mockAttempt);

      // The service creates a new attempt via createAndSaveAttempt
      const result = await service.startSimulationAttempt(
        '507f1f77bcf86cd799439012',
        '507f1f77bcf86cd799439011',
      );

      expect(mockAttemptModel.findOne).toHaveBeenCalled();
    });

    it('should throw error if attempt already exists', async () => {
      mockAttemptModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockAttempt),
          }),
        }),
        exec: jest.fn().mockResolvedValue(mockAttempt),
      });
      await expect(
        service.startSimulationAttempt(
          '507f1f77bcf86cd799439012',
          '507f1f77bcf86cd799439011',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getAttemptById', () => {
    it('should return an attempt by id', async () => {
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAttempt),
      });

      const result = await service.getAttemptById('507f1f77bcf86cd799439013');

      expect(mockAttemptModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
      );
      expect(result).toEqual(mockAttempt);
    });

    it('should throw NotFoundException if attempt not found', async () => {
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getAttemptById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAttemptsByUser', () => {
    it('should return attempts for a user', async () => {
      const mockExec = jest.fn().mockResolvedValue([mockAttempt]);
      mockAttemptModel.find.mockReturnValue({ exec: mockExec });
      jest.spyOn(service, 'sanitizeAttempts').mockReturnValue([mockAttempt]);

      const result = await service.getAttemptsByUser(
        '507f1f77bcf86cd799439012',
      );

      expect(mockAttemptModel.find).toHaveBeenCalledWith({
        user_id: expect.any(Types.ObjectId),
      });
      expect(mockExec).toHaveBeenCalled();
    });
  });

  describe('getAttemptsBySimulation', () => {
    it('should return attempts for a simulation', async () => {
      const mockExec = jest.fn().mockResolvedValue([mockAttempt]);
      mockAttemptModel.find.mockReturnValue({ exec: mockExec });
      jest.spyOn(service, 'sanitizeAttempts').mockReturnValue([mockAttempt]);

      await service.getAttemptsBySimulation('507f1f77bcf86cd799439011');

      expect(mockAttemptModel.find).toHaveBeenCalledWith({
        simulation_id: expect.any(Types.ObjectId),
      });
      expect(mockExec).toHaveBeenCalled();
    });
  });

  describe('addEntry', () => {
    it('should add an entry to an attempt', async () => {
      const dto = { entry: 'test_entry', hintsUsed: 1 };
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAttempt),
      });

      jest.spyOn(service, 'sanitizeAttempt').mockReturnValue(mockAttempt);

      const result = await service.addEntry('507f1f77bcf86cd799439013', dto);

      expect(mockAttemptModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
      );
      expect(mockAttempt.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if attempt not found', async () => {
      const dto = { entry: 'test_entry' };
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.addEntry('invalid-id', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('completeAttempt', () => {
    it('should complete an attempt with success', async () => {
      const dto = { success: true, final_score: 100 };
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAttempt),
      });
      jest.spyOn(service, 'sanitizeAttempt').mockReturnValue(mockAttempt);

      const result = await service.completeAttempt(
        '507f1f77bcf86cd799439013',
        dto,
      );

      expect(mockAttemptModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
      );
      expect(mockAttempt.save).toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const dto = { success: true };
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAttempt),
      });
      jest.spyOn(service, 'sanitizeAttempt').mockReturnValue(mockAttempt);

      await service.completeAttempt('507f1f77bcf86cd799439013', dto);

      expect(mockAttempt.save).toHaveBeenCalled();
    });
  });

  describe('deleteAttempt', () => {
    it('should delete an attempt', async () => {
      mockAttemptModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAttempt),
      });

      const result = await service.deleteAttempt('507f1f77bcf86cd799439013');

      expect(mockAttemptModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
      );
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException if attempt not found', async () => {
      mockAttemptModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteAttempt('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('submitToken', () => {
    it('should succeed when token matches', async () => {
      const attemptWithToken = { ...mockAttempt, token: 'CORRECT_TOKEN' };
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(attemptWithToken),
      });
      mockSimulationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSimulation),
      });
      mockSimulationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockSimulationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockUserService.updateUserProgress.mockResolvedValue({});
      jest.spyOn(service, 'sanitizeAttempt').mockReturnValue(attemptWithToken);

      const result = await service.submitToken(
        '507f1f77bcf86cd799439013',
        'CORRECT_TOKEN',
      );

      expect(result.success).toBe(true);
      expect(attemptWithToken.save).toHaveBeenCalled();
    });

    it('should increment attempts count on wrong token', async () => {
      const attemptWithToken = {
        ...mockAttempt,
        token: 'CORRECT_TOKEN',
        attempts: [],
      };
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(attemptWithToken),
      });
      jest.spyOn(service, 'sanitizeAttempt').mockReturnValue(attemptWithToken);

      const result = await service.submitToken(
        '507f1f77bcf86cd799439013',
        'WRONG_TOKEN',
      );

      expect(result.success).toBe(false);
      expect(attemptWithToken.save).toHaveBeenCalled();
    });

    it('should fail attempt after 3 wrong submissions', async () => {
      const attemptWith2Failed = {
        ...mockAttempt,
        token: 'CORRECT_TOKEN',
        attempts: ['WRONG1', 'WRONG2'],
      };
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(attemptWith2Failed),
      });
      jest
        .spyOn(service, 'sanitizeAttempt')
        .mockReturnValue(attemptWith2Failed);

      const result = await service.submitToken(
        '507f1f77bcf86cd799439013',
        'WRONG3',
      );

      expect(result.success).toBe(false);
      expect(attemptWith2Failed.success).toBe(false);
    });

    it('should throw NotFoundException if attempt not found', async () => {
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.submitToken('invalid-id', 'TOKEN')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('verifyToken', () => {
    it('should return true for correct token', async () => {
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAttempt),
      });

      const result = await service.verifyToken(
        '507f1f77bcf86cd799439013',
        'ABC123DEF456',
      );

      expect(result).toBe(true);
    });

    it('should return false for incorrect token', async () => {
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAttempt),
      });

      const result = await service.verifyToken(
        '507f1f77bcf86cd799439013',
        'WRONG_TOKEN',
      );

      expect(result).toBe(false);
    });

    it('should throw NotFoundException if attempt not found', async () => {
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.verifyToken('invalid-id', 'TOKEN')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getHintForUser', () => {
    it('should return next hint for active user attempt', async () => {
      const attemptWithHints = { ...mockAttempt, hints_used: 0 };
      mockAttemptModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(attemptWithHints),
          }),
        }),
        exec: jest.fn().mockResolvedValue(attemptWithHints),
      });
      mockSimulationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSimulation),
      });

      const result = await service.getHintForUser('507f1f77bcf86cd799439012');

      expect(result.hint).toBe('Hint 1');
      expect(result.remaining).toBe(2);
      expect(attemptWithHints.save).toHaveBeenCalled();
    });

    it('should return empty when no hints available', async () => {
      const attemptNoHints = { ...mockAttempt, hints_used: 3 };
      mockAttemptModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(attemptNoHints),
          }),
        }),
        exec: jest.fn().mockResolvedValue(attemptNoHints),
      });
      mockSimulationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSimulation),
      });

      const result = await service.getHintForUser('507f1f77bcf86cd799439012');

      expect(result.hint).toBe(null);
      expect(result.remaining).toBe(0);
    });

    it('should throw NotFoundException if no active attempt', async () => {
      mockAttemptModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getHintForUser('507f1f77bcf86cd799439012'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getHintForAttempt', () => {
    it('should return hint for specific attempt', async () => {
      const attemptWithHints = { ...mockAttempt, hints_used: 1 };
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(attemptWithHints),
      });
      mockSimulationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSimulation),
      });

      const result = await service.getHintForAttempt(
        '507f1f77bcf86cd799439013',
      );

      expect(result.hint).toBe('Hint 2');
      expect(result.remaining).toBe(1);
    });

    it('should throw NotFoundException if attempt not found', async () => {
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getHintForAttempt('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('giveUp', () => {
    it('should mark attempt as given up', async () => {
      const activeAttempt = { ...mockAttempt, success: null };
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(activeAttempt),
      });
      jest.spyOn(service, 'sanitizeAttempt').mockReturnValue(activeAttempt);

      const result = await service.giveUp('507f1f77bcf86cd799439013');

      expect(activeAttempt.success).toBe(false);
      expect(activeAttempt.save).toHaveBeenCalled();
      expect(result.message).toContain('given up');
    });

    it('should throw ConflictException if attempt already completed', async () => {
      const completedAttempt = { ...mockAttempt, success: true };
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(completedAttempt),
      });

      await expect(service.giveUp('507f1f77bcf86cd799439013')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if attempt not found', async () => {
      mockAttemptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.giveUp('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('sanitizeAttempt', () => {
    it('should keep token on attempt', () => {
      const result = service.sanitizeAttempt(mockAttempt);

      expect(result.token).toBeDefined();
    });

    it('should preserve other fields', () => {
      const result = service.sanitizeAttempt(mockAttempt);

      expect(result._id).toBeDefined();
      expect(result.user_id).toBeDefined();
      expect(result.simulation_id).toBeDefined();
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
