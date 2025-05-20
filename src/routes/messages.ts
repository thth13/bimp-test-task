import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Repository } from 'typeorm';
import { FileEntity } from '../models/file.model';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';
import { getUserFromAuthHeader } from '../utils/getUserFromAuth';
import { pipeline } from 'stream/promises';

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

  /**
   * @route   GET /messages
   * @desc    Get a paginated list of messages
   * @access  Public
   * @query   page, limit
   */
  fastify.get(
    '/messages',
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
        user: { username: msg.user.username },
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
    '/message/content',
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

      if (message.content) {
        reply.header('Content-Type', 'text/plain');
        return reply.send(message.content);
      }

      if (message.file) {
        const filePath = message.file.path;
        const fileExists = await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false);

        if (!fileExists) {
          return reply.code(404).send({ error: 'File not found' });
        }

        reply.header('Content-Type', message.file.mimetype);
        reply.header('Content-Disposition', `inline; filename="${message.file.filename}"`);
        const fileStream = fsSync.createReadStream(filePath);
        return reply.send(fileStream);
      }

      return reply.code(404).send({ error: 'No content found in message' });
    },
  );

  /**
   * @route   POST /message/file
   * @desc    Upload a file as a message
   * @access  Private
   * @body    multipart/form-data (file)
   */
  fastify.post(
    '/message/file',
    { preHandler: fastify.basicAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const data = await request.file();

      if (!data) {
        return reply.code(400).send({ error: 'No file provided' });
      }

      const { filename, mimetype, file } = data;
      const uploadDir = path.join(__dirname, '..', '..', 'uploads');
      if (!fsSync.existsSync(uploadDir)) {
        fsSync.mkdirSync(uploadDir, { recursive: true });
      }
      const filepath = path.join(uploadDir, `${Date.now()}-${filename}`);

      await pipeline(file, fsSync.createWriteStream(filepath));

      const { size } = await fs.stat(filepath);

      const userRepo = fastify.db.getRepository(User);
      const messageRepo = fastify.db.getRepository(Message);
      const fileRepo = fastify.db.getRepository(FileEntity);

      const user = await getUserFromAuthHeader(request, userRepo);
      if (!user) return reply.code(401).send({ error: 'Unauthorized' });

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
