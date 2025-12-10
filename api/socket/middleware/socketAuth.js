const jwt = require("jsonwebtoken")
const User = require("../../models/user.models")

async function socketAuthMiddleware(socket, next) {
    try {
        const token = socket.handshake.auth.token

        if (!token) {
            console.log('[Socket Auth] No token provided')
            return next(new Error("Authentication token required"))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log('[Socket Auth] Token decoded:', {_id: decoded._id })

        // Try both 'id' and '_id' fields for backward compatibility
        const userId = decoded.id || decoded._id
        if (!userId) {
            console.log('[Socket Auth] No user ID in token payload')
            return next(new Error("Invalid token payload"))
        }

        const user = await User.findById(userId).select("-password")

        if (!user) {
            console.log('[Socket Auth] User not found for ID:', userId)
            return next(new Error("User not found"))
        }

        console.log('[Socket Auth] ✅ User authenticated:', user.email)
        socket.userId = user._id.toString()
        socket.user = user
        socket.isAdmin = user.isAdmin || false

        next()
    } catch (error) {
        console.error('[Socket Auth] Error:', error.message)
        if (error.name === 'JsonWebTokenError') {
            return next(new Error("Invalid token"))
        }
        if (error.name === 'TokenExpiredError') {
            return next(new Error("Token expired"))
        }
        next(new Error("Authentication failed"))
    }
}

module.exports = { socketAuthMiddleware }
