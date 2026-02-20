import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { LoggerInterceptor } from './logger.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
    imports: [
        WinstonModule.forRoot({
            transports: [
                new winston.transports.File({
                    filename: 'logs/app.log',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.printf(({ timestamp, message }) => {
                            return `${timestamp} : ${message}`;
                        }),
                    ),
                }),
            ]
        })
    ],
    exports: [WinstonModule],
    providers: [
        LoggerInterceptor,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggerInterceptor,
        },

    ]
})

export class LoggerModule { }