const ShippingService = require("../services/shipping.service")
const logger = require("../config/logger")

/**
 * Calculate shipping fee for a given address
 * @route POST /api/shipping/calculate
 */
const calculateShippingFee = async (req, res) => {
    try {
        const { city, hasFreeShipping = false, isExpress = false } = req.body

        if (!city) {
            return res.status(400).json({
                success: false,
                message: "City/Province is required"
            })
        }

        logger.info(`🚚 Calculating shipping for: ${city}`)

        const shippingResult = ShippingService.calculateShippingFee(
            city,
            hasFreeShipping,
            isExpress
        )

        const deliveryTime = ShippingService.calculateDeliveryTime(city, new Date(), isExpress)

        // Format delivery estimate in Vietnamese
        const deliveryEstimate = deliveryTime.range.replace('days', 'ngày').replace('day', 'ngày')

        return res.status(200).json({
            success: true,
            data: {
                ...shippingResult,
                deliveryEstimate
            }
        })
    } catch (error) {
        logger.error("Error calculating shipping fee:", error)
        return res.status(500).json({
            success: false,
            message: "Error calculating shipping fee",
            error: error.message
        })
    }
}

/**
 * Get list of all supported provinces with shipping info
 * @route GET /api/shipping/provinces
 */
const getProvinces = async (req, res) => {
    try {
        const provinces = Object.keys(ShippingService.PROVINCES).map(name => ({
            name,
            distance: ShippingService.PROVINCES[name].distance,
            zone: ShippingService.PROVINCES[name].zone,
            estimatedFee: ShippingService.calculateShippingFee(name).fee
        }))

        return res.status(200).json({
            success: true,
            provinces,
            warehouse: ShippingService.WAREHOUSE
        })
    } catch (error) {
        logger.error("Error getting provinces:", error)
        return res.status(500).json({
            success: false,
            message: "Error getting provinces",
            error: error.message
        })
    }
}

/**
 * Get shipping rates table
 * @route GET /api/shipping/rates
 */
const getShippingRates = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            rates: ShippingService.SHIPPING_RATES,
            warehouse: ShippingService.WAREHOUSE
        })
    } catch (error) {
        logger.error("Error getting shipping rates:", error)
        return res.status(500).json({
            success: false,
            message: "Error getting shipping rates",
            error: error.message
        })
    }
}

module.exports = {
    calculateShippingFee,
    getProvinces,
    getShippingRates
}
