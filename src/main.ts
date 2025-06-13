import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './module/logger/logger.service';
import { HttpExceptionFilter } from './module/logger/exception.filter';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().get('/', (req, res) => {
    res.send('Welcom on bot v1.0.0');
  });
  app.setGlobalPrefix('api');

  const logger = app.get(LoggerService);
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
});

  process.on('uncaughtException', (error) => {
    logger.error('uncaughtException', {
      error: error.message.toString(),
      stack: error.stack.toString(),
    });
  });

  process.on('unhandledRejection', (error) => {
    console.log(error);
    
    logger.error('unhandledRejection', {
      error: error.toString(),
    });
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 5050);
  await app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}
bootstrap();
