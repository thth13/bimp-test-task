import { FastifyRequest, FastifyReply } from 'fastify';
import { Repository } from 'typeorm';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';

export async function getUserFromAuthHeader(
  request: FastifyRequest,
  userRepo: Repository<User>,
): Promise<User | null> {
  const authHeader = request.headers.authorization;
  const base64Credentials = authHeader?.split(' ')[1];
  const credentials = Buffer.from(base64Credentials || '', 'base64').toString('utf-8');

  const [username] = credentials.split(':');
  if (!username) return null;
  return await userRepo.findOne({ where: { username } });
}

export async function sendMessageContent(reply: FastifyReply, message: Message) {
  if (message.content) {
    return reply.header('Content-Type', 'text/plain').send(message.content);
  }

  if (message.file) {
    const { path: filePath, mimetype, filename } = message.file;

    try {
      await fs.access(filePath);
    } catch {
      return reply.code(404).send({ error: 'File not found' });
    }

    return reply
      .header('Content-Type', mimetype)
      .header('Content-Disposition', `inline; filename="${filename}"`)
      .send(fsSync.createReadStream(filePath));
  }

  return reply.code(404).send({ error: 'No content found in message' });
}

export async function handleFileUpload(data: any): Promise<{ filepath: string; size: number }> {
  const { filename, file } = data;
  const uploadDir = path.join(__dirname, '..', '..', 'uploads');
  checkDirExists(uploadDir);
  const filepath = path.join(uploadDir, `${Date.now()}-${filename}`);

  await pipeline(file, fsSync.createWriteStream(filepath));

  const { size } = await fs.stat(filepath);

  return { filepath, size };
}

function checkDirExists(dirPath: string) {
  if (!fsSync.existsSync(dirPath)) {
    fsSync.mkdirSync(dirPath, { recursive: true });
  }
}
