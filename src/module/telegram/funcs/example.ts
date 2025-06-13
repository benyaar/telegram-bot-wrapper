import { TelegramService } from '../telegram.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'src/module/logger/logger.service';
import { QueueService } from 'src/module/queue/queue.service';
import { EventEmitter2 } from '@nestjs/event-emitter';


@Injectable()
export class Example {
  constructor(
    private bot: TelegramService,
    private configService: ConfigService,
    private loggerService: LoggerService,
    private quequeService: QueueService,
    private eventEmitter: EventEmitter2
  ) {
    this.bot.registerCallbackHandler("bEM5p7uA", () => this.main('select1'))
    this.bot.registerCallbackHandler("GS6m7b68nV", () => this.main('select2'))
    this.bot.registerCallbackHandler("K28Nv75uvX", () => this.main('select3'))
  }



  async telegram(): Promise<void> {
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Select1', callback_data: 'bEM5p7uA' },
            { text: 'Select2', callback_data: 'GS6m7b68nV' },
          ],
          [{ text: 'Select3', callback_data: 'K28Nv75uvX' }],
        ],
      },
    };
    await this.bot.sendMessage('Choose option', options);
  }



  async main(name: string): Promise<void> {
    try {
      //send message
      await this.bot.sendMessage(name);

      //add queue operation
      const key = `${name}=${Number(new Date())}`
      const value = {
        script: '',
        bot: this.bot,
        callbackFunc: async ({ stdout, bot }) => {
          const result = stdout ? stdout?.substring(stdout.length - 3000, stdout.length) : 'no script'
          await bot.sendMessage(result)
        }
      }
      await this.quequeService.addJob('Example', { key }, value)




    } catch (error) {
      //add logger
      // this.loggerService.error('get_cpu_server', {
      //   error: error.message.toString(),
      //   stack: error.stack.toString(),
      // });
      // await this.bot.sendMessage(`error ${name}`);
      
      // or Emit (logger + send message)
      const payload = {
        message: 'Example',
        meta: {
          stack: error.stack,
          error: error.message
        }
      }
      await this.eventEmitter.emitAsync('error', payload);
    }
  }
}
