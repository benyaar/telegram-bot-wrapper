import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';

@Global()
@Module({
  imports: [
    
    BullModule.registerQueue({
      name: 'main-queue',
    }),
  ],
  providers: [QueueService, QueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
