const mongoose = require("mongoose")

const stockHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
    bundle: {
      type: mongoose.Schema.ObjectId,
      ref: "ProductBundle",
    },
    action: {
      type: String,
      enum: ["CREATED", "INCREASED", "DECREASED", "ADJUSTMENT", "RESERVED", "RELEASED"],
      required: true,
    },
    quantityBefore: {
      type: Number,
      required: true,
    },
    quantityAfter: {
      type: Number,
      required: true,
    },
    quantityChanged: {
      type: Number,
      required: true,
    },
    reason: String,
    orderId: {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    source: {
      type: String,
      enum: ["ORDER", "MANUAL_ADJUSTMENT", "RETURN", "DAMAGE", "LOSS", "IMPORT"],
      default: "ORDER",
    },
    notes: String,
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
stockHistorySchema.index({ product: 1, createdAt: -1 })
stockHistorySchema.index({ action: 1 })
stockHistorySchema.index({ orderId: 1 })

module.exports = mongoose.model("StockHistory", stockHistorySchema)
