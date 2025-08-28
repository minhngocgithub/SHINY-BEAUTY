const express = require('express')
const router = express.Router()
const productController = require('../controller/productController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

// Specific routes must come before parameterized routes
router.get('/searchProduct', authenticate, productController.searchProduct)
router.get('/featureProduct', authenticate ,productController.getFeartureProduct)
router.get('/newProduct', productController.getNewProduct)
router.get('/bestSeller', authenticate, productController.getBestSeller)
router.get('/allProduct', authenticate, authorizeAdmin, productController.getAllProducts)

// Parameterized route must come last
router.get('/:id', productController.getProduct)

router.post('/addProduct', authenticate, authorizeAdmin, productController.createProduct)
router.put('/updateProduct/:id', authenticate, authorizeAdmin, productController.updateProduct)
router.delete('/:id', authenticate, authorizeAdmin, productController.deleteProduct)

module.exports = router