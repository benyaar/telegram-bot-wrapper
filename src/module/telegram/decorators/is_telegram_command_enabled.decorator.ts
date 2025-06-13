import { ConfigService } from '@nestjs/config';
/**
 * @summary  - Checks if the permission to update bot commands is enabled in the config
 * @type decorator
 * @alias @IsTelegramComandEnabled()
 * @config telegram.bot_update_command_enabled
 */

export function IsTelegramCommandEnabled() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const configService: ConfigService = this.configService;
      const telegramUpdateCommandEnabled = configService.get<boolean>(
        'telegram.bot_update_command_enabled',
        false
      );
      if (!telegramUpdateCommandEnabled) {
        return;
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}