import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { registerDB } from './plugins/db.plugin';
import { registerBasicAuth } from './plugins/basic-auth.plugin';
import { authRoutes } from './routes/auth';
import { messageRoutes } from './routes/messages';
import { registerMultipart } from './plugins/multipart.plugin';
import { messageSchema } from './schemas/message.schema';
import { fileEntitySchema } from './schemas/file.schema';
import { userSchema } from './schemas/user.schema';

const fastify: FastifyInstance = Fastify({
  logger: true,
});

fastify.get('/', function (request: FastifyRequest, reply: FastifyReply) {
  reply.status(200);
});

const PORT = Number(process.env.PORT) || 3000;

const start = async () => {
  try {
    await registerDB(fastify);
    await registerBasicAuth(fastify);
    await registerMultipart(fastify);

    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Bimp API',
          description: 'API documentation',
          version: '1.0.0',
        },
        components: {
          securitySchemes: {
            basicAuth: {
              type: 'http',
              scheme: 'basic',
            },
          },
        },
      },
    });
    await fastify.register(swaggerUI, {
      routePrefix: '/docs',
    });
    fastify.addSchema(fileEntitySchema);
    fastify.addSchema(userSchema);
    fastify.addSchema(messageSchema);

    await fastify.register(authRoutes, { prefix: '/account' });
    await fastify.register(messageRoutes, { prefix: '/message' });

    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server listening on ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
