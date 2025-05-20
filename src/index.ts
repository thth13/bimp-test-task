import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { registerPlugins } from './plugins/db.plugin';
import { registerBasicAuth } from './plugins/basic-auth.plugin';
import { authRoutes } from './routes/auth';

const fastify: FastifyInstance = Fastify({
  logger: true,
});

fastify.get('/', function (request: FastifyRequest, reply: FastifyReply) {
  reply.status(200);
});

const PORT = Number(process.env.PORT) || 3000;

const start = async () => {
  try {
    await registerPlugins(fastify);
    await registerBasicAuth(fastify);
    await fastify.register(authRoutes);

    await fastify.listen({ port: PORT });
    console.log(`Server listening on ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
