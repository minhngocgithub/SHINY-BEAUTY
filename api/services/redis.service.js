const { redisClient } = require("../config/redis")

class RedisService {
    // Basic GET/SET operations
    async get(key) {
        try {
            const data = await redisClient.get(key)
            return data ? JSON.parse(data) : null
        } catch (error) {
            console.error(`Redis GET error for key ${key}:`, error)
            return null
        }
    }

    async set(key, value, ttl = 3600) {
        try {
            const serialized = JSON.stringify(value)
            if (ttl) {
                await redisClient.setex(key, ttl, serialized)
            } else {
                await redisClient.set(key, serialized)
            }
            return true
        } catch (error) {
            console.error(`Redis SET error for key ${key}:`, error)
            return false
        }
    }

    async del(key) {
        try {
            await redisClient.del(key)
            return true
        } catch (error) {
            console.error(`Redis DEL error for key ${key}:`, error)
            return false
        }
    }

    async exists(key) {
        try {
            const result = await redisClient.exists(key)
            return result === 1
        } catch (error) {
            console.error(`Redis EXISTS error for key ${key}:`, error)
            return false
        }
    }

    // Pattern operations
    async deletePattern(pattern) {
        try {
            const keys = await redisClient.keys(pattern)
            if (keys.length > 0) {
                await redisClient.del(...keys)
            }
            return keys.length
        } catch (error) {
            console.error(`Redis DELETE PATTERN error for ${pattern}:`, error)
            return 0
        }
    }

    // Hash operations
    async hset(key, field, value) {
        try {
            await redisClient.hset(key, field, JSON.stringify(value))
            return true
        } catch (error) {
            console.error(`Redis HSET error:`, error)
            return false
        }
    }

    async hget(key, field) {
        try {
            const data = await redisClient.hget(key, field)
            return data ? JSON.parse(data) : null
        } catch (error) {
            console.error(`Redis HGET error:`, error)
            return null
        }
    }

    async hgetall(key) {
        try {
            const data = await redisClient.hgetall(key)
            const parsed = {}
            for (const [field, value] of Object.entries(data)) {
                parsed[field] = JSON.parse(value)
            }
            return parsed
        } catch (error) {
            console.error(`Redis HGETALL error:`, error)
            return {}
        }
    }

    // Increment/Decrement
    async incr(key) {
        try {
            return await redisClient.incr(key)
        } catch (error) {
            console.error(`Redis INCR error:`, error)
            return null
        }
    }

    async decr(key) {
        try {
            return await redisClient.decr(key)
        } catch (error) {
            console.error(`Redis DECR error:`, error)
            return null
        }
    }

    async decrby(key, amount) {
        try {
            return await redisClient.decrby(key, amount)
        } catch (error) {
            console.error(`Redis DECRBY error:`, error)
            return null
        }
    }

    async incrby(key, amount) {
        try {
            return await redisClient.incrby(key, amount)
        } catch (error) {
            console.error(`Redis INCRBY error:`, error)
            return null
        }
    }

    // List operations
    async lpush(key, value) {
        try {
            await redisClient.lpush(key, JSON.stringify(value))
            return true
        } catch (error) {
            console.error(`Redis LPUSH error:`, error)
            return false
        }
    }

    async lrange(key, start, stop) {
        try {
            const data = await redisClient.lrange(key, start, stop)
            return data.map((item) => JSON.parse(item))
        } catch (error) {
            console.error(`Redis LRANGE error:`, error)
            return []
        }
    }

    // Set operations
    async sadd(key, member) {
        try {
            await redisClient.sadd(key, member)
            return true
        } catch (error) {
            console.error(`Redis SADD error:`, error)
            return false
        }
    }

    async smembers(key) {
        try {
            return await redisClient.smembers(key)
        } catch (error) {
            console.error(`Redis SMEMBERS error:`, error)
            return []
        }
    }

    // TTL operations
    async expire(key, seconds) {
        try {
            await redisClient.expire(key, seconds)
            return true
        } catch (error) {
            console.error(`Redis EXPIRE error:`, error)
            return false
        }
    }

    async ttl(key) {
        try {
            return await redisClient.ttl(key)
        } catch (error) {
            console.error(`Redis TTL error:`, error)
            return -1
        }
    }
}

module.exports = new RedisService()
