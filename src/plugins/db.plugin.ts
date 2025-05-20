import { FastifyInstance } from 'fastify';
import { User } from '../models/user.model';
import { DataSource } from 'typeorm';
import { Message } from '../models/message.model';
import { FileEntity } from '../models/file.model';

export async function registerDB(fastify: FastifyInstance) {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '1234567',
    database: process.env.POSTGRES_DB || 'chat-db',
    entities: [User, Message, FileEntity],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    fastify.decorate('db', dataSource);
    fastify.log.info('Database connection established');
  } catch (error) {
    fastify.log.error('Database connection failed', error);
    throw error;
  }
}
