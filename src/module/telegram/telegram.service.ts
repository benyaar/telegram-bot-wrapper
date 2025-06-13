import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';
import { LoggerService } from '../logger/logger.service';
import { Iallowed_users } from './interfaces/allowed_user.interface';
import { IcustomOptions } from './interfaces/custom_options.interface';
import * as path from 'path';
import * as fs from 'fs';
import { OnEvent } from '@nestjs/event-emitter';
import { IsTelegramCommandEnabled } from './decorators/is_telegram_command_enabled.decorator';
import { IsBotEnabled } from './decorators/is_bot_enabled.decorator';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: TelegramBot;
  private chatId?: number;
  private readonly allowedUserIds: Iallowed_users[];
  private readonly token: string;
  private telegramGroupAlersChatId?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
    this.token = this.configService.get<string>('telegram.token');
    this.allowedUserIds = this.configService.get<Iallowed_users[]>('telegram.allowed_users') || [];
    this.telegramGroupAlersChatId = this.configService.get<string>('telegram.group_alert_id');

    this.initializeBot();

  }

  @IsBotEnabled()
  private initializeBot(): void {
    console.log(222222);
    
    this.bot = new TelegramBot(this.token, { polling: true });

  }

  @IsBotEnabled()
  onModuleInit() {
    this.bot.on('callback_query', this.handleCallbackQuery.bind(this));
    this.bot.on('polling_error', console.log);
  }

  private readonly callbackHandlers: { pattern: RegExp | string, handler: (msg: TelegramBot.CallbackQuery, match?: RegExpMatchArray) => void }[] = [];

  // Callback handler for receiving date from buttons
  @IsBotEnabled()
  private handleCallbackQuery(msg: TelegramBot.CallbackQuery) {
    if (!this.isUserAllowed(msg.from.id)) return;

    for (const { pattern, handler } of this.callbackHandlers) {
      if (typeof pattern === 'string' && pattern === msg.data) {
        handler(msg);
        return;
      } else if (pattern instanceof RegExp) {
        const match = msg.data.match(pattern);
        if (match) {
          handler(msg, match);
          return;
        }
      }
    }
  }

  // Check allowed users
  @IsBotEnabled()
  private isUserAllowed(userId: number): boolean {
    return this.allowedUserIds.some(user => user.id === userId);
  }
  // Check allowed commands for user
  @IsBotEnabled()
  private isCommandAllowed(userId: number, command?: string): boolean {
    const user = this.allowedUserIds.find(user => user.id === userId);
    if (!user) return false;
    return user.allowedCommand.includes('*') || (command ? user.allowedCommand.includes(command) : false);
  }

  // General access check
  @IsBotEnabled()
  private checkAllowedUser(msg: TelegramBot.Message | any): boolean {
    if (!this.isUserAllowed(msg.from.id)) {
      this.bot.sendMessage(msg.from.id, '❌ Auth error');
      this.loggerService.error('auth_error', { msg });
      return false;
    }

    if (!this.isCommandAllowed(msg.from.id, msg.text)) {
      this.bot.sendMessage(msg.from.id, '❌ Command not allowed');
      return false;
    }

    this.chatId = msg.from.id;
    return true;
  }

  // Registration of callback functions in bot buttons
  @IsBotEnabled()
  registerCallbackHandler(pattern: RegExp | string, handler: (msg: TelegramBot.CallbackQuery, match?: RegExpMatchArray) => void) {
    this.callbackHandlers.push({ pattern, handler });
  }

  // Method for sending a message if chatID is missing, sends messages from the scheduler to all admins
  @IsBotEnabled()
  private async sendToAllowedUsers(method: 'sendMessage' | 'sendDocument', content: string, options?: TelegramBot.SendMessageOptions | TelegramBot.SendDocumentOptions): Promise<void> {
    const allowedUsers = this.allowedUserIds
      .filter(user => user.allowedCommand.includes('*'))
      .map(user => user.id);

    for (const userId of allowedUsers) {
      if (method === 'sendMessage' && content.length > 4096) {
        await this.sendDocumentToUser(userId, content, options);
      } else {
        await this.bot[method](userId, content, options);
      }
    }
  }
  // Sending as a file if the response exceeds the allowed size
  @IsBotEnabled()
  private async sendDocumentToUser(userId: number, content: string, options?: TelegramBot.SendDocumentOptions): Promise<void> {
    const filePath = path.join(process.cwd(), 'logs', 'response', `doc-${Number(new Date())}.txt`);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
    await fs.promises.writeFile(filePath, content, 'utf-8');
    await this.bot.sendDocument(userId, filePath, options);
  }

  /**
 * Sends a message to the current chat or to all allowed users if chatId is not set.
 * If the message length exceeds 4096 characters, it will be sent as a document.
 * If the "alert" flag is set in options, the message will also be sent to the alert group.
 *
 * @param {string} message - The message text to send.
 * @param {TelegramBot.SendMessageOptions | IcustomOptions} [options] - Additional options for sending the message.
 *   @param {boolean} [options.alert] - If true, sends the message to the alert group as well.
 *   @param {...TelegramBot.SendMessageOptions} [options] - Standard Telegram sendMessage options.
 * @returns {Promise<void>}
 *
 * @example
 * // Send a simple message
 * await telegramService.sendMessage('Hello, user!');
 *
 * // Send a message with Telegram options
 * await telegramService.sendMessage('Hello!', { parse_mode: 'Markdown' });
 *
 * // Send a message and alert the group
 * await telegramService.sendMessage('Critical alert!', { alert: true });
 */
  @IsBotEnabled()
  async sendMessage(message: string, options?: TelegramBot.SendMessageOptions | IcustomOptions): Promise<void> {
    const { alert, ...botOptions } = options as IcustomOptions & TelegramBot.SendMessageOptions || {};
    if (!this.chatId) {
      await this.sendToAllowedUsers('sendMessage', message, botOptions);
    } else {
      if (message.length > 4096) {
        await this.sendDocumentToUser(this.chatId, message, botOptions);
      } else {
        await this.bot.sendMessage(this.chatId, message, botOptions);
      }
    }

    if (alert) {
      await this.bot.sendMessage(this.telegramGroupAlersChatId, message, botOptions);
    }
  }

  /**
 * Sends a document to the current chat or to all allowed users if chatId is not set.
 *
 * @param {string} document - Path to the document or file content to send.
 * @param {TelegramBot.SendDocumentOptions} [options] - Additional options for sending the document.
 * @returns {Promise<void>}
 *
 * @example
 * // Send a document to the current chat
 * await telegramService.sendDocument('/path/to/file.txt');
 *
 * // Send a document with Telegram options
 * await telegramService.sendDocument('/path/to/file.txt', { caption: 'Report' });
 */
  @IsBotEnabled()
  async sendDocument(document: string, options?: TelegramBot.SendDocumentOptions): Promise<void> {
    if (!this.chatId) {
      await this.sendToAllowedUsers('sendDocument', document, options);
    } else {
      await this.bot.sendDocument(this.chatId, document, options);
    }
  }


  // Event handling
  @IsBotEnabled()
  on(event: string, listener: (...args: any[]) => void): void {
    this.bot.on(event, (msg, ...args) => {
      if (this.checkAllowedUser(msg)) {
        listener(msg, ...args);
      }
    });
  }
  // Event handling
  @IsBotEnabled()
  onText(regex: RegExp, listener: (msg: any, match: RegExpExecArray | null) => void): void {
    this.bot.onText(regex, (msg, match) => {
      if (this.checkAllowedUser(msg)) {
        listener(msg, match);
      }
    });
  }

  // Method for waiting for user input
  @IsBotEnabled()
  async once(event: string, listener: (...args: any[]) => void): Promise<void> {
    this.bot.once(event, (msg, ...args) => {
      if (msg?.text?.startsWith('/')) return
      listener(msg, ...args);

    });
  }

  // Registration of commands in the bot at startup
  @IsBotEnabled()
  @IsTelegramCommandEnabled()
  async setCommandsPreserve(
    newCommands: { command: string; description: string }[],
  ): Promise<void> {
    const existingCommands = await this.bot.getMyCommands();

    const combinedCommands = [...existingCommands, ...newCommands];

    const uniqueCommands = Array.from(
      new Set(combinedCommands.map((cmd) => cmd.command)),
    ).map(
      (command) => combinedCommands.find((cmd) => cmd.command === command)!,
    );
    console.log(uniqueCommands);

    await this.bot.setMyCommands(uniqueCommands);
  }

  @IsBotEnabled()
  getBot(): TelegramBot {
    return this.bot;
  }

  // EventEmitter handler

  /**
   * Handles error events and sends a message to Telegram.
   * @param {{ message: string, meta?: object }} param0 - Error event payload.
   */
  @OnEvent('error')
  @IsBotEnabled()
  errorEvent({ message, meta }: { message: string, meta?: object }) {
    this.sendMessage(`Error check - ${message}`);
  }

  /**
   * Handles info events and sends a message to Telegram.
   * @param {{ message: string, meta?: object }} param0 - Info event payload.
   */
  @OnEvent('info')
  @IsBotEnabled()
  infoEvent({ message, meta }: { message: string, meta?: object }) {
    this.sendMessage(message);
  }
}
