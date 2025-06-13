/**
 * Decorator for executing a cron task only if the class property cronEnabled is not equal to false
 */
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

export function CronIfEnabled(cronExpression: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const configService: ConfigService = this.configService;
      this.cronEnabled = configService.get<boolean>('cron_enabled');
      if (this.cronEnabled !== false) {
        originalMethod.apply(this, args);
      }
    };

    Cron(cronExpression)(target, propertyKey, descriptor);
  };
}