import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronController } from './cron.controller';
import { TelegramModule } from '../telegram/telegram.module';
import * as Funcs from './funcs/_index';

@Module({
  imports: [ScheduleModule.forRoot(), TelegramModule],
  providers: [...Object.values(Funcs)],
  controllers: [CronController],
})
export class CronModule { }
