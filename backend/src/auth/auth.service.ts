import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { UserService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private generateToken(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(CreateUserDto: CreateUserDto) {
    const { name, email, password } = CreateUserDto;

    // const existingUser = await this.authModel.findOne({ email });
    const existingUser = await this.userService.getUser(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: CreateUserDto = {
      name: name,
      email: email,
      password: hashedPassword,
      role: 'PARTICIPANT',
    };

    const user = await this.userService.createUser(newUser);

    // Remove password from response
    const { password: _, ...result } = user.toObject();
    const token = this.generateToken(user);

    return { user: result, ...token };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.getUser(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password from response
    const { password: _, ...result } = user.toObject();
    const token = this.generateToken(user);

    return { user: result, ...token };
  }
}
