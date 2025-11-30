const logger = require("../config/logger");

/**
 * Order Tracking Service - GPS simulation, route generation, timeline tracking
 * Simulates real-time package tracking from warehouse to delivery address
 */
class OrderTrackingService {
    // Warehouse location (Ga Thường Tín, Hà Nội)
    static WAREHOUSE = {
        lat: 20.5873,
        lng: 105.8589,
        address: "Ga Thường Tín, Hà Nội",
    };

    // Tracking status messages
    static STATUS_MESSAGES = {
        PENDING: "Order placed and waiting for confirmation",
        CONFIRMED: "Order confirmed and being prepared",
        PREPARING: "Packing your items with care",
        IN_TRANSIT: "Package is on the way to you",
        OUT_FOR_DELIVERY: "Out for delivery - arriving soon",
        DELIVERED: "Package delivered successfully",
        CANCELLED: "Order has been cancelled",
    };

    /**
     * Generate tracking number
     * Format: TRK{YYYYMMDD}{6-digit-random}
     */
    static generateTrackingNumber() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
        const random = Math.floor(100000 + Math.random() * 900000);
        return `TRK${dateStr}${random}`;
    }

    /**
     * Create initial tracking timeline for new order
     * @param {Object} order - Order document
     * @returns {Array} Timeline array
     */
    static createInitialTimeline(order) {
        const timeline = [
            {
                status: "PENDING",
                message: this.STATUS_MESSAGES.PENDING,
                location: {
                    lat: this.WAREHOUSE.lat,
                    lng: this.WAREHOUSE.lng,
                    address: this.WAREHOUSE.address,
                },
                timestamp: order.createdAt || new Date(),
            },
        ];

        return timeline;
    }

    /**
     * Add timeline event
     * @param {Array} timeline - Current timeline
     * @param {String} status - New status
     * @param {Object} location - Location data (optional)
     * @param {String} customMessage - Custom message (optional)
     * @param {String} updatedBy - User ID who updated (optional)
     * @returns {Array} Updated timeline
     */
    static addTimelineEvent(timeline, status, location = null, customMessage = null, updatedBy = null) {
        const event = {
            status,
            message: customMessage || this.STATUS_MESSAGES[status] || `Status updated to ${status}`,
            timestamp: new Date(),
        };

        if (location) {
            event.location = location;
        } else {
            // Use warehouse as default location
            event.location = {
                lat: this.WAREHOUSE.lat,
                lng: this.WAREHOUSE.lng,
                address: this.WAREHOUSE.address,
            };
        }

        if (updatedBy) {
            event.updatedBy = updatedBy;
        }

        timeline.push(event);
        return timeline;
    }

    /**
     * Generate route waypoints from warehouse to destination
     * @param {Number} destLat - Destination latitude
     * @param {Number} destLng - Destination longitude
     * @param {Number} distance - Distance in km
     * @returns {Array} Array of waypoints
     */
    static generateRoute(destLat, destLng, distance) {
        const waypoints = [];

        // Number of waypoints based on distance (1 per 100km, minimum 2)
        const numWaypoints = Math.max(2, Math.ceil(distance / 100));

        for (let i = 0; i <= numWaypoints; i++) {
            const ratio = i / numWaypoints;

            // Linear interpolation with slight randomness for realism
            const lat = this.WAREHOUSE.lat + (destLat - this.WAREHOUSE.lat) * ratio + (Math.random() - 0.5) * 0.01;
            const lng = this.WAREHOUSE.lng + (destLng - this.WAREHOUSE.lng) * ratio + (Math.random() - 0.5) * 0.01;

            waypoints.push({
                lat: parseFloat(lat.toFixed(6)),
                lng: parseFloat(lng.toFixed(6)),
                progress: Math.round(ratio * 100),
                status: ratio === 0 ? "departed" : ratio === 1 ? "arrived" : "in_transit",
            });
        }

        return waypoints;
    }

    /**
     * Get current location simulation based on order status and time
     * @param {Object} order - Order document with timeline
     * @param {Array} route - Route waypoints
     * @returns {Object} Current location info
     */
    static getCurrentLocation(order, route) {
        if (!order.timeline || order.timeline.length === 0) {
            return {
                lat: this.WAREHOUSE.lat,
                lng: this.WAREHOUSE.lng,
                address: this.WAREHOUSE.address,
                progress: 0,
            };
        }

        const status = order.status;

        // Status-based location logic
        switch (status) {
            case "PENDING":
            case "CONFIRMED":
            case "PREPARING":
                return {
                    lat: this.WAREHOUSE.lat,
                    lng: this.WAREHOUSE.lng,
                    address: this.WAREHOUSE.address,
                    progress: 0,
                };

            case "IN_TRANSIT":
                // Simulate movement based on time elapsed
                const transitStart = order.timeline.find(t => t.status === "IN_TRANSIT")?.timestamp;
                if (!transitStart) return route[0];

                const elapsed = Date.now() - new Date(transitStart).getTime();
                const estimatedDuration = this.calculateEstimatedDuration(order.shippingDistance || 100);
                const progress = Math.min(0.9, elapsed / estimatedDuration); // Max 90% during transit

                const waypointIndex = Math.floor(progress * (route.length - 1));
                return route[waypointIndex] || route[0];

            case "OUT_FOR_DELIVERY":
                // Near destination (90-95%)
                return route[route.length - 2] || route[route.length - 1];

            case "DELIVERED":
                // At destination
                return route[route.length - 1];

            case "CANCELLED":
                // Return last known location
                return order.timeline[order.timeline.length - 1]?.location || {
                    lat: this.WAREHOUSE.lat,
                    lng: this.WAREHOUSE.lng,
                    address: this.WAREHOUSE.address,
                    progress: 0,
                };

            default:
                return route[0];
        }
    }

    /**
     * Calculate estimated delivery duration in milliseconds
     * @param {Number} distance - Distance in km
     * @returns {Number} Duration in milliseconds
     */
    static calculateEstimatedDuration(distance) {
        // Assume average speed of 50 km/h for delivery
        const hours = distance / 50;
        return hours * 60 * 60 * 1000; // Convert to milliseconds
    }

    /**
     * Create complete tracking data for an order
     * @param {Object} order - Order document
     * @param {Object} destinationCoords - { lat, lng, address }
     * @returns {Object} Complete tracking data
     */
    static createTrackingData(order, destinationCoords) {
        try {
            const distance = order.shippingDistance || 100;
            const route = this.generateRoute(
                destinationCoords.lat,
                destinationCoords.lng,
                distance
            );

            const currentLocation = this.getCurrentLocation(order, route);

            return {
                orderId: order._id,
                trackingNumber: order.trackingNumber,
                currentLocation,
                route,
                origin: {
                    lat: this.WAREHOUSE.lat,
                    lng: this.WAREHOUSE.lng,
                    address: this.WAREHOUSE.address,
                },
                destination: destinationCoords,
                estimatedDelivery: order.estimatedDeliveryDate,
                actualDelivery: order.actualDeliveryDate || null,
                distance,
                status: order.status,
                timeline: order.timeline,
            };
        } catch (error) {
            logger.error("Error creating tracking data", {
                error: error.message,
                orderId: order._id,
            });
            throw error;
        }
    }

    /**
     * Update tracking location (for simulated progress)
     * @param {Object} order - Order document
     * @param {Object} newLocation - New location data
     * @returns {Object} Updated tracking info
     */
    static updateTrackingLocation(order, newLocation) {
        const timeline = order.timeline || [];

        timeline.push({
            status: order.status,
            message: `Package location updated - ${newLocation.address || "In transit"}`,
            location: newLocation,
            timestamp: new Date(),
        });

        return {
            timeline,
            currentLocation: newLocation,
        };
    }

    /**
     * Get tracking info summary
     * @param {Object} order - Order document
     * @returns {Object} Tracking summary
     */
    static getTrackingInfo(order) {
        const latestEvent = order.timeline?.[order.timeline.length - 1];

        return {
            trackingNumber: order.trackingNumber,
            status: order.status,
            currentLocation: latestEvent?.location || {
                lat: this.WAREHOUSE.lat,
                lng: this.WAREHOUSE.lng,
                address: this.WAREHOUSE.address,
            },
            lastUpdate: latestEvent?.timestamp || order.createdAt,
            estimatedDelivery: order.estimatedDeliveryDate,
            isDelivered: order.isDelivered,
            deliveredAt: order.deliveredAt,
        };
    }

    /**
     * Validate status transition
     * @param {String} currentStatus - Current order status
     * @param {String} newStatus - New status to transition to
     * @returns {Object} { valid: Boolean, reason: String }
     */
    static validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            PENDING: ["CONFIRMED", "CANCELLED"],
            CONFIRMED: ["PREPARING", "CANCELLED"],
            PREPARING: ["IN_TRANSIT", "CANCELLED"],
            IN_TRANSIT: ["OUT_FOR_DELIVERY", "CANCELLED"],
            OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
            DELIVERED: [], // Terminal state
            CANCELLED: [], // Terminal state
        };

        const allowed = validTransitions[currentStatus] || [];

        if (allowed.includes(newStatus)) {
            return { valid: true };
        }

        return {
            valid: false,
            reason: `Cannot transition from ${currentStatus} to ${newStatus}`,
        };
    }

    /**
     * Calculate delivery progress percentage
     * @param {Object} order - Order document
     * @returns {Number} Progress percentage (0-100)
     */
    static calculateDeliveryProgress(order) {
        const statusProgress = {
            PENDING: 0,
            CONFIRMED: 20,
            PREPARING: 40,
            IN_TRANSIT: 60,
            OUT_FOR_DELIVERY: 80,
            DELIVERED: 100,
            CANCELLED: 0,
        };

        return statusProgress[order.status] || 0;
    }
}

module.exports = OrderTrackingService;
