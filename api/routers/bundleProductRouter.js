const express = require('express')
const router = express.Router()
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')
const upload = require('../config/multer')
const { validateBundleExist,
    validateBundleItems,
    validateBundlePricing,
    checkBundleStock,
    validateBundleCompatibility,
    checkSeasonalRelevance,
    trackBundleViews,
    validateAdminBundleOperation,
    formatBundleResponse
} = require('../middleware/bundle.middleware')
const bundleProductController = require('../controller/bundleController')

// PUBLIC ROUTES - specific routes FIRST
router.get('/all', formatBundleResponse, bundleProductController.getProductBundles)
router.get('/search', formatBundleResponse, bundleProductController.searchBundles)
router.get('/featured', formatBundleResponse, bundleProductController.getFeaturedBundles)

// ADMIN ROUTES - specific routes FIRST
router.get('/admin/all', authenticate, authorizeAdmin, formatBundleResponse, bundleProductController.getAdminBundles)
router.post('/admin/create', authenticate, authorizeAdmin, validateBundleItems, validateBundlePricing, validateBundleCompatibility(), formatBundleResponse, bundleProductController.createProductBundle)
router.post('/admin/upload-image', authenticate, authorizeAdmin, upload.single("image"), bundleProductController.uploadBundleImage)

// CATEGORY/PRODUCT ROUTES
router.get('/category/:categoryId', bundleProductController.getBundlesByCategory)
router.get('/product/:productId', bundleProductController.getBundlesByProduct)

// DYNAMIC ID ROUTES - must be LAST
router.get('/:bundleId', validateBundleExist, trackBundleViews, checkSeasonalRelevance, formatBundleResponse, bundleProductController.getSingleBundle)
router.get('/:bundleId/stock', validateBundleExist, checkBundleStock, bundleProductController.checkBundleStock)
router.put('/:bundleId', authenticate, authorizeAdmin, validateBundleExist, validateAdminBundleOperation, validateBundleItems, validateBundlePricing, validateBundleCompatibility(), formatBundleResponse, bundleProductController.updateProductBundle)
router.delete('/:bundleId', authenticate, authorizeAdmin, validateBundleExist, validateAdminBundleOperation, bundleProductController.deleteProductBundle)
module.exports = router