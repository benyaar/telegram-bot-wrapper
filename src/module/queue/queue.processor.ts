/**
 * @file queue.processor.ts - queue processor
 * @param {String} job.data.key - key for retrieving data from cache
 * @param {Object} value.bot - bot data from cache
 * @param {Object} value.data - additional parameters
 * @param {Array} value.param.private - private parameters for function call
 * @param {Array} value.param.public  - public parameters for function call
 * @param {Function} value.callbackFunc - function to be called after script execution
 * @return {String} - returns the result of the function execution
 */

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { exec } from 'child-process-promise';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { QueueData } from './interfaces/queque_data.interface';
import { LoggerService } from '../logger/logger.service';

@Processor('main-queue')
export class QueueProcessor extends WorkerHost {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly loggerService: LoggerService
  ) {
    super();
  }

  async process(job: Job) {
    try {
      const value: QueueData | undefined = await this.cacheManager.get(job.data.key);
      if (!value) throw new Error('Value not found');
      this.loggerService.log('QueueProcessor', { status: 'start===', name: job.name, data: job.data, value: value?.script});

      const result = await this.executeScript(value);
      if (value.callbackFunc) await value.callbackFunc(result);
    } catch (error) {
      this.handleError(job, error);
    }
  }

  private async executeScript(value: QueueData) {
    if (!value.script) return { bot: value.bot, data: value.data };

    const process = exec(`${value.script} ${value.param?.public?.join(' ') || ''}`);
    if (value.param?.private?.length) {
      process.childProcess.stdin.write(`${value.param.private.join(' ')}\n`);
      process.childProcess.stdin.end();
    }

    const { stdout, stderr } = await process;
    return { bot: value.bot, data: value.data, stdout, stderr };
  }

  private async handleError(job: Job, error: Error) {
    this.loggerService.error('QueueProcessor', { error: error.message, stack: error.stack });
    const value: QueueData | undefined = await this.cacheManager.get(job.data.key);
    if (value?.bot) {
      await value.bot.sendMessage(`============ Job ${job.name} failed ==============`);
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job) {
    const value: QueueData | undefined = await this.cacheManager.get(job.data.key);
    if (value?.bot) {
      await value.bot.sendMessage(`============ Job ${job.name} failed ==============`);
    }
  }
}
