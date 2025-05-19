import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

const fastify: FastifyInstance = Fastify({
  logger: false
})

fastify.get('/', function (request: FastifyRequest, reply: FastifyReply) {
  reply.status(200)
})


const PORT = Number(process.env.PORT) || 3000

const start = async () => {
  try {
    await fastify.listen({ port: PORT })
    console.log(`Server listening on ${PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()