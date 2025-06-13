import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import configuration from '../config/configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CronModule } from './module/cron/cron.module';
import { TelegramModule } from './module/telegram/telegram.module';
import { RequestModule } from './module/request/request.module';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from './module/queue/queue.module';
import { LoggerModule } from './module/logger/logger.module';
import { DatabaseModule } from './module/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.pass'),
        database: configService.get<string>('database.name'),
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 600000
    }),
    EventEmitterModule.forRoot(),
    CronModule,
    TelegramModule,
    RequestModule,
    QueueModule,
    LoggerModule,
    DatabaseModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }


