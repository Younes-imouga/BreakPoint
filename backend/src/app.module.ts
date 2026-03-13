import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import envConfig from './config/env.config';

import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database/database.module';

import { AppController } from './app.controller';

import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SimulationsModule } from './simulations/simulations.module';
import { AttemptsModule } from './attempts/attempts.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    DatabaseModule,
    LoggerModule,
    UsersModule,
    AuthModule,
    SimulationsModule,
    AttemptsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
