import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TelegramService } from '../telegram.service';
import { LoggerService } from 'src/module/logger/logger.service';

@Injectable()
export class GetFileLog {
    private readonly MAX_MESSAGE_LENGTH = 500;
    private readonly logDir: string;

    constructor(
        private readonly bot: TelegramService,
        private readonly loggerService: LoggerService,
    ) {
        this.logDir = path.join(process.cwd(), 'logs');
        this.bot.registerCallbackHandler(/^log_(.+)$/, async (msg, match) => {
            if (match) {
                await this.handleLogRequest(match[1]);
            }
        });
    }

    private async handleLogRequest(data: string) {
        const logFile = data.replace('log_', '');
        const logFilePath = path.join(this.logDir, logFile);

        if (data.endsWith('_download')) {
            const cleanFileName = logFile.replace('download', 'log');
            const filePath = path.join(this.logDir, cleanFileName);
            
            try {
                await this.bot.sendDocument(filePath, { caption: `File log: ${cleanFileName}` });
            } catch (error) {
                await this.bot.sendMessage('Error');
            }
        } else {
            try {
                const content = fs.readFileSync(logFilePath, 'utf8');
                const logs = content.trim().split('\n').slice(-5);
                for (const [index, log] of logs.entries()) {
                    const trimmedLog = log.length > this.MAX_MESSAGE_LENGTH
                        ? log.substring(0, this.MAX_MESSAGE_LENGTH - 3) + '...'
                        : log;
                    await this.bot.sendMessage(`#${index + 1}\n${trimmedLog}`);
                }
            } catch (error) {
                await this.bot.sendMessage('Error');
            }
        }
    }

    async getLogFiles(): Promise<string[]> {
        return fs.readdirSync(this.logDir).filter(file => file.endsWith('.log'));
    }

    async telegram(): Promise<void> {
        try {
            const logFiles = await this.getLogFiles();
            const recentLogFiles = logFiles.slice(-10);
            
            const buttons = recentLogFiles.map(file => [
                { text: `📄  ${file}`, callback_data: `log_${file}` },
                { text: `📥  ${file}`, callback_data: `log_${file}_download` }
            ]);
            
            const opts = {
                reply_markup: {
                    inline_keyboard: buttons
                }
            };
            
            await this.bot.sendMessage('Choose log file', opts);
        } catch (error) {
            this.loggerService.error('get_file_log', { error: error.message, stack: error.stack });
            await this.bot.sendMessage("Error");
        }
    }
}
