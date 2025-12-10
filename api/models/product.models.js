const mongoose = require('mongoose');
const { applyMiddleware } = require('../middleware/product.middleware');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    image: [{
        public_id: { type: String, required: true },
        url: { type: String, required: true },
        isMain: { type: Boolean, default: false },
        alt: { type: String, default: '' },
        order: { type: Number, default: 0 }
    }],
    brand: { type: String, required: true },
    category: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    }],
    description: {
        type: String,
        required: [true, 'Please enter the product description']
    },

    // ========== FEATURED SECTION ==========
    featured: {
        type: Boolean,
        default: false
    },
    featuredType: {
        type: String,
        enum: ['homepage', 'category', 'search', 'banner', 'deal_of_day', 'trending'],
        default: 'homepage'
    },
    featuredOrder: {
        type: Number,
        default: 0
    },
    featuredAt: {
        type: Date
    },
    featuredExpiry: {
        type: Date
    },
    featuredPriority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    featuredInCategories: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    }],
    featuredMetrics: {
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        ctr: { type: Number, default: 0 },
        conversionRate: { type: Number, default: 0 }
    },
    featuredViews: { type: Number, default: 0 },
    featuredClicks: { type: Number, default: 0 },
    featuredHistory: [{
        featuredAt: Date,
        removedAt: Date,
        reason: String,
        removeReason: String,
        by: { type: mongoose.Schema.ObjectId, ref: 'User' },
        removedBy: { type: mongoose.Schema.ObjectId, ref: 'User' }
    }],

    // ========== TRENDING SECTION ==========
    trendingScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    isNewProduct: {
        type: Boolean,
        default: true
    },
    newUntil: {
        type: Date,
        default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },

    // ========== PRICING SECTION ==========
    price: {
        type: Number,
        required: [true, 'Please enter the product price'],
        max: [99999, 'Product price cannot exceed 5 digits']
    },
    originalPrice: {
        type: Number
    },
    salePrice: {
        type: Number,
        validate: {
            validator: function (value) {
                if (!value) return true;
                const basePrice = this.originalPrice || this.price;
                return value < basePrice;
            },
            message: 'Sale price must be less than original price'
        }
    },
    discountPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    isOnSale: {
        type: Boolean,
        default: false
    },
    saleStartDate: {
        type: Date
    },
    saleEndDate: {
        type: Date,
        validate: {
            validator: function (value) {
                if (!value || !this.saleStartDate) return true;
                return value > this.saleStartDate;
            },
            message: 'Sale end date must be after start date'
        }
    },
    saleType: {
        type: String,
        enum: ['percentage', 'fixed_amount', 'flash_sale', 'clearance', 'seasonal'],
        default: 'percentage'
    },

    // ========== FLASH SALE SECTION ==========
    flashSale: {
        isFlashSale: {
            type: Boolean,
            default: false
        },
        originalStock: {
            type: Number
        },
        saleStock: {
            type: Number
        },
        maxQuantityPerUser: {
            type: Number,
            default: 5
        }
    },

    // ========== INVENTORY SECTION (ENHANCED) ==========
    countInstock: {
        type: Number,
        required: [true, 'Please enter product quantity'],
        max: [9999999, 'Product quantity cannot exceed 7 digits'],
        default: 0
    },
    reservedStock: {
        type: Number,
        default: 0,
        min: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 10,
        min: 0
    },
    reorderPoint: {
        type: Number,
        default: 20,
        min: 0
    },
    sold: {
        type: Number,
        default: 0
    },

    // Inventory History for audit trail
    inventoryHistory: [{
        type: {
            type: String,
            enum: ['restock', 'sale', 'return', 'adjustment', 'reservation', 'release', 'confirmed'],
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        previousStock: Number,
        newStock: Number,
        reason: String,
        orderId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Order'
        },
        reservationId: String,
        by: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // ========== RATINGS SECTION ==========
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        },
    },
    totalRating: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ========== VIRTUAL FIELDS ==========
productSchema.virtual('availableStock').get(function () {
    return Math.max(0, this.countInstock - (this.reservedStock || 0));
});

