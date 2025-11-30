const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');
const { initializeCronJobs } = require('./jobs/index')
dotenv.config();
const http = require('http');
const passport = require('./config/passport');
const logger = require('./config/logger');
const { httpLoggerMiddleware, errorLoggerMiddleware } = require('./middleware/logger.middleware');
const { sanitizeInput } = require('./middleware/validation.middleware');
const { initializeSocket } = require("./config/socket")
const { initializeSocketHandlers } = require("./socket")
const { redisClient } = require("./config/redis")
const { apiLimiter } = require('./config/rateLimiter')
const { errorHandler, asyncHandler } = require("./middleware/errorHandler.middleware")
const app = express();
const server = http.createServer(app);

// Import routers
const healthRouter = require('./routers/healthRouter');
const authsRouter = require('../api/routers/authsRouter');
const otpRouter = require('../api/routers/otpRouter');
const adminRouter = require('../api/routers/adminRouter');
const productRouter = require('../api/routers/productRouter');
const orderRouter = require('../api/routers/orderRouter');
const couponRouter = require('../api/routers/couponRouter');
const paymentRouter = require('../api/routers/paymentRouter');
const cartRouter = require('../api/routers/cartRouter');
const categoryRouter = require('../api/routers/categoryRouter');
const subCategoryRouter = require('../api/routers/subCategoryRouter');
const oauthRouter = require('../api/routers/oauthRouter');
const bundleProductRouter = require('../api/routers/bundleProductRouter');
const saleProgramRouter = require('../api/routers/saleProgramRouter');
const feedbackRouter = require('./routers/feedbackRouter')
const reviewRouter = require('./routers/reviewRouter')
const wishlistRouter = require('./routers/wishlistRouter')
const loyaltyRouter = require('./routers/loyaltyRouter')
const shippingRouter = require('./routers/shippingRouter')
const analyticRouter = require('./routers/analyticRouter')
const inventoryRouter = require('./routers/inventoryRouter')
// Connect DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.CONNECT_DB_URL, {
            autoIndex: process.env.NODE_ENV !== 'production',
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger.info('MongoDB connected successfully');
        if (process.env.NODE_ENV === 'production') {
            logger.info('Creating database indexes...');
            await mongoose.connection.db.collection('users').createIndexes([
                { key: { email: 1 }, unique: true },
                { key: { 'loyaltyProfile.tier': -1 } },
                { key: { 'loyaltyProfile.totalSpent': -1 } }
            ]);
            await mongoose.connection.db.collection('products').createIndexes([
                { key: { slug: 1 }, unique: true },
                { key: { category: 1 } },
                { key: { brand: 1 } },
                { key: { price: 1 } },
                { key: { featured: 1 } },
                { key: { createdAt: -1 } }
            ]);
            await mongoose.connection.db.collection('orders').createIndexes([
                { key: { user: 1, createdAt: -1 } },
                { key: { orderStatus: 1 } },
                { key: { createdAt: -1 } }
            ]);
            logger.info('Database indexes created successfully');
        }
    } catch (error) {
        logger.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};
connectDB();

// Compression Middleware - Enable gzip compression
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6
}));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
}))

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(bodyParser.json({ limit: "50MB" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(sanitizeInput);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());
const io = initializeSocket(server)
initializeSocketHandlers(io)
app.set("io", io)

app.use('/', healthRouter);

app.use("/api/v1", apiLimiter)
app.use('/api/v1/users', authsRouter);
app.use('/api/v1/otp', otpRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/coupon', couponRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/subCategory', subCategoryRouter);
app.use('/api/v1/auth/oauth', oauthRouter);
app.use('/api/v1/sale-programs', saleProgramRouter);
app.use('/api/v1/bundle', bundleProductRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/loyalty', loyaltyRouter);
app.use('/api/v1/shipping', shippingRouter);
app.use('/api/v1/analytics', analyticRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.get('/test', (req, res) => {
    res.json('test ok');
})

app.use(errorLoggerMiddleware)
app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
    // Initialize Cron Jobs
    initializeCronJobs();

    // Start Server
    const PORT = process.env.PORT || 4000
    server.listen(PORT, () => {
        logger.info(`Server is starting at PORT: ${PORT}`)
        logger.info(`Socket.IO ready for connections`)
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
        logger.info(`Health check available at http://localhost:${PORT}/health`)
    })
}

module.exports = { app, server };

const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received, starting graceful shutdown...`);
    server.close(async () => {
        logger.info('HTTP server closed');

        try {
            logger.info('Closing Socket.IO connections...');
            const io = server._io || app.get("io");
            if (io) {
                io.close(() => {
                    logger.info('Socket.IO connections closed');
                });
            }
            // Close MongoDB connection
            logger.info('Closing MongoDB connection...');
            await mongoose.connection.close();
            logger.info('MongoDB connection closed');

            // Close Redis connections
            logger.info('Closing Redis connections...');
            await redisClient.quit();
            logger.info('Redis connections closed');

            logger.info('Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            logger.error('Error during graceful shutdown:', error);
            process.exit(1);
        }
    });
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack
    });
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', {
        promise,
        reason: reason?.message || reason,
        stack: reason?.stack
    })
})