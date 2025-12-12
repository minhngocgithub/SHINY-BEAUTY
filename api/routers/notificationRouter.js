const express = require("express")
const notificationController = require("../controller/notificationController")
const { authenticate, authorizeAdmin } = require("../middleware/auth.middleware")

const router = express.Router()
router.get("/", authenticate, notificationController.getNotifications)
router.patch("/:notificationId/read", authenticate, notificationController.markAsRead)
router.patch("/mark-all-read", authenticate, notificationController.markAllAsRead)
router.delete("/clear-all", authenticate, notificationController.clearAll)
router.get("/preferences", authenticate, notificationController.getNotificationPreferences)
router.put("/preferences", authenticate, notificationController.updateNotificationPreferences)

module.exports = router
