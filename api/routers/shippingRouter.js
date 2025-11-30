const express = require('express')
const router = express.Router()
const shippingController = require('../controller/shippingController')

/**
 * @route POST /api/shipping/calculate
 * @desc Calculate shipping fee for given city
 * @access Public
 */
router.post('/calculate', shippingController.calculateShippingFee)

/**
 * @route GET /api/shipping/provinces
 * @desc Get all supported provinces with shipping info
 * @access Public
 */
router.get('/provinces', shippingController.getProvinces)

/**
 * @route GET /api/shipping/rates
 * @desc Get shipping rate table
 * @access Public
 */
router.get('/rates', shippingController.getShippingRates)

module.exports = router
