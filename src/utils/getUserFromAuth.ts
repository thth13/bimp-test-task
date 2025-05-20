import { FastifyRequest } from 'fastify';
import { Repository } from 'typeorm';
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
