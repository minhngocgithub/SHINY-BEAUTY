const mongoose = require('mongoose');
const { redisClient } = require('../config/redis');
const logger = require('../config/logger');

const healthCheck = async (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
};

const readinessCheck = async (req, res) => {
    const checks = {
        server: {
            status: 'OK',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        },
        database: {
            status: 'UNKNOWN',
            message: ''
        },
        redis: {
            status: 'UNKNOWN',
            message: ''
        }
    };

    let overallStatus = 'OK';
    let statusCode = 200;

    // Check MongoDB connection
    try {
        if (mongoose.connection.readyState === 1) {
            checks.database.status = 'OK';
            checks.database.message = 'Connected';
        } else {
            checks.database.status = 'FAIL';
            checks.database.message = `Connection state: ${mongoose.connection.readyState}`;
            overallStatus = 'FAIL';
            statusCode = 503;
        }
    } catch (error) {
        checks.database.status = 'FAIL';
        checks.database.message = error.message;
        overallStatus = 'FAIL';
        statusCode = 503;
        logger.error('Database health check failed:', error);
    }

    // Check Redis connection
    try {
        if (redisClient.status === 'ready') {
            const pingResult = await redisClient.ping();
            if (pingResult === 'PONG') {
                checks.redis.status = 'OK';
                checks.redis.message = 'Connected';
            } else {
                checks.redis.status = 'FAIL';
                checks.redis.message = 'Ping failed';
                overallStatus = 'FAIL';
                statusCode = 503;
            }
        } else {
            checks.redis.status = 'FAIL';
            checks.redis.message = `Connection status: ${redisClient.status}`;
            overallStatus = 'FAIL';
            statusCode = 503;
        }
    } catch (error) {
        checks.redis.status = 'FAIL';
        checks.redis.message = error.message;
        overallStatus = 'FAIL';
        statusCode = 503;
        logger.error('Redis health check failed:', error);
    }

    res.status(statusCode).json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks
    });
};

const livenessCheck = (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    healthCheck,
    readinessCheck,
    livenessCheck
};
