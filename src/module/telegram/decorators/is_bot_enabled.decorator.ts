import { ConfigService } from "@nestjs/config";

/**
 * @summary  - Checks if the Telegram bot is enabled in the config
 * @type decorator
 * @alias @IsBotEnabled()
 * @config telegram.bot_enabled
 */
export function IsBotEnabled() {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      const originalMethod = descriptor.value;
      
      descriptor.value = function (...args: any[]) {
        
        const configService: ConfigService = this.configService;
        const telegramEnabled = configService.get<boolean>(
          'telegram.bot_enabled',
          false
        ); 
        if (!telegramEnabled) return;
        return originalMethod.apply(this, args);
      };
    };
  }