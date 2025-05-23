import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Repository } from 'typeorm';
import { FileEntity } from '../models/file.model';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';
import { getUserFromAuthHeader, handleFileUpload, sendMessageContent } from '../utils';
import {
  createFileMessageBodySchema,
  createFileMessageResponseSchema,
  createTextMessageResponseSchema,
  createTextMessageSchema,
  getMessageContentQuerySchema,
  getMessageContentResponseSchema,
  getMessageQuerySchema,
  getMessageResposneSchema,
} from '../schemas/message.schema';

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

  /**
   * @route   POST /messages/text
   * @desc    Create a text message
   * @access  Private (Basic Auth)
   * @body    { text: string }
   */
  fastify.post(
    '/text',
    {
      preHandler: fastify.basicAuth,
      schema: {
        summary: 'Create a text message',
        tags: ['Messages'],
        security: [{ basicAuth: [] }],
        body: createTextMessageSchema,
        response: {
          201: createTextMessageResponseSchema,
        },
      },
    },
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

  /**
   * @route   GET /message/list
   * @desc    Get a paginated list of messages
   * @access  Public
   * @query   page, limit
   */
  fastify.get(
    '/list',
    {
      schema: {
        summary: 'Get messages',
        tags: ['Messages'],
        querystring: getMessageQuerySchema,
        response: {
          200: getMessageResposneSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: MessagesQuery }>, reply: FastifyReply) => {
      const page = Number(request.query.page) || 1;
      const limit = Number(request.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [messages, total] = await messageRepo.findAndCount({
        relations: ['user', 'file'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      const result = messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        user: msg.user.username,
        file: msg.file,
      }));

      return reply.send({
        page,
        limit,
        total,
        data: result,
      });
    },
  );

  /**
   * @route   GET /message/content
   * @desc    Get raw message content (text or file)
   * @access  Public
   * @query   id
   */
  fastify.get(
    '/content',
    {
      schema: {
        summary: 'Get raw message content (text or file)',
        description: 'Returns the raw content of a message (plain text or file) by message id',
        tags: ['Messages'],
        querystring: getMessageContentQuerySchema,
        response: getMessageContentResponseSchema,
      },
    },
    async (request: FastifyRequest<{ Querystring: { id: string } }>, reply: FastifyReply) => {
      const id = Number(request.query.id);

      if (!id) {
        return reply.code(400).send({ error: 'Message id is required' });
      }

      const message = await messageRepo.findOne({
        where: { id },
        relations: ['file'],
      });

      if (!message) {
        return reply.code(404).send({ error: 'Message not found' });
      }

      return sendMessageContent(reply, message);
    },
  );

  /**
   * @route   POST /message/file
   * @desc    Upload a file as a message
   * @access  Private
   * @body    multipart/form-data (file)
   */
  fastify.post(
    '/file',
    {
      preHandler: fastify.basicAuth,
      schema: {
        summary: 'Upload a file as a message',
        description: 'Uploads a file and creates a message with this file.',
        tags: ['Messages'],
        consumes: ['multipart/form-data'],
        security: [{ basicAuth: [] }],
        body: createFileMessageBodySchema,
        response: createFileMessageResponseSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const data = await request.file();

      if (!data) {
        return reply.code(400).send({ error: 'No file provided' });
      }

      const { filename, mimetype } = data;
      const { filepath, size } = await handleFileUpload(data);

      const userRepo = fastify.db.getRepository(User);
      const messageRepo = fastify.db.getRepository(Message);
      const fileRepo = fastify.db.getRepository(FileEntity);

      const user = await getUserFromAuthHeader(request, userRepo);
      if (!user) {
        return reply.code(401).send({ error: 'User not found' });
      }

      const savedFile = await fileRepo.save(
        fileRepo.create({
          filename,
          path: filepath,
          mimetype,
          size,
          createdAt: new Date(),
        }),
      );

      const message = await messageRepo.save(
        messageRepo.create({
          user,
          file: savedFile,
        }),
      );

      return reply.code(201).send({ message });
    },
  );
}
