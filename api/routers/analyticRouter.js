const express = require('express')
const router = express.Router()
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')
const analyticController = require('../controller/analyticController')

router.get('/', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const analyticData = await analyticController.getAnalyticData()
        const endDate = new Date();
		const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const dailySaleData = await analyticController.getDailySaleData(startDate, endDate)
        res.json({
            analyticData,
            dailySaleData
        })
    } catch (error) {
        console.log("Error in analytics route", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
    }
})
router.get('/analytic-turnover', authenticate, authorizeAdmin, analyticController.getAnalyticData)
router.get('/daily-sales', authenticate, authorizeAdmin, analyticController.getDailySaleData)

module.exports = router