const jwt = require("jsonwebtoken")
const User = require("../../models/user.models")

async function socketAuthMiddleware(socket, next) {
    try {
        const token = socket.handshake.auth.token

        if (!token) {
            return next(new Error("Authentication token required"))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decoded.id).select("-password")

        if (!user) {
            return next(new Error("User not found"))
        }

        socket.userId = user._id.toString()
        socket.user = user
        socket.isAdmin = user.isAdmin || false

        next()
    } catch (error) {
        next(new Error("Invalid token"))
    }
}

module.exports = { socketAuthMiddleware }
