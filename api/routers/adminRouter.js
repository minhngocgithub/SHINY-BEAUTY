const express = require('express')
const router = express.Router()
const adminController = require('../controller/adminController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

// User management routes
router.get('/allUser', authenticate, authorizeAdmin, adminController.getUsers)
router.get('/:id', authenticate, authorizeAdmin, adminController.getUser)
router.put('/update/:id', authenticate, authorizeAdmin, adminController.updateUser)
router.delete('/delete/:id', authenticate, authorizeAdmin, adminController.deleteUser)


// Feature product route
module.exports = router