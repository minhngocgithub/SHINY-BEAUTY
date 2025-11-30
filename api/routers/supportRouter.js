const express = require("express")
const supportTicketController = require("../controller/supportTicketController")
const { authenticate, authorizeAdmin } = require("../middleware/auth.middleware")

const router = express.Router()

router.post("/", authenticate, supportTicketController.createTicket)
router.get("/", authenticate, supportTicketController.getMyTickets)
router.get("/:id", authenticate, supportTicketController.getTicketDetail)
router.patch("/:id/message", authenticate, supportTicketController.addMessage)
router.patch("/:id/close", authenticate, authorizeAdmin, supportTicketController.closeTicket)
router.patch("/:id/rate", authenticate, supportTicketController.rateTicket)

module.exports = router
