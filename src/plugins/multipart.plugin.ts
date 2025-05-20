import { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';

export async function registerMultipart(fastify: FastifyInstance) {
  fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });
}
