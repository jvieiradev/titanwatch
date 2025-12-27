import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { JaegerSchema } from '../database/entities/JaegerSchema';
import { PilotSchema } from '../database/entities/PilotSchema';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'titanwatch',
  password: process.env.DB_PASSWORD || 'titanwatch_secret',
  database: process.env.DB_NAME || 'jaeger_db',
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [JaegerSchema, PilotSchema],
  migrations: ['dist/migrations/*.js'],
  subscribers: [],
});
