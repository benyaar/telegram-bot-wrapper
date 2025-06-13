import { Controller, OnModuleInit } from '@nestjs/common';
import { TelegramService } from '../telegram/telegram.service';
import { ConfigService } from '@nestjs/config';
import { IsBotEnabled } from './decorators/is_bot_enabled.decorator';
import { GetKeyboard, GetFileLog, Example } from './funcs/_index';

@Controller()
export class TelegramController implements OnModuleInit {
  constructor(
    private readonly bot: TelegramService,
    private readonly getFileLog: GetFileLog,
    private readonly configService: ConfigService,
    private readonly getKeyboard: GetKeyboard,
    private readonly example: Example
  ) { }
  private commands = [
    {
      command: 'start',
      description: 'show all commands',
      method: this.showCommands.bind(this),
    },
    {
      command: 'get_file_log',
      description: 'Get log files',
      method: this.getFileLog.telegram.bind(this.getFileLog),
    },
    {
      command: 'example',
      description: 'example',
      method: this.example.telegram.bind(this.example),
    },
    
  ];
  @IsBotEnabled()
  onModuleInit() {
    //add new command in Telegram panel
    this.bot.setCommandsPreserve(this.commands);
    this.commands.forEach(({ command, method }) => {
      const regex = new RegExp(`^/${command}$`);
      this.bot.onText(regex, method);
    });
  }
  private async showCommands(ctx) {
    const values = this.commands.map(e => `/${e.command}`).filter(e=> !e.includes('start'))
    const keyboard = await this.getKeyboard.main(values)
    await this.bot.sendMessage('select command', keyboard);
    return
  }

}