productSchema.virtual('stockStatus').get(function () {
    if (this.countInstock === 0) return 'out_of_stock';
    if (this.countInstock <= this.lowStockThreshold) return 'low_stock';
    if (this.countInstock <= this.reorderPoint) return 'reorder_soon';
    return 'in_stock';
});

productSchema.virtual('needsRestock').get(function () {
    return this.countInstock <= this.reorderPoint;
});

// ========== PRE-SAVE HOOKS ==========
productSchema.pre('save', function (next) {
    // Auto-disable if out of stock
    if (this.countInstock <= 0) {
        this.isAvailable = false;
    }

    // Ensure reserved stock doesn't exceed actual stock
    if (this.reservedStock > this.countInstock) {
        this.reservedStock = this.countInstock;
    }

    next();
});

// ========== INVENTORY METHODS ==========

// Check if product has enough stock
productSchema.methods.hasStock = function (quantity) {
    const available = this.countInstock - (this.reservedStock || 0);
    return available >= quantity;
};

// Update stock with history tracking
productSchema.methods.updateStock = function (quantity, type = 'adjustment', metadata = {}) {
    const previousStock = this.countInstock;
    this.countInstock += quantity;

    // Add to history
    this.inventoryHistory.push({
        type,
        quantity,
        previousStock,
        newStock: this.countInstock,
        reason: metadata.reason,
        orderId: metadata.orderId,
        reservationId: metadata.reservationId,
        by: metadata.by,
        createdAt: new Date()
    });

    return this;
};

// Reserve stock (called by InventoryService)
productSchema.methods.reserveStock = function (quantity, metadata = {}) {
    if (!this.hasStock(quantity)) {
        throw new Error(`Insufficient stock. Available: ${this.availableStock}, Requested: ${quantity}`);
    }

    const previousReserved = this.reservedStock || 0;
    this.reservedStock = previousReserved + quantity;

    // Track reservation in history
    this.inventoryHistory.push({
        type: 'reservation',
        quantity: quantity,
        previousStock: this.countInstock,
        newStock: this.countInstock,
        reservationId: metadata.reservationId,
        by: metadata.by,
        createdAt: new Date()
    });

    return this;
};

// Release reserved stock (cancel order)
productSchema.methods.releaseReservedStock = function (quantity, metadata = {}) {
    this.reservedStock = Math.max(0, (this.reservedStock || 0) - quantity);

    this.inventoryHistory.push({
        type: 'release',
        quantity: quantity,
        previousStock: this.countInstock,
        newStock: this.countInstock,
        reservationId: metadata.reservationId,
        reason: metadata.reason || 'Reservation cancelled',
        createdAt: new Date()
    });

    return this;
};

// Confirm sale (deduct stock after payment)
productSchema.methods.confirmSale = function (quantity, metadata = {}) {
    // Deduct from both reserved and actual stock
    this.reservedStock = Math.max(0, (this.reservedStock || 0) - quantity);
    this.countInstock -= quantity;
    this.sold += quantity;

    this.inventoryHistory.push({
        type: 'confirmed',
        quantity: -quantity,
        previousStock: this.countInstock + quantity,
        newStock: this.countInstock,
        orderId: metadata.orderId,
        reservationId: metadata.reservationId,
        createdAt: new Date()
    });

    return this;
};

// Process return
productSchema.methods.processReturn = function (quantity, metadata = {}) {
    this.countInstock += quantity;
    this.sold = Math.max(0, this.sold - quantity);

    this.inventoryHistory.push({
        type: 'return',
        quantity: quantity,
        previousStock: this.countInstock - quantity,
        newStock: this.countInstock,
        orderId: metadata.orderId,
        reason: metadata.reason,
        by: metadata.by,
        createdAt: new Date()
    });

    return this;
};

// Restock product
productSchema.methods.restock = function (quantity, metadata = {}) {
    return this.updateStock(quantity, 'restock', metadata);
};

