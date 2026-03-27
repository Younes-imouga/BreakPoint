import { Test, TestingModule } from '@nestjs/testing';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';
import { BadRequestException } from '@nestjs/common';
import { AddAttemptEntryDto, CompleteAttemptDto } from './dto/attempt.dto';

describe('AttemptsController (Unit Tests)', () => {
  let controller: AttemptsController;
  let service: AttemptsService;

  const mockAttempt = {
    _id: '507f1f77bcf86cd799439013',
    user_id: '507f1f77bcf86cd799439012',
    simulation_id: '507f1f77bcf86cd799439011',
    token: 'ABC123DEF456',
    attempts: [],
    hints_used: 0,
    success: null,
    final_score: null,
  };

  const mockAttemptsService = {
    createAttempt: jest.fn(),
    getAttemptById: jest.fn(),
    sanitizeAttempt: jest.fn(),
    getHintForAttempt: jest.fn(),
    getAttemptsByUser: jest.fn(),
    getAttemptsBySimulation: jest.fn(),
    addEntry: jest.fn(),
    completeAttempt: jest.fn(),
    submitToken: jest.fn(),
    deleteAttempt: jest.fn(),
    getHintForUser: jest.fn(),
    giveUp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttemptsController],
      providers: [
        {
          provide: AttemptsService,
          useValue: mockAttemptsService,
        },
      ],
    }).compile();

    controller = module.get<AttemptsController>(AttemptsController);
    service = module.get<AttemptsService>(AttemptsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new attempt', async () => {
      const dto = { simulation_id: '507f1f77bcf86cd799439011' };
      mockAttemptsService.createAttempt.mockResolvedValue(mockAttempt);

      const mockRequest = { user: { id: '507f1f77bcf86cd799439012' } };

      const result = await controller.create(mockRequest as any, dto);

      expect(mockAttemptsService.createAttempt).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
        dto,
      );
      expect(result).toEqual(mockAttempt);
    });

    it('should throw BadRequestException if user id is missing', async () => {
      const dto = { simulation_id: '507f1f77bcf86cd799439011' };
      const mockRequest = { user: {}, header: () => undefined };

      await expect(controller.create(mockRequest as any, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a sanitized attempt', async () => {
      const sanitized = { ...mockAttempt, token: undefined };
      mockAttemptsService.getAttemptById.mockResolvedValue(mockAttempt);
      mockAttemptsService.sanitizeAttempt.mockReturnValue(sanitized);

      const result = await controller.findOne('507f1f77bcf86cd799439013');

      expect(mockAttemptsService.getAttemptById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
      );
      expect(mockAttemptsService.sanitizeAttempt).toHaveBeenCalledWith(
        mockAttempt,
      );
      expect(result).toEqual(sanitized);
    });
  });

  describe('getHints', () => {
    it('should return hints for an attempt', async () => {
      const hintsResult = { hint: 'Look for the key', remaining: 2 };
      mockAttemptsService.getHintForAttempt.mockResolvedValue(hintsResult);

      const result = await controller.getHints('507f1f77bcf86cd799439013');

      expect(mockAttemptsService.getHintForAttempt).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
      );
      expect(result).toEqual(hintsResult);
    });
  });

  describe('findByUser', () => {
    it('should return attempts for a user (admin only)', async () => {
      const userAttempts = [{ ...mockAttempt }];
      mockAttemptsService.getAttemptsByUser.mockResolvedValue(userAttempts);

      const result = await controller.findByUser('507f1f77bcf86cd799439012');

      expect(mockAttemptsService.getAttemptsByUser).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
      );
      expect(result).toEqual(userAttempts);
    });
  });

  describe('findBySimulation', () => {
    it('should return attempts for a simulation (admin only)', async () => {
      const simAttempts = [{ ...mockAttempt }];
      mockAttemptsService.getAttemptsBySimulation.mockResolvedValue(
        simAttempts,
      );

      const result = await controller.findBySimulation(
        '507f1f77bcf86cd799439011',
      );

      expect(mockAttemptsService.getAttemptsBySimulation).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(simAttempts);
    });
  });

  describe('addEntry', () => {
    it('should add an entry to an attempt', async () => {
      const dto: AddAttemptEntryDto = { entry: 'some_entry', hintsUsed: 1 };
      const updated = {
        ...mockAttempt,
        attempts: ['some_entry'],
        hints_used: 1,
      };
      mockAttemptsService.addEntry.mockResolvedValue(updated);

      const result = await controller.addEntry('507f1f77bcf86cd799439013', dto);

      expect(mockAttemptsService.addEntry).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
        dto,
      );
      expect(result).toEqual(updated);
    });
  });

  describe('complete', () => {
    it('should complete an attempt', async () => {
      const dto: CompleteAttemptDto = { success: true, final_score: 100 };
      const completed = { ...mockAttempt, success: true, final_score: 100 };
      mockAttemptsService.completeAttempt.mockResolvedValue(completed);

      const result = await controller.complete('507f1f77bcf86cd799439013', dto);

      expect(mockAttemptsService.completeAttempt).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
        dto,
      );
      expect(result).toEqual(completed);
    });
  });

  describe('submit', () => {
    it('should submit a token for an attempt', async () => {
      const submitResult = {
        success: true,
        attempts: 1,
        attempt: mockAttempt,
      };
      mockAttemptsService.submitToken.mockResolvedValue(submitResult);

      const result = await controller.submit('507f1f77bcf86cd799439013', {
        token: 'ABC123DEF456',
      });

      expect(mockAttemptsService.submitToken).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
        'ABC123DEF456',
      );
      expect(result).toEqual(submitResult);
    });
  });

  describe('getHint', () => {
    it('should get hint for active user attempt', async () => {
      const hintResult = { hint: 'Look here', remaining: 2 };
      mockAttemptsService.getHintForUser.mockResolvedValue(hintResult);

      const mockRequest = { user: { id: '507f1f77bcf86cd799439012' } };

      const result = await controller.getHint(mockRequest as any);

      expect(mockAttemptsService.getHintForUser).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
      );
      expect(result).toEqual(hintResult);
    });

    it('should throw BadRequestException if user id is missing', async () => {
      const mockRequest = { user: {}, header: () => undefined };

      await expect(controller.getHint(mockRequest as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('giveUp', () => {
    it('should mark attempt as given up', async () => {
      const result = {
        message: 'Attempt marked as given up',
        attempt: { ...mockAttempt, success: false },
      };
      mockAttemptsService.giveUp.mockResolvedValue(result);

      const response = await controller.giveUp('507f1f77bcf86cd799439013');

      expect(mockAttemptsService.giveUp).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
      );
      expect(response).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should delete an attempt', async () => {
      mockAttemptsService.deleteAttempt.mockResolvedValue({ deleted: true });

      const result = await controller.remove('507f1f77bcf86cd799439013');

      expect(mockAttemptsService.deleteAttempt).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
      );
      expect(result).toEqual({ deleted: true });
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
