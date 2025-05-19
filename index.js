import Fastify from 'fastify'

const fastify = Fastify({
  logger: false
})

fastify.get('/', function (request, reply) {
  reply.status(200)
})


const PORT = process.env.PORT || 3000

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