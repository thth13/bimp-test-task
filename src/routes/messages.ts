import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Repository } from 'typeorm';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';
import { getUserFromAuthHeader } from '../utils/getUserFromAuth';

interface CreateMessageBody {
  text: string;
}

interface MessagesQuery {
  page?: string;
  limit?: string;
}

export async function messageRoutes(fastify: FastifyInstance) {
  const messageRepo: Repository<Message> = fastify.db.getRepository(Message);
  const userRepo: Repository<User> = fastify.db.getRepository(User);

  fastify.post(
    '/messages/text',
    { preHandler: fastify.basicAuth },
    async (request: FastifyRequest<{ Body: CreateMessageBody }>, reply: FastifyReply) => {
      const { text } = request.body;

      if (!text) {
        return reply.code(400).send({ error: 'Text is required' });
      }

      const user = await getUserFromAuthHeader(request, userRepo);
      if (!user) {
        return reply.code(401).send({ error: 'User not found' });
      }

      const newMessage = messageRepo.create({ content: text, user });
      await messageRepo.save(newMessage);

      return reply.code(201).send(newMessage);
    },
  );

  fastify.get(
    '/messages',
    async (request: FastifyRequest<{ Querystring: MessagesQuery }>, reply: FastifyReply) => {
      const page = Number(request.query.page) || 1;
      const limit = Number(request.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [messages, total] = await messageRepo.findAndCount({
        relations: ['user'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      const result = messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        user: { username: msg.user.username },
      }));

      return reply.send({
        page,
        limit,
        total,
        data: result,
      });
    },
  );

  fastify.get(
    '/message/content',
    async (request: FastifyRequest<{ Querystring: { id: string } }>, reply: FastifyReply) => {
      const id = Number(request.query.id);
      if (!id) {
        return reply.code(400).send({ error: 'Message id is required' });
      }

      const message = await messageRepo.findOne({ where: { id } });

      if (!message) {
        return reply.code(404).send({ error: 'Message not found' });
      }

      reply.header('Content-Type', 'text/plain');
      return reply.send(message.content);
    },
  );
}
