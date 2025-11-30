const logger = require("../config/logger")

// HTTP request logging middleware
const httpLoggerMiddleware = (req, res, next) => {
    const startTime = Date.now()

    // Capture response data
    const originalJson = res.json
    res.json = function (data) {
        const duration = Date.now() - startTime
        const logMeta = {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get("user-agent"),
            userId: req.user?.id || "anonymous",
        }

        if (res.statusCode >= 400) {
            logger.error(`HTTP ${req.method} ${req.path}`, logMeta)
        } else {
            logger.info(`HTTP ${req.method} ${req.path}`, logMeta)
        }

        return originalJson.call(this, data)
    }

    next()
}

// Error logging middleware
const errorLoggerMiddleware = (err, req, res, next) => {
    logger.error("Unhandled Error", {
        error: err.message,
        stack: err.stack,
        method: req.method,
        path: req.path,
        body: req.body,
        params: req.params,
        userId: req.user?.id || "anonymous",
    })

    res.status(err.statusCode || 500).json({
        error: err.message || "Internal Server Error",
        requestId: req.id,
    })
}

module.exports = {
    httpLoggerMiddleware,
    errorLoggerMiddleware,
}
