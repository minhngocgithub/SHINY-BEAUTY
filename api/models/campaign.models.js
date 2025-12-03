const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    // Campaign Info
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    
    type: {
        type: String,
        enum: [
            'EMAIL',           // Email campaign
            'NOTIFICATION',    // In-app notification only
            'BOTH'            // Email + Notification
        ],
        required: true,
        default: 'BOTH'
    },
    
    category: {
        type: String,
        enum: [
            'FLASH_SALE',
            'NEW_PRODUCT',
            'PRICE_DROP',
            'BACK_IN_STOCK',
            'ABANDONED_CART',
            'BIRTHDAY_OFFER',
            'LOYALTY_UPDATE',
            'NEWSLETTER',
            'PROMOTION',
            'ANNOUNCEMENT'
        ],
        required: true
    },

    // Content
    subject: {
        type: String,
        required: function() {
            return this.type === 'EMAIL' || this.type === 'BOTH';
        },
        maxlength: 200
    },

    emailTemplate: {
        type: String,
        enum: [
            'flashSale',
            'newProduct',
            'priceDrop',
            'backInStock',
            'abandonedCart',
            'birthdayOffer',
            'newsletter',
            'generic'
        ],
        required: function() {
            return this.type === 'EMAIL' || this.type === 'BOTH';
        }
    },

    emailContent: {
        // Dynamic data for template
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    notificationTitle: {
        type: String,
        required: function() {
            return this.type === 'NOTIFICATION' || this.type === 'BOTH';
        },
        maxlength: 100
    },

    notificationMessage: {
        type: String,
        required: function() {
            return this.type === 'NOTIFICATION' || this.type === 'BOTH';
        },
        maxlength: 300
    },

    notificationType: {
        type: String,
        enum: [
            'FLASH_SALE',
            'PROMOTION',
            'PRODUCT_AVAILABLE',
            'PRICE_DROP',
            'SYSTEM'
        ],
        default: 'PROMOTION'
    },

    actionUrl: {
        type: String, // Deep link or URL
        default: null
    },

    // Target Audience
    targetSegment: {
        type: String,
        enum: [
            'ALL_USERS',
            'LOYALTY_TIER',      // By tier (Bronze, Silver, Gold, Platinum)
            'PURCHASED_CATEGORY', // Users who bought from specific category
            'WISHLIST_PRODUCT',   // Users with specific product in wishlist
            'CART_ABANDONED',     // Users with abandoned cart
            'BIRTHDAY_THIS_MONTH',// Users with birthday this month
            'CUSTOM_QUERY'        // Custom MongoDB query
        ],
        required: true,
        default: 'ALL_USERS'
    },

    segmentFilters: {
        // Dynamic filters based on targetSegment
        loyaltyTiers: [String],               // ['Gold', 'Platinum']
        categoryIds: [mongoose.Schema.Types.ObjectId],
        productIds: [mongoose.Schema.Types.ObjectId],
        minOrderValue: Number,
        maxOrderValue: Number,
        lastOrderDays: Number,                // Last order within X days
        customQuery: mongoose.Schema.Types.Mixed  // MongoDB query object
    },

    // Scheduling
    status: {
        type: String,
        enum: [
            'DRAFT',      // Being created
            'SCHEDULED',  // Scheduled for future
            'PROCESSING', // Currently sending
            'COMPLETED',  // Finished sending
            'CANCELLED',  // Cancelled before completion
            'FAILED'      // Failed to send
        ],
        default: 'DRAFT'
    },

    scheduledAt: {
        type: Date,
        default: null
    },

    sendImmediately: {
        type: Boolean,
        default: false
    },

    // Statistics
    stats: {
        targetCount: {
            type: Number,
            default: 0
        },
        sentCount: {
            type: Number,
            default: 0
        },
        deliveredCount: {
            type: Number,
            default: 0
        },
        failedCount: {
            type: Number,
            default: 0
        },
        openedCount: {
            type: Number,
            default: 0
        },
        clickedCount: {
            type: Number,
            default: 0
        },
        unsubscribedCount: {
            type: Number,
            default: 0
        }
    },

    // Execution
    startedAt: {
        type: Date,
        default: null
    },

    completedAt: {
        type: Date,
        default: null
    },

    errorLog: [{
        userId: mongoose.Schema.Types.ObjectId,
        error: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    // Creator
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Settings
    priority: {
        type: String,
        enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
        default: 'NORMAL'
    },

    batchSize: {
        type: Number,
        default: 100, // Send 100 emails per batch
        min: 10,
        max: 500
    },

    rateLimitPerHour: {
        type: Number,
        default: 5000, // Max 5000 emails/hour
        min: 100
    }

}, {
    timestamps: true
});

// Indexes
campaignSchema.index({ status: 1, scheduledAt: 1 });
campaignSchema.index({ createdBy: 1, createdAt: -1 });
campaignSchema.index({ category: 1, status: 1 });

// Virtuals
campaignSchema.virtual('deliveryRate').get(function() {
    if (this.stats.sentCount === 0) return 0;
    return ((this.stats.deliveredCount / this.stats.sentCount) * 100).toFixed(2);
});

campaignSchema.virtual('openRate').get(function() {
    if (this.stats.deliveredCount === 0) return 0;
    return ((this.stats.openedCount / this.stats.deliveredCount) * 100).toFixed(2);
});

campaignSchema.virtual('clickRate').get(function() {
    if (this.stats.openedCount === 0) return 0;
    return ((this.stats.clickedCount / this.stats.openedCount) * 100).toFixed(2);
});

// Methods
campaignSchema.methods.incrementSent = function() {
    this.stats.sentCount += 1;
    return this.save();
};

campaignSchema.methods.incrementDelivered = function() {
    this.stats.deliveredCount += 1;
    return this.save();
};

campaignSchema.methods.incrementFailed = function() {
    this.stats.failedCount += 1;
    return this.save();
};

campaignSchema.methods.markAsProcessing = function() {
    this.status = 'PROCESSING';
    this.startedAt = new Date();
    return this.save();
};

campaignSchema.methods.markAsCompleted = function() {
    this.status = 'COMPLETED';
    this.completedAt = new Date();
    return this.save();
};

// Statics
campaignSchema.statics.getScheduledCampaigns = function() {
    return this.find({
        status: 'SCHEDULED',
        scheduledAt: { $lte: new Date() }
    }).sort({ priority: -1, scheduledAt: 1 });
};

campaignSchema.statics.getActiveCampaigns = function() {
    return this.find({
        status: 'PROCESSING'
    });
};

module.exports = mongoose.model('Campaign', campaignSchema);