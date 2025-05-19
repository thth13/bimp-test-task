import { FastifyInstance } from 'fastify';
import { DataSource } from 'typeorm';

export async function registerPlugins(app: FastifyInstance) {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'chat_db',
    entities: [],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    app.decorate('db', { dataSource });
    app.log.info('Database connection established');
  } catch (error) {
    app.log.error('Database connection failed', error);
    throw error;
  }
}