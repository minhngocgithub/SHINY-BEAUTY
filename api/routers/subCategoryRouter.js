const express = require('express')
const router = express.Router()
const subCategoryController = require('../controller/subCategoryController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

router.get('/all-subcategory', subCategoryController.getSubCategory)
router.get('/search', subCategoryController.searchSubCategories)
router.get('/by-level/:level', subCategoryController.getSubCategoriesByLevel)
router.post('/add-subcategory', authenticate, authorizeAdmin, subCategoryController.addSubCategory)
router.put('/update-subcategory', authenticate, authorizeAdmin, subCategoryController.updateSubCategory)
router.delete('/delete-subcategory', authenticate, authorizeAdmin, subCategoryController.deleteSubCategory)
router.put('/:id/product-count', authenticate, authorizeAdmin, subCategoryController.updateSubCategoryProductCount)

module.exports = router
