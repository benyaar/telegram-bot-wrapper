import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/module/logger/logger.service';
/**
 * Service for generating a Telegram keyboard.
 *
 * @example
 * // Single button
 * await getKeyboard.main('Button1');
 *
 * // Multiple buttons (array of strings)
 * await getKeyboard.main(['Button1', 'Button2']);
 *
 * // Multiple buttons (array of objects)
 * await getKeyboard.main([{ name: 'Button1' }, { name: 'Button2' }]);
 */
@Injectable()
export class GetKeyboard {

  constructor(
    private readonly loggerService: LoggerService,
  ) { }

  async main(input: string | string[] | { name: string }[]): Promise<object> {
    try {
      let opts;
      if (typeof input === 'string') {
        opts = [{ name: input }];
      } else if (Array.isArray(input) && typeof input[0] === 'string') {
        opts = input.map(text => ({ name: text }));
      } else if (Array.isArray(input) && typeof input[0] === 'object') {
        opts = input;
      } else {
        throw new Error('Unsupported input type');
      }

      const chunkSize = 5;
      const keyboard = [];
      for (let i = 0; i < opts.length; i += chunkSize) {
        const chunk = opts.slice(i, i + chunkSize).map(e => ({ text: e.name }));
        keyboard.push(chunk);
      }

      const options = {
        reply_markup: {
          keyboard: keyboard,
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };

      return options;
    } catch (error) {
      this.loggerService.error('get_keyboard', {
        error: error.message.toString(),
        stack: error.stack.toString(),
      });
      return;
    }

  }
}