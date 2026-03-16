import { ConflictException, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Simulation } from './schemas/simulation.schema';
import { Attempt } from '../attempts/schemas/attempt.schema';
import { Model, Types } from 'mongoose';
import { SimulationDto } from './dto/simulation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';

@Injectable()
export class SimulationsService {
    private static readonly TOKEN_LENGTH = 12;
    private static readonly TOKEN_ALPHABET =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    constructor(
        @InjectModel('Simulation') private readonly simulationModel: Model<Simulation>,
        @InjectModel('Attempt') private readonly attemptModel: Model<Attempt>,
    ) { }

    private generateToken(length: number = SimulationsService.TOKEN_LENGTH): string {
        const bytes = randomBytes(length);
        let token = '';

        for (let i = 0; i < length; i++) {
            token += SimulationsService.TOKEN_ALPHABET[bytes[i] % SimulationsService.TOKEN_ALPHABET.length];
        }

        return token;
    }

    private async generateUniqueToken(): Promise<string> {
        for (let i = 0; i < 10; i++) {
            const token = this.generateToken();
            const exists = await this.attemptModel.findOne({ token }).select('_id').lean().exec();
            if (!exists) {
                return token;
            }
        }

        throw new ConflictException('Could not generate a unique token, please retry');
    }

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
        await this.getSimulationById(simulationId);
        
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
        const token = await this.generateUniqueToken();
        const newAttempt = new this.attemptModel({
            user_id: new Types.ObjectId(userId),
            simulation_id: new Types.ObjectId(simulationId),
            token,
            success: null,
            attempts: [],
            hints_used: 0,
        });

        const savedAttempt = await newAttempt.save();
        const attempt = savedAttempt.toObject();
        const { token: _token, ...safeAttempt } = attempt;
        return safeAttempt;
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
