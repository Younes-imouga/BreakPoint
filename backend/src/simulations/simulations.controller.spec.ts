import { Test, TestingModule } from '@nestjs/testing';
import { SimulationsController } from './simulations.controller';
import { SimulationsService } from './simulations.service';
import { AttemptsService } from '../attempts/attempts.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SimulationDto } from './dto/simulation.dto';

describe('SimulationsController (Unit Tests)', () => {
  let controller: SimulationsController;
  let simulationsService: SimulationsService;
  let attemptsService: AttemptsService;

  const mockSimulation = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Simulation',
    description: 'Test Description',
    difficulty: 'Easy',
    status: 'Active',
    token_count: 1,
    minimum_exp: 0,
    score: 10,
    hints: [],
    createdBy: '507f1f77bcf86cd799439012',
  };

  const mockSimulationsService = {
    getSimulations: jest.fn(),
    getSimulationById: jest.fn(),
    createSimulation: jest.fn(),
    updateSimulation: jest.fn(),
    deleteSimulation: jest.fn(),
    getSimulationAttempts: jest.fn(),
  };

  const mockAttemptsService = {
    startSimulationAttempt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SimulationsController],
      providers: [
        {
          provide: SimulationsService,
          useValue: mockSimulationsService,
        },
        {
          provide: AttemptsService,
          useValue: mockAttemptsService,
        },
      ],
    }).compile();

    controller = module.get<SimulationsController>(SimulationsController);
    simulationsService = module.get<SimulationsService>(SimulationsService);
    attemptsService = module.get<AttemptsService>(AttemptsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated simulations', async () => {
      const expectedResult = {
        data: [mockSimulation],
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      };

      mockSimulationsService.getSimulations.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(mockSimulationsService.getSimulations).toHaveBeenCalledWith(1, 20, {
        difficulty: undefined,
        status: undefined,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should handle pagination parameters', async () => {
      const expectedResult = {
        data: [mockSimulation],
        page: 2,
        limit: 10,
        total: 15,
        totalPages: 2,
      };

      mockSimulationsService.getSimulations.mockResolvedValue(expectedResult);

      const result = await controller.findAll('2', '10');

      expect(mockSimulationsService.getSimulations).toHaveBeenCalledWith(2, 10, {
        difficulty: undefined,
        status: undefined,
      });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it('should clamp limit to maximum 50', async () => {
      mockSimulationsService.getSimulations.mockResolvedValue({
        data: [],
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
      });

      await controller.findAll('1', '100');

      expect(mockSimulationsService.getSimulations).toHaveBeenCalledWith(1, 50, {
        difficulty: undefined,
        status: undefined,
      });
    });

    it('should apply difficulty filter', async () => {
      mockSimulationsService.getSimulations.mockResolvedValue({
        data: [mockSimulation],
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });

      await controller.findAll('1', '20', 'Easy');

      expect(mockSimulationsService.getSimulations).toHaveBeenCalledWith(1, 20, {
        difficulty: 'Easy',
        status: undefined,
      });
    });

    it('should apply status filter', async () => {
      mockSimulationsService.getSimulations.mockResolvedValue({
        data: [mockSimulation],
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });

      await controller.findAll('1', '20', undefined, 'Active');

      expect(mockSimulationsService.getSimulations).toHaveBeenCalledWith(1, 20, {
        difficulty: undefined,
        status: 'Active',
      });
    });
  });

  describe('findOne', () => {
    it('should return a single simulation by id', async () => {
      mockSimulationsService.getSimulationById.mockResolvedValue(mockSimulation);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(mockSimulationsService.getSimulationById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockSimulation);
    });

    it('should throw NotFoundException if simulation not found', async () => {
      mockSimulationsService.getSimulationById.mockRejectedValue(
        new NotFoundException('Simulation not found'),
      );

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new simulation', async () => {
      const simulationDto: SimulationDto = {
        name: 'Test Simulation',
        description: 'Test Description',
        difficulty: 'Easy',
        status: 'Active',
        token_count: 1,
        minimum_exp: 0,
        score: 10,
        hints: [],
      };

      mockSimulationsService.createSimulation.mockResolvedValue(mockSimulation);

      const mockRequest = {
        user: { id: '507f1f77bcf86cd799439012' },
      };

      const result = await controller.create(mockRequest as any, simulationDto);

      expect(mockSimulationsService.createSimulation).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
        simulationDto,
      );
      expect(result).toEqual(mockSimulation);
    });

    it('should throw BadRequestException if user id is missing', async () => {
      const simulationDto: SimulationDto = {
        name: 'Test',
        description: 'Test',
        difficulty: 'Easy',
        status: 'Active',
        token_count: 1,
        minimum_exp: 0,
        score: 10,
        hints: [],
      };

      const mockRequest = { user: {}, header: () => undefined };

      await expect(
        controller.create(mockRequest as any, simulationDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a simulation', async () => {
      const simulationDto: SimulationDto = {
        name: 'Updated Simulation',
        description: 'Updated Description',
        difficulty: 'Hard',
        status: 'Locked',
        token_count: 2,
        minimum_exp: 100,
        score: 20,
        hints: [],
      };

      mockSimulationsService.updateSimulation.mockResolvedValue({
        ...mockSimulation,
        ...simulationDto,
      });

      const result = await controller.update('507f1f77bcf86cd799439011', simulationDto);

      expect(mockSimulationsService.updateSimulation).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        simulationDto,
      );
      expect(result.name).toBe('Updated Simulation');
    });
  });

  describe('remove', () => {
    it('should delete a simulation', async () => {
      const result = { deletedCount: 1 };
      mockSimulationsService.deleteSimulation.mockResolvedValue(result);

      const response = await controller.remove('507f1f77bcf86cd799439011');

      expect(mockSimulationsService.deleteSimulation).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(response).toEqual(result);
    });
  });

  describe('startSimulation', () => {
    it('should start a simulation attempt', async () => {
      const attemptResult = {
        _id: '507f1f77bcf86cd799439013',
        user_id: '507f1f77bcf86cd799439012',
        simulation_id: '507f1f77bcf86cd799439011',
        token: 'ABC123DEF456',
        success: null,
      };

      mockSimulationsService.getSimulationById.mockResolvedValue(mockSimulation);
      mockAttemptsService.startSimulationAttempt.mockResolvedValue(attemptResult);

      const mockRequest = {
        user: { id: '507f1f77bcf86cd799439012' },
      };

      const result = await controller.startSimulation(
        '507f1f77bcf86cd799439011',
        mockRequest as any,
      );

      expect(mockSimulationsService.getSimulationById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(mockAttemptsService.startSimulationAttempt).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(attemptResult);
    });

    it('should throw BadRequestException if user id is missing', async () => {
      const mockRequest = { user: {}, header: () => undefined };

      await expect(
        controller.startSimulation('507f1f77bcf86cd799439011', mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getSimulationAttempts', () => {
    it('should return attempts for a simulation', async () => {
      const attempts = [
        {
          _id: '507f1f77bcf86cd799439013',
          user_id: { username: 'user1', email: 'user1@example.com' },
          simulation_id: '507f1f77bcf86cd799439011',
          success: true,
          final_score: 80,
        },
      ];

      mockSimulationsService.getSimulationAttempts.mockResolvedValue(attempts);

      const result = await controller.getSimulationAttempts('507f1f77bcf86cd799439011');

      expect(mockSimulationsService.getSimulationAttempts).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(attempts);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
