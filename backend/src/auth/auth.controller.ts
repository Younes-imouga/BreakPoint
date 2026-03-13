import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() RegisterDto: CreateUserDto) {
    return this.authService.register(RegisterDto);
  }

  @Post('login')
  login(@Body() LoginDto: LoginDto) {
    return this.authService.login(LoginDto);
  }
}
