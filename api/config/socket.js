const { Server } = require("socket.io")
const { createAdapter } = require("@socket.io/redis-adapter")
const { redisPub, redisSub } = require("./redis")

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  io.adapter(createAdapter(redisPub, redisSub))

  console.log("Socket.IO initialized with Redis adapter")

  return io
}

module.exports = { initializeSocket }
