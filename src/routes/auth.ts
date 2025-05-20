import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';

interface RegisterBody {
  username: string;
  password: string;
}

export async function authRoutes(fastify: FastifyInstance) {
  const userRepo: Repository<User> = fastify.db.getRepository(User);

  fastify.post(
    '/register',
    async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
      const { username, password } = request.body;

      const existingUser = await userRepo.findOne({ where: { username } });
      if (existingUser) {
        return reply.code(400).send({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = userRepo.create({ username, password: hashedPassword });
      await userRepo.save(newUser);

      return reply.send(newUser);
    },
  );
}
