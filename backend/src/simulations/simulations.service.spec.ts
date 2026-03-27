import { Test, TestingModule } from '@nestjs/testing';
import { SimulationsService } from './simulations.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('SimulationsService (Unit Tests)', () => {
  let service: SimulationsService;
  let mockSimulationModel: any;
  let mockAttemptModel: any;

  const mockSimulation = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Test Simulation',
    description: 'Test Description',
    difficulty: 'Easy',
    status: 'Active',
    token_count: 1,
    minimum_exp: 0,
    score: 10,
    hints: [],
    createdBy: new Types.ObjectId('507f1f77bcf86cd799439012'),
  };

  const mockAttempt = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
    user_id: new Types.ObjectId('507f1f77bcf86cd799439012'),
    simulation_id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    token: 'ABC123',
    success: null,
  };

  beforeEach(async () => {
    mockSimulationModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      exists: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
    };

    mockSimulationModel.exists.mockResolvedValue(null);

    mockAttemptModel = {
      find: jest.fn(),
      populate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationsService,
        {
          provide: getModelToken('Simulation'),
          useValue: mockSimulationModel,
        },
        {
          provide: getModelToken('Attempt'),
          useValue: mockAttemptModel,
        },
      ],
    }).compile();

    service = module.get<SimulationsService>(SimulationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSimulations', () => {
    it('should return paginated simulations', async () => {
      const mockExec = jest.fn().mockResolvedValue([mockSimulation]);
      mockSimulationModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({ exec: mockExec }),
        }),
      });
      mockSimulationModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.getSimulations(1, 20);

      expect(result.data).toEqual([mockSimulation]);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should apply difficulty filter', async () => {
      const mockExec = jest.fn().mockResolvedValue([mockSimulation]);
      mockSimulationModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({ exec: mockExec }),
        }),
      });
      mockSimulationModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      await service.getSimulations(1, 20, { difficulty: 'Easy' });

      expect(mockSimulationModel.find).toHaveBeenCalledWith({
        difficulty: 'Easy',
      });
    });
  });

  describe('getSimulationById', () => {
    it('should return a simulation by id', async () => {
      mockSimulationModel.findById.mockResolvedValue(mockSimulation);

      const result = await service.getSimulationById(
        '507f1f77bcf86cd799439011',
      );

      expect(mockSimulationModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockSimulation);
    });

    it('should throw NotFoundException if simulation not found', async () => {
      mockSimulationModel.findById.mockResolvedValue(null);

      await expect(service.getSimulationById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createSimulation', () => {
    it('should create a new simulation', async () => {
      const simulationDto = {
        name: 'Test Simulation',
        description: 'Test Description',
        difficulty: 'Easy',
        status: 'Active',
        token_count: 1,
        minimum_exp: 0,
        score: 10,
        hints: [],
      };

      mockSimulationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockSimulationModel.create.mockResolvedValue(mockSimulation);

      const result = await service.createSimulation(
        '507f1f77bcf86cd799439012',
        simulationDto,
      );

      expect(mockSimulationModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockSimulation);
    });

    it('should throw ConflictException if simulation name already exists', async () => {
      const simulationDto = {
        name: 'Existing Simulation',
        description: 'Test',
        difficulty: 'Easy',
        status: 'Active',
        token_count: 1,
        minimum_exp: 0,
        score: 10,
        hints: [],
      };

      mockSimulationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSimulation),
      });

      await expect(
        service.createSimulation('507f1f77bcf86cd799439012', simulationDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should include createdBy field', async () => {
      const simulationDto = {
        name: 'Test Simulation',
        description: 'Test',
        difficulty: 'Easy',
        status: 'Active',
        token_count: 1,
        minimum_exp: 0,
        score: 10,
        hints: [],
      };

      mockSimulationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockSimulationModel.create.mockResolvedValue(mockSimulation);

      await service.createSimulation('507f1f77bcf86cd799439012', simulationDto);

      expect(mockSimulationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...simulationDto,
          createdBy: expect.any(Types.ObjectId),
        }),
      );
    });
  });

  describe('updateSimulation', () => {
    it('should update a simulation', async () => {
      const updateDto = {
        name: 'Updated Simulation',
        description: 'Updated',
        difficulty: 'Hard',
        status: 'Locked',
        token_count: 2,
        minimum_exp: 100,
        score: 20,
        hints: [],
      };

      const updatedSimulation = { ...mockSimulation, ...updateDto };
      mockSimulationModel.findByIdAndUpdate.mockResolvedValue(
        updatedSimulation,
      );

      const result = await service.updateSimulation(
        '507f1f77bcf86cd799439011',
        updateDto,
      );

      expect(mockSimulationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
        { new: true },
      );
      expect(result.name).toBe('Updated Simulation');
    });

    it('should return updated simulation with new: true', async () => {
      const updateDto = { name: 'Updated' };
      mockSimulationModel.findByIdAndUpdate.mockResolvedValue(mockSimulation);

      await service.updateSimulation('507f1f77bcf86cd799439011', updateDto);

      expect(mockSimulationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        { new: true },
      );
    });
  });

  describe('deleteSimulation', () => {
    it('should delete a simulation', async () => {
      mockSimulationModel.findByIdAndDelete.mockResolvedValue(mockSimulation);

      const result = await service.deleteSimulation('507f1f77bcf86cd799439011');

      expect(mockSimulationModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockSimulation);
    });
  });

  describe('getSimulationAttempts', () => {
    it('should return attempts for a simulation', async () => {
      const mockAttemptData = [
        {
          ...mockAttempt,
          user_id: { username: 'user1', email: 'user1@example.com' },
        },
      ];

      mockSimulationModel.findById.mockResolvedValue(mockSimulation);
      mockAttemptModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAttemptData),
        }),
      });

      const result = await service.getSimulationAttempts(
        '507f1f77bcf86cd799439011',
      );

      expect(mockSimulationModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(mockAttemptModel.find).toHaveBeenCalledWith({
        simulation_id: expect.any(Types.ObjectId),
      });
      expect(result).toEqual(mockAttemptData);
    });

    it('should throw NotFoundException if simulation not found', async () => {
      mockSimulationModel.findById.mockResolvedValue(null);

      await expect(service.getSimulationAttempts('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
