import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [],
  providers: [DatabaseService],
  exports: [DatabaseService]
})
export class DatabaseModule {}
