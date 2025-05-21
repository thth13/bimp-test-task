import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyBasicAuth from '@fastify/basic-auth';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';

export async function registerBasicAuth(fastify: FastifyInstance) {
  const validate = async (
    username: string,
    password: string,
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const userRepo = fastify.db.getRepository(User);

    const user = await userRepo.findOne({ where: { username } });
    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  };

  fastify.register(fastifyBasicAuth, { validate, authenticate: true });
}
