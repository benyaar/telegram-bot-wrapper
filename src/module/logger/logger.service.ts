import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from 'winston';

@Injectable()
export class LoggerService {
  constructor(@Inject('winston') private readonly logger: Logger) { }

  log(message: string, meta?: object) {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: object) {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: object) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: object) {
    this.logger.debug(message, meta);
  }

  verbose(message: string, meta?: object) {
    this.logger.verbose(message, meta);
  }

  @OnEvent('error')
  errorEvent({ message, meta }: { message: string, meta?: object }) {
    this.error(message, meta)
  }
}