// ========== FEATURED METHODS ==========
productSchema.methods.setFeatured = function (options = {}) {
    const { order = 0, expiry = null, reason = 'Manual feature', by = null, type = 'homepage' } = options;

    if (this.featured) {
        return false;
    }

    this.featured = true;
    this.featuredType = type;
    this.featuredOrder = order;
    this.featuredAt = new Date();
    this.featuredExpiry = expiry;

    if (!this.featuredHistory) {
        this.featuredHistory = [];
    }
    this.featuredHistory.push({
        featuredAt: new Date(),
        reason,
        by
    });

    return true;
};

productSchema.methods.removeFeatured = function (reason = 'Manual removal', by = null) {
    if (!this.featured) {
        return this;
    }

    this.featured = false;

    if (this.featuredHistory && this.featuredHistory.length > 0) {
        const lastEntry = this.featuredHistory[this.featuredHistory.length - 1];
        if (lastEntry && !lastEntry.removedAt) {
            lastEntry.removedAt = new Date();
            lastEntry.removeReason = reason;
            lastEntry.removedBy = by;
        }
    }

    return this;
};

// ========== TRENDING METHODS ==========
productSchema.methods.calculateTrendingScore = function () {
    const now = new Date();
    const ageInDays = (now - this.createdAt) / (1000 * 60 * 60 * 24);

    let score = 0;
    score += Math.min(this.sold * 2, 40);
    score += (this.ratings?.average || 0) * 5;
    score += Math.min((this.featuredViews || 0) / 10, 20);
    score += this.countInstock > 0 ? 10 : 0;
    score += Math.max(5 - (ageInDays / 10), 0);

    return Math.min(Math.round(score), 100);
};

productSchema.methods.autoSetFeatured = function (options = {}) {
    const { featuredType = 'homepage', duration = 30, minTrendingScore = 70 } = options;

    if (this.featured) return false;

    const trendingScore = this.calculateTrendingScore();
    if (trendingScore < minTrendingScore) return false;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + duration);

    return this.setFeatured({
        type: featuredType,
        order: trendingScore,
        expiry,
        reason: `Auto-promoted (score: ${trendingScore})`
    });
};

productSchema.methods.getFeaturedPerformance = function () {
    if (!this.featured) return null;

    const views = this.featuredViews || 0;
    const clicks = this.featuredClicks || 0;
    const conversions = this.featuredMetrics?.conversions || 0;

    return {
        views,
        clicks,
        conversions,
        ctr: views > 0 ? ((clicks / views) * 100).toFixed(2) : 0,
        conversionRate: clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0,
        trendingScore: this.calculateTrendingScore(),
        metrics: this.featuredMetrics
    };
};

// ========== REVIEW METHODS ==========
productSchema.statics.updateRatingsFromReviews = async function (productId) {
    try {
        const Review = require('./review.models');

        const stats = await Review.aggregate([
            {
                $match: {
                    product: new mongoose.Types.ObjectId(productId),
                    reviewType: 'rating',
                    status: 'published'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRating: { $sum: '$rating' },
                    count: { $sum: 1 },
                    average: { $avg: '$rating' }
                }
            }
        ]);

        const product = await this.findById(productId);
        if (!product) return null;

        if (stats.length > 0) {
            product.totalRating = stats[0].totalRating;
            product.ratings.count = stats[0].count;
            product.ratings.average = Number(stats[0].average.toFixed(2));
        } else {
            product.totalRating = 0;
            product.ratings.count = 0;
            product.ratings.average = 0;
        }

        await product.save();
        return product;
    } catch (error) {
        console.error('Update ratings error:', error);
        throw error;
    }
};

productSchema.methods.getWithReviewSummary = async function () {
    const Review = require('./review.models');
    const reviewStats = await Review.getProductStats(this._id);

    return {
        ...this.toObject(),
        reviewSummary: reviewStats
    };
};

productSchema.methods.hasReviews = async function () {
    const Review = require('./review.models');
    const count = await Review.countDocuments({
        product: this._id,
        status: 'published'
    });
    return count > 0;
};

// ========== INDEXES ==========
productSchema.index({ countInstock: 1 });
productSchema.index({ reservedStock: 1 });
productSchema.index({ countInstock: 1, sold: -1 });
productSchema.index({ stockStatus: 1 });
productSchema.index({ needsRestock: 1 });

applyMiddleware(productSchema);

module.exports = mongoose.model('Product', productSchema);