import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    return this.userModel.create(createUserDto);
  }

  async getUser(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getMyProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        email: dto.email,
        _id: { $ne: user._id },
      }).exec();

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      user.email = dto.email;
    }

    if (typeof dto.name === 'string') {
      user.name = dto.name;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    await user.save();

    const { password: _password, ...result } = user.toObject();
    return result;
  }

  async deleteMyAccount(userId: string) {
    return this.deleteUser(userId);
  }

  async getAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const users = await this.userModel.find().select('-password').skip(skip).limit(limit).exec();
    const total = await this.userModel.countDocuments().exec();
    return {
      data: users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUser(id: string, updateUserDto: any) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password: _password, ...result } = user.toObject();
    return result;
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }

  async changeRole(id: string, role: string) {
    const user = await this.userModel
      .findByIdAndUpdate(id, { role }, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password: _password, ...result } = user.toObject();
    return result;
  }

  async updateUserProgress(userId: string, simulationId: string, score: number) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    // Add simulation to completed list if not already there
    if (!user.completed_simulations.includes(simulationId as any)) {
      user.completed_simulations.push(simulationId as any);
    }

    // Update score and exp
    user.total_score += score;
    user.exp += score;

    // Update badge based on exp
    if (user.exp >= 1000) user.badge = 'EXPERT';
    else if (user.exp >= 500) user.badge = 'ADVANCED';
    else if (user.exp >= 200) user.badge = 'INTERMEDIATE';

    await user.save();
    return user;
  }

  async getUserStats(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .populate('completed_simulations', 'name difficulty score')
      .exec();
    
    if (!user) throw new NotFoundException('User not found');

    return {
      name: user.name,
      email: user.email,
      exp: user.exp,
      total_score: user.total_score,
      badge: user.badge,
      completed_labs: user.completed_simulations.length,
      completed_simulations: user.completed_simulations,
    };
  }

  async getLeaderboard(limit: number = 10) {
    return this.userModel
      .find()
      .select('name total_score exp badge')
      .sort({ total_score: -1 })
      .limit(limit)
      .exec();
  }
}
