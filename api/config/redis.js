const Redis = require("ioredis")
const logger = require("./logger")

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  connectTimeout: 10000,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    logger.warn(`Redis retry attempt ${times}, waiting ${delay}ms`)
    return delay
  },
  reconnectOnError(err) {
    const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"]
    if (targetErrors.some(targetError => err.message.includes(targetError))) {
      logger.warn("Redis reconnecting due to error:", err.message)
      return true
    }
    return false
  },
}

const redisClient = new Redis(redisConfig)

const redisPub = new Redis(redisConfig)
const redisSub = new Redis(redisConfig)

redisClient.on("connect", () => {
  logger.info("Redis client connecting...")
})

redisClient.on("ready", () => {
  logger.info("Redis client connected successfully and ready to use")
})

redisClient.on("error", (err) => {
  logger.error("Redis client error:", {
    error: err.message,
    code: err.code,
    stack: err.stack
  })
})

redisClient.on("close", () => {
  logger.warn("Redis client connection closed")
})

redisClient.on("reconnecting", (time) => {
  logger.info(`Redis client reconnecting after ${time}ms`)
})

redisPub.on("connect", () => {
  logger.info("Redis Pub client connected")
})

redisPub.on("error", (err) => {
  logger.error("Redis Pub client error:", err.message)
})

redisSub.on("connect", () => {
  logger.info("Redis Sub client connected")
})

redisSub.on("error", (err) => {
  logger.error("Redis Sub client error:", err.message)
})

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing Redis connections...")
  await redisClient.quit()
  await redisPub.quit()
  await redisSub.quit()
  logger.info("Redis connections closed")
})

module.exports = {
  redisClient,
  redisPub,
  redisSub,
}
