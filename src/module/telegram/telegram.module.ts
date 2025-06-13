import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import * as Funcs from './funcs/_index';
import { TelegramController } from './telegram.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [ DatabaseModule],
  controllers: [TelegramController],
  providers: [TelegramService, ...Object.values(Funcs)],
  exports: [TelegramService, ...Object.values(Funcs)],
})
export class TelegramModule {}
