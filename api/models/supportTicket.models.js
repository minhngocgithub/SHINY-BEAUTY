const mongoose = require("mongoose")

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["ORDER", "PAYMENT", "PRODUCT", "DELIVERY", "QUALITY", "OTHER"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"],
      default: "OPEN",
    },
    description: {
      type: String,
      required: true,
    },
    relatedOrder: {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
    },
    relatedProduct: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ["USER", "SUPPORT"],
          required: true,
        },
        senderName: String,
        senderId: mongoose.Schema.ObjectId,
        message: String,
        attachments: [String],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    resolution: {
      type: String,
    },
    resolvedAt: Date,
    closedAt: Date,
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
      ratedAt: Date,
    },
    tags: [String],
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
supportTicketSchema.index({ user: 1, createdAt: -1 })
supportTicketSchema.index({ status: 1 })
supportTicketSchema.index({ priority: 1 })
supportTicketSchema.index({ category: 1 })
supportTicketSchema.index({ assignedTo: 1 })

// Generate ticket number
supportTicketSchema.pre("save", async function (next) {
  if (!this.ticketNumber) {
    const count = await this.constructor.countDocuments()
    this.ticketNumber = `TKT-${Date.now()}-${count + 1}`
  }
  next()
})

module.exports = mongoose.model("SupportTicket", supportTicketSchema)
