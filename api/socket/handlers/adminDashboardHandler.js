

const adminDashboardService = require('../../services/adminDashboard.service');
const logger = require('../../config/logger');

function setupAdminDashboard(io, socket) {
    const adminId = socket.user._id;
    const adminEmail = socket.user.email;

    logger.info('Admin dashboard handler registered', { adminId, adminEmail });

    /**
     * Subscribe to dashboard real-time updates
     * Client can specify update interval (default: 5000ms)
     */
    socket.on('admin:dashboard:subscribe', async (options = {}) => {
        try {
            // Join dashboard room for broadcast updates
            socket.join('admin:dashboard');

            // Get initial dashboard data
            const dashboardData = await adminDashboardService.getDashboardStats();

            // Send initial data to client
            socket.emit('admin:dashboard:initial', {
                success: true,
                data: dashboardData,
                timestamp: new Date()
            });

            // Setup interval for periodic updates
            const updateInterval = options.interval || 5000; // Default 5 seconds
            const intervalId = setInterval(async () => {
                try {
                    const updatedData = await adminDashboardService.getDashboardStats();

                    // Broadcast to all admins in dashboard room
                    io.to('admin:dashboard').emit('admin:dashboard:update', {
                        success: true,
                        data: updatedData,
                        updateType: 'scheduled',
                        timestamp: new Date()
                    });
                } catch (error) {
                    logger.error('Dashboard interval update error', {
                        error: error.message
                    });
                }
            }, updateInterval);

            // Store interval ID for cleanup
            socket.data.dashboardInterval = intervalId;

            logger.info('Admin subscribed to dashboard', {
                adminId,
                updateInterval
            });

        } catch (error) {
            logger.error('Dashboard subscribe error', {
                error: error.message,
                adminId
            });

            socket.emit('admin:dashboard:error', {
                success: false,
                message: 'Failed to subscribe to dashboard updates'
            });
        }
    });

    /**
     * Unsubscribe from dashboard updates
     * Cleanup interval and leave room
     */
    socket.on('admin:dashboard:unsubscribe', () => {
        // Clear update interval
        if (socket.data.dashboardInterval) {
            clearInterval(socket.data.dashboardInterval);
            delete socket.data.dashboardInterval;
        }

        // Leave dashboard room
        socket.leave('admin:dashboard');

        socket.emit('admin:dashboard:unsubscribed', {
            success: true,
            message: 'Unsubscribed from dashboard updates'
        });

        logger.info('Admin unsubscribed from dashboard', { adminId });
    });

    /**
     * Request instant dashboard refresh
     * Force recalculation bypassing cache
     */
    socket.on('admin:dashboard:refresh', async () => {
        try {
            // Force refresh (bypass cache)
            const freshData = await adminDashboardService.getDashboardStats(true);

            socket.emit('admin:dashboard:update', {
                success: true,
                data: freshData,
                updateType: 'manual_refresh',
                timestamp: new Date()
            });

            logger.info('Dashboard manually refreshed', { adminId });
        } catch (error) {
            logger.error('Dashboard refresh error', {
                error: error.message,
                adminId
            });

            socket.emit('admin:dashboard:error', {
                success: false,
                message: 'Failed to refresh dashboard'
            });
        }
    });

    /**
     * Cleanup on disconnect
     * Clear intervals and leave rooms
     */
    socket.on('disconnect', () => {
        if (socket.data.dashboardInterval) {
            clearInterval(socket.data.dashboardInterval);
        }
        logger.info('Admin dashboard handler cleanup', { adminId });
    });
}

module.exports = { setupAdminDashboard };
