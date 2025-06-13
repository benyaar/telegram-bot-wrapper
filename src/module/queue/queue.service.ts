/**
 * Helper service for working with queues
 * Adds a job to the queue
 *
 * @param {String} name - name of the queue
 * @param {String} data - data for the job execution (only string data is passed)
 * @param {String} value - cached value (needed for passing callback)
 */

import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('main-queue') private readonly queue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly loggerService: LoggerService
  ) {}

  async addJob(name: string, data: Record<string, any>, value: any ) {
    this.loggerService.log('QueueProcessor', { status: 'addJob',  name, data });
    await this.cacheManager.set(data.key, value)
    await this.queue.add(name, data, {
      attempts: 2,
      backoff: 5000,
    });
  }
}
