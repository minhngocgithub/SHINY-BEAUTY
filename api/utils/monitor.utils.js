const { redisClient } = require("../config/redis")

class Monitor {
    static async getStats() {
        try {
            const info = await redisClient.info()
            const dbSize = await redisClient.dbsize()

            return {
                redis: {
                    connected: redisClient.status === "ready",
                    dbSize,
                    memory: this.parseMemory(info),
                    info: this.parseInfo(info),
                },
            }
        } catch (error) {
            console.error("Monitor stats error:", error)
            return { error: "Failed to get stats" }
        }
    }

    static parseMemory(info) {
        const match = info.match(/used_memory_human:(.+)/)
        return match ? match[1].trim() : "unknown"
    }

    static parseInfo(info) {
        const lines = info.split("\r\n")
        const parsed = {}

        lines.forEach((line) => {
            if (line && !line.startsWith("#")) {
                const [key, value] = line.split(":")
                if (key && value) {
                    parsed[key] = isNaN(value) ? value : Number(value)
                }
            }
        })

        return parsed
    }

    static async clearCache(pattern = "*") {
        try {
            const keys = await redisClient.keys(pattern)
            if (keys.length > 0) {
                await redisClient.del(...keys)
            }
            return keys.length
        } catch (error) {
            console.error("Clear cache error:", error)
            return 0
        }
    }

    static async getKeysByPattern(pattern) {
        try {
            return await redisClient.keys(pattern)
        } catch (error) {
            console.error("Get keys error:", error)
            return []
        }
    }

    static async getKeyTTL(key) {
        try {
            return await redisClient.ttl(key)
        } catch (error) {
            console.error("Get TTL error:", error)
            return -1
        }
    }
}

module.exports = Monitor
