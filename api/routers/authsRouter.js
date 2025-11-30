const express = require('express')
const router = express.Router()
const authsController = require('../controller/authsController')
const notificationController = require('../controller/notificationController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')
const { authLimiter } = require('../config/rateLimiter')
const upload = require('../config/multer');
// 
router.post('/register', authLimiter, authsController.register)
router.post('/login', authLimiter, authsController.login)

// 
router.get('/profile', authenticate, authsController.getProfile)
router.put('/profile/update', authenticate, authsController.updateMyInfo)
router.post('/logOut', authsController.logOut)

// 
router.post('/password/forgot', authsController.forgotPassword)
router.post('/password/reset/:token', authsController.resetPassword)
router.put('/password/change', authenticate, authsController.changePassword)
router.get('/oauth/urls', authsController.getOAuthUrls);
router.post('/oauth/link', authenticate, authsController.linkOAuthAccount);
router.post('/oauth/unlink', authenticate, authsController.unlinkOAuthAccount);
router.delete('/delete-avatar', authenticate, authsController.deleteAvatar);
router.post('/upload-avatar', upload.single('avatar'), authenticate, authsController.uploadAvatar)

// Address Management Routes
router.get('/addresses', authenticate, authsController.getUserAddresses)
router.post('/addresses', authenticate, authsController.addUserAddress)
router.put('/addresses/:addressId', authenticate, authsController.updateUserAddress)
router.delete('/addresses/:addressId', authenticate, authsController.deleteUserAddress)
router.put('/addresses/:addressId/default', authenticate, authsController.setDefaultAddress)

// User Stats Route
router.get('/stats', authenticate, authsController.getUserStats)

// Notification Preferences Routes
router.get('/notifications/preferences', authenticate, notificationController.getNotificationPreferences)
router.put('/notifications/preferences', authenticate, notificationController.updateNotificationPreferences)

module.exports = router