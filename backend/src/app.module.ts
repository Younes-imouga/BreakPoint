import { Module } from '@nestjs/common';
import envConfig from './config/env.config';

import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database/database.module';

import { AppController } from './app.controller';

import { AppService } from './app.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig]
    }),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
