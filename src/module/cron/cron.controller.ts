/**
 * Manage cron
 */
// * * * * * *
// | | | | | |
// | | | | | day of week
// | | | | months
// | | | day of month
// | | hours
// | minutes
// seconds (optional)
// * * * * * *	        every second
// 45 * * * * *	        every minute, on the 45th second
// 0 10 * * * *      	every hour, at the start of the 10th minute
// 0 */30 9-17 * * *	every 30 minutes between 9am and 5pm
// 0 30 11 * * 1-5      Monday to Friday at 11:30am

import { Controller } from '@nestjs/common';
import { CronIfEnabled } from './decorators/is_cron_enabled';
import { ExampleCron } from './funcs/example';

@Controller()
export class CronController {
 
  constructor(
    private exampleCron: ExampleCron, 
  ) {
  }
  @CronIfEnabled('*/60 * * * * *')
  async start() {
    await this.exampleCron.cron()
  }
}
