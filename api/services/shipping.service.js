const logger = require("../config/logger")

/**
 * Shipping Service - Calculate shipping fees and delivery time
 * Based on distance from Thuong Tin, Ha Noi warehouse
 */
class ShippingService {
    // Warehouse location
    static WAREHOUSE = {
        name: "Ga Thường Tín",
        city: "Hà Nội",
        lat: 20.5873,
        lng: 105.8589
    }

    // Shipping rate tiers based on distance (km) - IN USD
    // Converted from VND at rate: 1 USD = ~25,000 VND
    static SHIPPING_RATES = [
        { maxKm: 15, fee: 0, zone: "local", baseTime: 1, maxTime: 2 }, // Freeship
        { maxKm: 30, fee: 0.8, zone: "nearby", baseTime: 1, maxTime: 2 }, // 20,000 VND
        { maxKm: 60, fee: 1.4, zone: "nearby", baseTime: 1, maxTime: 2 }, // 35,000 VND
        { maxKm: 120, fee: 2.2, zone: "north", baseTime: 2, maxTime: 3 }, // 55,000 VND
        { maxKm: 300, fee: 3.2, zone: "north_far", baseTime: 3, maxTime: 4 }, // 80,000 VND
        { maxKm: 700, fee: 5.0, zone: "central", baseTime: 4, maxTime: 5 }, // 125,000 VND
        { maxKm: Infinity, fee: 7.0, zone: "south", baseTime: 5, maxTime: 7 } // 175,000 VND (max 8.0 USD)
    ]

    // Vietnam provinces with distances from Thuong Tin
    static PROVINCES = {
        // Miền Bắc
        "Hà Nội": { distance: 15, zone: "local", coordinates: { lat: 21.0285, lng: 105.8542 } },
        "Hà Nam": { distance: 60, zone: "nearby", coordinates: { lat: 20.5835, lng: 105.9230 } },
        "Nam Định": { distance: 85, zone: "nearby", coordinates: { lat: 20.4388, lng: 106.1621 } },
        "Ninh Bình": { distance: 95, zone: "north", coordinates: { lat: 20.2506, lng: 105.9745 } },
        "Hải Dương": { distance: 70, zone: "nearby", coordinates: { lat: 20.9373, lng: 106.3145 } },
        "Hải Phòng": { distance: 120, zone: "north", coordinates: { lat: 20.8449, lng: 106.6881 } },
        "Quảng Ninh": { distance: 160, zone: "north", coordinates: { lat: 21.0064, lng: 107.2925 } },
        "Thái Bình": { distance: 110, zone: "north", coordinates: { lat: 20.4463, lng: 106.3365 } },
        "Hưng Yên": { distance: 35, zone: "nearby", coordinates: { lat: 20.6464, lng: 106.0511 } },
        "Bắc Ninh": { distance: 30, zone: "nearby", coordinates: { lat: 21.1861, lng: 106.0763 } },
        "Bắc Giang": { distance: 55, zone: "nearby", coordinates: { lat: 21.2819, lng: 106.1975 } },
        "Vĩnh Phúc": { distance: 45, zone: "nearby", coordinates: { lat: 21.3608, lng: 105.5474 } },
        "Phú Thọ": { distance: 85, zone: "north", coordinates: { lat: 21.4091, lng: 105.2045 } },
        "Thái Nguyên": { distance: 75, zone: "north", coordinates: { lat: 21.5671, lng: 105.8252 } },

        // Miền Trung
        "Thanh Hóa": { distance: 160, zone: "north_far", coordinates: { lat: 19.8067, lng: 105.7851 } },
        "Nghệ An": { distance: 290, zone: "north_far", coordinates: { lat: 18.6792, lng: 105.6819 } },
        "Hà Tĩnh": { distance: 340, zone: "central", coordinates: { lat: 18.3559, lng: 105.8877 } },
        "Quảng Bình": { distance: 490, zone: "central", coordinates: { lat: 17.4676, lng: 106.6226 } },
        "Quảng Trị": { distance: 590, zone: "central", coordinates: { lat: 16.7443, lng: 107.1857 } },
        "Thừa Thiên Huế": { distance: 660, zone: "central", coordinates: { lat: 16.4637, lng: 107.5908 } },
        "Đà Nẵng": { distance: 760, zone: "central", coordinates: { lat: 16.0544, lng: 108.2022 } },
        "Quảng Nam": { distance: 830, zone: "south", coordinates: { lat: 15.5394, lng: 108.0191 } },
        "Quảng Ngãi": { distance: 880, zone: "south", coordinates: { lat: 15.1214, lng: 108.8044 } },
        "Bình Định": { distance: 1040, zone: "south", coordinates: { lat: 13.7830, lng: 109.2196 } },
        "Phú Yên": { distance: 1130, zone: "south", coordinates: { lat: 13.0882, lng: 109.0929 } },
        "Khánh Hòa": { distance: 1280, zone: "south", coordinates: { lat: 12.2585, lng: 109.0526 } },

        // Tây Nguyên
        "Kon Tum": { distance: 1020, zone: "south", coordinates: { lat: 14.3497, lng: 108.0005 } },
        "Gia Lai": { distance: 1050, zone: "south", coordinates: { lat: 13.9833, lng: 108.0000 } },
        "Đắk Lắk": { distance: 1200, zone: "south", coordinates: { lat: 12.6667, lng: 108.0500 } },
        "Lâm Đồng": { distance: 1420, zone: "south", coordinates: { lat: 11.5753, lng: 108.1429 } },

        // Miền Nam
        "Bình Phước": { distance: 1530, zone: "south", coordinates: { lat: 11.7511, lng: 106.7234 } },
        "Bình Dương": { distance: 1650, zone: "south", coordinates: { lat: 11.3254, lng: 106.4770 } },
        "Đồng Nai": { distance: 1660, zone: "south", coordinates: { lat: 10.9524, lng: 106.8363 } },
        "Hồ Chí Minh": { distance: 1680, zone: "south", coordinates: { lat: 10.8231, lng: 106.6297 } },
        "Tây Ninh": { distance: 1690, zone: "south", coordinates: { lat: 11.3351, lng: 106.1099 } },
        "Long An": { distance: 1720, zone: "south", coordinates: { lat: 10.6957, lng: 106.4104 } },
        "Tiền Giang": { distance: 1760, zone: "south", coordinates: { lat: 10.4493, lng: 106.3420 } },
        "Bến Tre": { distance: 1800, zone: "south", coordinates: { lat: 10.2433, lng: 106.3756 } },
        "Vĩnh Long": { distance: 1850, zone: "south", coordinates: { lat: 10.2396, lng: 105.9571 } },
        "Cần Thơ": { distance: 1900, zone: "south", coordinates: { lat: 10.0452, lng: 105.7469 } },
        "An Giang": { distance: 1970, zone: "south", coordinates: { lat: 10.5215, lng: 105.1258 } },
        "Kiên Giang": { distance: 2020, zone: "south", coordinates: { lat: 10.0125, lng: 105.0809 } },
        "Cà Mau": { distance: 2100, zone: "south", coordinates: { lat: 9.1526, lng: 105.1960 } }
    }

