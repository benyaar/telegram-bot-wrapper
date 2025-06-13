
import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/module/logger/logger.service';

@Injectable()
export class ExampleCron {

    constructor(
        private loggerService: LoggerService
    ) {
    }

    async cron(): Promise<string> {
        try {
            return 'start'
        } catch (error) {
            this.loggerService.error('cron_example', {
                error: error.message.toString(),
                stack: error.stack.toString(),
            });

        }
    }
}
