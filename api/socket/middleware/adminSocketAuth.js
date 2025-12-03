const jwt = require("jsonwebtoken");
const User = require("../../models/user.models");
const logger = require("../../config/logger");

const adminSocketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            logger.warn("[Socket.IO] Admin auth failed: No token provided", {
                socketId: socket.id,
            });
            return next(new Error("Authentication token required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded._id).select("-password");

        if (!user) {
            logger.warn("[Socket.IO] Admin auth failed: User not found", {
                socketId: socket.id,
                userId: decoded._id,
            });
            return next(new Error("User not found"));
        }

        // Check if user is admin
        if (!user.isAdmin) {
            logger.warn("[Socket.IO] Admin auth failed: User is not admin", {
                socketId: socket.id,
                userId: user._id,
                isAdmin: user.isAdmin,
            });
            return next(new Error("Admin access required"));
        }

        // Attach user to socket
        socket.user = user;

        logger.info("[Socket.IO] Admin authenticated successfully", {
            socketId: socket.id,
            userId: user._id,
            email: user.email,
        });

        next();
    } catch (error) {
        logger.error("[Socket.IO] Admin auth error", {
            socketId: socket.id,
            error: error.message,
        });

        if (error.name === "JsonWebTokenError") {
            return next(new Error("Invalid token"));
        }

        if (error.name === "TokenExpiredError") {
            return next(new Error("Token expired"));
        }

        next(new Error("Authentication failed"));
    }
};

module.exports = adminSocketAuth;