    /**
     * Calculate shipping fee based on city and free shipping status
     * @param {string} city - Province/City name
     * @param {boolean} hasFreeShipping - Whether order has free shipping benefit
     * @param {boolean} isExpress - Express shipping option
     * @returns {Object} { fee, zone, distance, isFree, currency }
     */
    static calculateShippingFee(city, hasFreeShipping = false, isExpress = false) {
        try {
            // Sale Program Free Shipping overrides all
            if (hasFreeShipping) {
                return {
                    fee: 0,
                    zone: "free_shipping_program",
                    distance: 0,
                    isFree: true,
                    currency: "USD",
                    reason: "Sale Program Benefit"
                }
            }

            // Get province data
            const provinceData = this.PROVINCES[city]
            if (!provinceData) {
                logger.warn(`Province not found: ${city}, using default rate`)
                return {
                    fee: 4.0,
                    zone: "unknown",
                    distance: 0,
                    isFree: false,
                    currency: "USD",
                    reason: "Default rate - province not found"
                }
            }

            const distance = provinceData.distance

            // Find appropriate rate tier
            const rateTier = this.SHIPPING_RATES.find(tier => distance <= tier.maxKm)
            let fee = rateTier ? rateTier.fee : 200000

            // Apply express surcharge
            if (isExpress && fee > 0) {
                fee = Math.round(fee * 1.5)
            }

            return {
                fee,
                zone: provinceData.zone,
                distance,
                isFree: fee === 0,
                currency: "USD",
                reason: fee === 0 ? "Nội thành Hà Nội" : "Distance-based",
                isExpress
            }

        } catch (error) {
            logger.error("Error calculating shipping fee:", error)
            return {
                fee: 2.0,
                zone: "error",
                distance: 0,
                isFree: false,
                currency: "USD",
                reason: "Error - default fallback"
            }
        }
    }

