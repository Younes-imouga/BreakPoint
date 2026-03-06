import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attempt, AttemptDocument } from './schemas/attempt.schema';
import { CreateAttemptDto, AddAttemptEntryDto, CompleteAttemptDto } from './dto/attempt.dto';
import { randomBytes } from 'crypto';
import { Simulation } from '../simulations/schemas/simulation.schema';
import { UserService } from '../users/users.service';

@Injectable()
export class AttemptsService {
  constructor(
    @InjectModel(Attempt.name) private attemptModel: Model<AttemptDocument>,
    @InjectModel(Simulation.name) private simulationModel: Model<Simulation>,
    private userService: UserService,
  ) {}

  private generateToken(): string {
    // 8 bytes -> 16 hex chars
    return randomBytes(8).toString('hex');
  }

  async createAttempt(userId: string, dto: CreateAttemptDto) {
    // Prevent creating if user has an active attempt (success === null)
    const active = await this.attemptModel.findOne({ user_id: new Types.ObjectId(userId), success: null }).exec();
    if (active) {
      throw new ConflictException('You have an active attempt. Complete it before creating a new one');
    }

    const token = dto.token ?? this.generateToken();
    const attempt = new this.attemptModel({
      user_id: new Types.ObjectId(userId),
      simulation_id: new Types.ObjectId(dto.simulation_id),
      token,
      attempts: [],
      hints_used: 0,
      success: null,
      final_score: null,
    });

    return attempt.save();
  }

  async getAttemptById(id: string) {
    const attempt = await this.attemptModel.findById(id).exec();
    if (!attempt) throw new NotFoundException('Attempt not found');
    return attempt;
  }

  async getAttemptsByUser(userId: string) {
    return this.attemptModel.find({ user_id: new Types.ObjectId(userId) }).exec();
  }

  async getAttemptsBySimulation(simulationId: string) {
    return this.attemptModel.find({ simulation_id: new Types.ObjectId(simulationId) }).exec();
  }

  async addEntry(attemptId: string, dto: AddAttemptEntryDto) {
    const attempt = await this.attemptModel.findById(attemptId).exec();
    if (!attempt) throw new NotFoundException('Attempt not found');

    if (dto.hintsUsed) {
      attempt.hints_used = (attempt.hints_used ?? 0) + dto.hintsUsed;
    }

    attempt.attempts.push(dto.entry);
    await attempt.save();
    return attempt;
  }

  async completeAttempt(attemptId: string, dto: CompleteAttemptDto) {
    const attempt = await this.attemptModel.findById(attemptId).exec();
    if (!attempt) throw new NotFoundException('Attempt not found');

    if (typeof dto.success === 'boolean') attempt.success = dto.success;
    if (typeof dto.final_score === 'number') attempt.final_score = dto.final_score;

    await attempt.save();
    return attempt;
  }

  async deleteAttempt(id: string) {
    const res = await this.attemptModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Attempt not found');
    return { deleted: true };
  }

  // Submit a token: record the submitted token and verify
  async submitToken(attemptId: string, submittedToken: string) {
    const attempt = await this.attemptModel.findById(attemptId).exec();
    if (!attempt) throw new NotFoundException('Attempt not found');

    // push submitted token
    attempt.attempts.push(submittedToken);

    const isMatch = attempt.token === submittedToken;
    // If match -> success
    if (isMatch) {
      attempt.success = true;
      
      // Award points and update user progress
      const simulation = await this.simulationModel.findById(attempt.simulation_id).exec();
      if (simulation) {
        attempt.final_score = simulation.score;
        
        // Update user stats
        await this.userService.updateUserProgress(
          attempt.user_id.toString(),
          attempt.simulation_id.toString(),
          simulation.score
        );
      }
    } else {
      // if this was the 3rd failed submission, mark failed
      if ((attempt.attempts?.length ?? 0) >= 3) {
        attempt.success = false;
      }
    }

    await attempt.save();

    return { success: isMatch, attempts: attempt.attempts.length, attempt };
  }

  async verifyToken(attemptId: string, token: string) {
    const attempt = await this.attemptModel.findById(attemptId).exec();
    if (!attempt) throw new NotFoundException('Attempt not found');
    return attempt.token === token;
  }

  // Return next hint for the user's active attempt and increment hints_used
  async getHintForUser(userId: string) {
    const attempt = await this.attemptModel.findOne({ user_id: new Types.ObjectId(userId), success: null }).exec();
    if (!attempt) throw new NotFoundException('Active attempt not found for user');

    const simulation = await this.simulationModel.findById(attempt.simulation_id).exec();
    if (!simulation) throw new NotFoundException('Simulation not found');

    const hints: string[] = (simulation as any).hint ?? [];
    const used = attempt.hints_used ?? 0;

    if (!hints || used >= hints.length) {
      return { hint: null, remaining: 0 };
    }

    const hint = hints[used];
    attempt.hints_used = used + 1;
    await attempt.save();

    return { hint, remaining: hints.length - attempt.hints_used };
  }

  // Return hint for a specific attempt (alternative to getHintForUser)
  async getHintForAttempt(attemptId: string) {
    const attempt = await this.attemptModel.findById(attemptId).exec();
    if (!attempt) throw new NotFoundException('Attempt not found');

    const simulation = await this.simulationModel.findById(attempt.simulation_id).exec();
    if (!simulation) throw new NotFoundException('Simulation not found');

    const hints: string[] = (simulation as any).hint ?? [];
    const used = attempt.hints_used ?? 0;

    if (!hints || used >= hints.length) {
      return { hint: null, remaining: 0, message: 'No more hints available' };
    }

    const hint = hints[used];
    attempt.hints_used = used + 1;
    await attempt.save();

    return { hint, remaining: hints.length - attempt.hints_used };
  }

  // Give up on an active attempt (sets success = false)
  async giveUp(attemptId: string) {
    const attempt = await this.attemptModel.findById(attemptId).exec();
    if (!attempt) throw new NotFoundException('Attempt not found');
    
    if (attempt.success !== null) {
      throw new ConflictException('Attempt is already completed or failed');
    }

    attempt.success = false;
    await attempt.save();
    
    return { message: 'Attempt marked as given up', attempt };
  }
}