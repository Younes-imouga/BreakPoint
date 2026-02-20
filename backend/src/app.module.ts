import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import envConfig from './config/env.config';

import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database/database.module';

import { AppController } from './app.controller';

import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { LoggerMiddleware } from './logger/logger.middleware';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig]
    }),
    DatabaseModule,
    LoggerModule
  ],
  controllers: [AppController],
  providers: [AppService, LoggerMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