    /**
     * Calculate delivery time based on city
     * @param {string} city - Province/City name
     * @param {Date} orderDate - Order placement date
     * @param {boolean} isExpress - Express shipping
     * @returns {Object} { baseTime, maxTime, estimatedDate }
     */
    static calculateDeliveryTime(city, orderDate = new Date(), isExpress = false) {
        try {
            const provinceData = this.PROVINCES[city]
            if (!provinceData) {
                return {
                    baseTime: 5,
                    maxTime: 7,
                    estimatedDate: this.addDays(orderDate, 7),
                    range: "5-7 days"
                }
            }

            const distance = provinceData.distance
            const rateTier = this.SHIPPING_RATES.find(tier => distance <= tier.maxKm)

            let baseTime = rateTier ? rateTier.baseTime : 5
            let maxTime = rateTier ? rateTier.maxTime : 7

            // Express reduces by 1-2 days (but minimum 1 day)
            if (isExpress) {
                baseTime = Math.max(1, baseTime - 1)
                maxTime = Math.max(1, maxTime - 1)
            }

            const estimatedDate = this.addDays(orderDate, maxTime)

            return {
                baseTime,
                maxTime,
                estimatedDate,
                range: baseTime === maxTime ? `${baseTime} days` : `${baseTime}-${maxTime} days`
            }

        } catch (error) {
            logger.error("Error calculating delivery time:", error)
            return {
                baseTime: 5,
                maxTime: 7,
                estimatedDate: this.addDays(orderDate, 7),
                range: "5-7 days"
            }
        }
    }

    /**
     * Get shipping zone information
     * @param {string} city - Province/City name
     * @returns {Object} Zone information
     */
    static getShippingZone(city) {
        const provinceData = this.PROVINCES[city]
        if (!provinceData) {
            return {
                zone: "unknown",
                distance: 0,
                description: "Unknown location"
            }
        }

        const zoneDescriptions = {
            local: "Nội thành Hà Nội",
            nearby: "Vùng lân cận Hà Nội",
            north: "Miền Bắc",
            north_far: "Miền Bắc xa",
            central: "Miền Trung",
            south: "Miền Nam"
        }

        return {
            zone: provinceData.zone,
            distance: provinceData.distance,
            description: zoneDescriptions[provinceData.zone] || "Unknown zone",
            coordinates: provinceData.coordinates
        }
    }

    /**
     * Validate shipping address
     * @param {Object} address - Shipping address
     * @returns {Object} { valid, message }
     */
    static validateShippingAddress(address) {
        if (!address) {
            return { valid: false, message: "Address is required" }
        }

        if (!address.city) {
            return { valid: false, message: "City/Province is required" }
        }

        if (!address.district) {
            return { valid: false, message: "District is required" }
        }

        if (!address.address || !address.fullName || !address.phone) {
            return { valid: false, message: "Complete address information is required" }
        }

        return { valid: true, message: "Address is valid" }
    }

    /**
     * Get comprehensive shipping information
     * @param {string} city - Province/City name
     * @param {boolean} hasFreeShipping - Free shipping benefit
     * @param {boolean} isExpress - Express option
     * @param {Date} orderDate - Order date
     * @returns {Object} Complete shipping info
     */
    static getShippingInfo(city, hasFreeShipping = false, isExpress = false, orderDate = new Date()) {
        const feeInfo = this.calculateShippingFee(city, hasFreeShipping, isExpress)
        const timeInfo = this.calculateDeliveryTime(city, orderDate, isExpress)
        const zoneInfo = this.getShippingZone(city)

        return {
            ...feeInfo,
            ...timeInfo,
            ...zoneInfo,
            warehouse: this.WAREHOUSE
        }
    }

    /**
     * Format shipping fee for display
     * @param {number} fee - Fee amount in USD
     * @returns {string} Formatted string
     */
    static formatShippingFee(fee) {
        if (fee === 0) {
            return "FREESHIP"
        }

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(fee)
    }

    /**
     * Helper: Add days to date
     */
    static addDays(date, days) {
        const result = new Date(date)
        result.setDate(result.getDate() + days)
        return result
    }

    /**
     * Get all provinces list
     * @returns {Array} List of provinces
     */
    static getAllProvinces() {
        return Object.keys(this.PROVINCES).map(name => ({
            name,
            ...this.PROVINCES[name]
        }))
    }

    /**
     * Search provinces by name
     * @param {string} query - Search query
     * @returns {Array} Matching provinces
     */
    static searchProvinces(query) {
        const normalizedQuery = query.toLowerCase().trim()
        return this.getAllProvinces().filter(province =>
            province.name.toLowerCase().includes(normalizedQuery)
        )
    }
}

module.exports = ShippingService
