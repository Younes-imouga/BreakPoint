import { ConflictException, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Simulation } from './schemas/simulation.schema';
import { Attempt } from '../attempts/schemas/attempt.schema';
import { Model, Types } from 'mongoose';
import { SimulationDto } from './dto/simulation.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SimulationsService {
    constructor(
        @InjectModel('Simulation') private readonly simulationModel: Model<Simulation>,
        @InjectModel('Attempt') private readonly attemptModel: Model<Attempt>,
    ) { }

    async getSimulations(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.simulationModel.find().skip(skip).limit(limit).exec(),
            this.simulationModel.countDocuments().exec(),
        ]);
        return {
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async createSimulation(user_id: string, simulationDto: SimulationDto) {
        const existingUser = await this.simulationModel
            .findOne({ name: simulationDto.name })
            .exec();
        if (existingUser) {
            throw new ConflictException('Simulation name already in use');
        }
        return this.simulationModel.create({ ...simulationDto, createdBy: new Types.ObjectId(user_id) });
    }

    async getSimulationById(id: string) {
        const simulation = await this.simulationModel.findById(id);
        if (!simulation) {
            throw new NotFoundException('Simulation not found');
        }
        return simulation;
    }

    async updateSimulation(id: string, simulationDto: SimulationDto) {
        return this.simulationModel.findByIdAndUpdate(id, simulationDto, { new: true });
    }

    async deleteSimulation(id: string) {
        return this.simulationModel.findByIdAndDelete(id);
    }

    async startSimulation(simulationId: string, userId: string) {
        const simulation = await this.getSimulationById(simulationId);
        
        // Check for existing active attempt
        const existingAttempt = await this.attemptModel.findOne({
            user_id: new Types.ObjectId(userId),
            simulation_id: new Types.ObjectId(simulationId),
            success: null,
        }).exec();

        if (existingAttempt) {
            throw new BadRequestException('You already have an active attempt for this simulation');
        }

        // Create new attempt
        const newAttempt = new this.attemptModel({
            user_id: new Types.ObjectId(userId),
            simulation_id: new Types.ObjectId(simulationId),
            success: null,
            attempts: [],
            hints_used: 0,
        });

        return newAttempt.save();
    }

    async getSimulationAttempts(simulationId: string) {
        // Verify simulation exists
        await this.getSimulationById(simulationId);
        
        return this.attemptModel
            .find({ simulation_id: new Types.ObjectId(simulationId) })
            .populate('user_id', 'username email')
            .exec();
    }

}
