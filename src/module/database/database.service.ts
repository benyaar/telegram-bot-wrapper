import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {}

  async query(query: string, params?: any[]): Promise<any> {
    return this.dataSource.query(query, params);
  }

  async one(query: string, params?: any[]): Promise<any> {
    const res = await this.query(query, params)
    return res?.[0]
  }
}
