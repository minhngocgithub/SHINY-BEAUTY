const logger = require("../config/logger")
const { asyncHandler, AppError } = require("../middleware/errorHandler")
const NotificationService = require("../services/notification.service")
const SupportTicket = require("../models/supportTicket.models")

const createTicket = asyncHandler(async (req, res) => {
    const { subject, category, description, relatedOrder, relatedProduct } = req.body

    if (!subject || !category || !description) {
        throw new AppError("Subject, category, and description are required", 400)
    }

    const ticket = new SupportTicket({
        user: req.user._id,
        subject,
        category,
        description,
        relatedOrder: relatedOrder || null,
        relatedProduct: relatedProduct || null,
    })

    await ticket.save()

    logger.info("Support ticket created", {
        ticketNumber: ticket.ticketNumber,
        userId: req.user._id,
        category,
    })

    const io = req.app.get("io")
    if (io) {
        await NotificationService.createNotification(req.user._id, {
            type: "SUPPORT_TICKET_CREATED",
            title: "Support Ticket Created",
            message: `Your support ticket ${ticket.ticketNumber} has been created`,
            data: {
                ticketId: ticket._id,
                ticketNumber: ticket.ticketNumber,
            },
        })
    }

    res.status(201).json({
        success: true,
        ticket,
    })
})

const getMyTickets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query

    const filter = { user: req.user._id }
    if (status) filter.status = status

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const tickets = await SupportTicket.find(filter)
        .populate("relatedOrder", "orderNumber totalPrice")
        .populate("relatedProduct", "name price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number.parseInt(limit))

    const total = await SupportTicket.countDocuments(filter)

    res.status(200).json({
        success: true,
        count: tickets.length,
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        tickets,
    })
})

const getTicketDetail = asyncHandler(async (req, res) => {
    const ticket = await SupportTicket.findById(req.params.id).populate("messages.senderId", "name email")

    if (!ticket) {
        throw new AppError("Ticket not found", 404)
    }

    if (ticket.user.toString() !== req.user._id.toString() && req.user?.role !== "admin") {
        throw new AppError("Unauthorized", 403)
    }

    res.status(200).json({
        success: true,
        ticket,
    })
})

const addMessage = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { message, attachments = [] } = req.body

    if (!message) {
        throw new AppError("Message is required", 400)
    }

    const ticket = await SupportTicket.findById(id)

    if (!ticket) {
        throw new AppError("Ticket not found", 404)
    }

    if (ticket.user.toString() !== req.user._id.toString() && req.user?.role !== "admin") {
        throw new AppError("Unauthorized", 403)
    }

    const newMessage = {
        sender: req.user?.role === "admin" ? "SUPPORT" : "USER",
        senderName: req.user.name,
        senderId: req.user._id,
        message,
        attachments,
    }

    ticket.messages.push(newMessage)

    // Auto-update status if customer replied
    if (ticket.status === "WAITING_CUSTOMER" && req.user?.role !== "admin") {
        ticket.status = "IN_PROGRESS"
    }

    await ticket.save()

    logger.info("Message added to support ticket", {
        ticketNumber: ticket.ticketNumber,
        userId: req.user._id,
    })

    const io = req.app.get("io")
    if (io) {
        // Notify support team if customer sent message
        if (req.user?.role !== "admin") {
            io.to("support-team").emit("ticket:message", {
                ticketId: ticket._id,
                ticketNumber: ticket.ticketNumber,
            })
        } else {
            // Notify customer if support responded
            await NotificationService.createNotification(ticket.user, {
                type: "SUPPORT_TICKET_REPLY",
                title: "Support Response",
                message: `Support team replied to ticket ${ticket.ticketNumber}`,
                data: {
                    ticketId: ticket._id,
                    ticketNumber: ticket.ticketNumber,
                },
            })
        }
    }

    res.status(200).json({
        success: true,
        ticket,
    })
})

const closeTicket = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { resolution } = req.body

    const ticket = await SupportTicket.findById(id)

    if (!ticket) {
        throw new AppError("Ticket not found", 404)
    }

    if (req.user?.role !== "admin") {
        throw new AppError("Only admin can close tickets", 403)
    }

    ticket.status = "CLOSED"
    ticket.resolution = resolution || "Ticket closed"
    ticket.closedAt = new Date()

    await ticket.save()

    logger.info("Support ticket closed", {
        ticketNumber: ticket.ticketNumber,
        closedBy: req.user._id,
    })

    const io = req.app.get("io")
    if (io) {
        await NotificationService.createNotification(ticket.user, {
            type: "SUPPORT_TICKET_CLOSED",
            title: "Ticket Closed",
            message: `Your support ticket ${ticket.ticketNumber} has been closed`,
            data: {
                ticketId: ticket._id,
                ticketNumber: ticket.ticketNumber,
            },
        })
    }

    res.status(200).json({
        success: true,
        ticket,
    })
})

const rateTicket = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { score, feedback } = req.body

    if (!score || score < 1 || score > 5) {
        throw new AppError("Score must be between 1 and 5", 400)
    }

    const ticket = await SupportTicket.findById(id)

    if (!ticket) {
        throw new AppError("Ticket not found", 404)
    }

    if (ticket.user.toString() !== req.user._id.toString()) {
        throw new AppError("Unauthorized", 403)
    }

    ticket.rating = {
        score,
        feedback: feedback || "",
        ratedAt: new Date(),
    }

    await ticket.save()

    logger.info("Support ticket rated", {
        ticketNumber: ticket.ticketNumber,
        score,
    })

    res.status(200).json({
        success: true,
        ticket,
    })
})

module.exports = {
    createTicket,
    getMyTickets,
    getTicketDetail,
    addMessage,
    closeTicket,
    rateTicket,
}
