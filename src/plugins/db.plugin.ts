import { FastifyInstance } from 'fastify';
import { User } from '../models/user.model';
import { DataSource } from 'typeorm';
import { Message } from '../models/message.model';
import { File } from '../models/file.model';

export async function registerPlugins(app: FastifyInstance) {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '1234567',
    database: process.env.POSTGRES_DB || 'chat-db',
    entities: [User, Message, File],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    app.decorate('db', dataSource);
    app.log.info('Database connection established');
  } catch (error) {
    app.log.error('Database connection failed', error);
    throw error;
  }
}