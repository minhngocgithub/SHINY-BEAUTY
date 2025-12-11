const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // For anonymous/guest feedback
    guestInfo: {
        name: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        }
    },
    message: {
        type: String,
        required: [true, 'Please enter your feedback.'],
        trim: true
    },
    type: {
        type: String,
        enum: [
            'suggestion',           // Feature requests
            'bug',                 // Technical bugs
            'question',            // General questions
            'order_issue',         // Order problems
            'payment_problem',     // Payment failures
            'shipping_delay',      // Delivery issues
            'product_quality',     // Product complaints
            'technical_issue',     // Website performance
            'account_issue',       // Login/profile problems
            'other'
        ],
        default: 'other'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved', 'closed'],
        default: 'pending'
    },
    // Link to related order if applicable
    relatedOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    // Attachments/screenshots
    attachments: [{
        url: String,
        publicId: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Admin replies
    reply: [{
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: [true, 'Please enter a reply message.'],
            trim: true
        },
        repliedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // SLA tracking
    sla: {
        firstResponseAt: Date,
        resolvedAt: Date,
        responseTime: Number,  // in minutes
        resolutionTime: Number // in minutes
    },
    // Internal notes (not visible to user)
    internalNotes: [{
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        note: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Tags for categorization
    tags: [String],
    // Email sent status
    emailSent: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for display name
feedbackSchema.virtual('displayName').get(function() {
    if (this.user && this.user.name) {
        return this.user.name;
    }
    if (this.guestInfo && this.guestInfo.name) {
        return this.guestInfo.name;
    }
    return 'Anonymous';
});

// Virtual for contact email
feedbackSchema.virtual('contactEmail').get(function() {
    if (this.user && this.user.email) {
        return this.user.email;
    }
    if (this.guestInfo && this.guestInfo.email) {
        return this.guestInfo.email;
    }
    return null;
});

// Auto-calculate priority based on type
feedbackSchema.pre('save', function(next) {
    if (this.isNew && !this.priority) {
        const urgentTypes = ['payment_problem', 'order_issue'];
        const highTypes = ['technical_issue', 'account_issue', 'bug'];
        
        if (urgentTypes.includes(this.type)) {
            this.priority = 'urgent';
        } else if (highTypes.includes(this.type)) {
            this.priority = 'high';
        } else {
            this.priority = 'medium';
        }
    }
    
    // Calculate SLA metrics when status changes
    if (this.isModified('status')) {
        const now = new Date();
        
        // First response time
        if (this.status === 'in_progress' && !this.sla.firstResponseAt) {
            this.sla.firstResponseAt = now;
            this.sla.responseTime = Math.round((now - this.createdAt) / 60000); // minutes
        }
        
        // Resolution time
        if (this.status === 'resolved' && !this.sla.resolvedAt) {
            this.sla.resolvedAt = now;
            this.sla.resolutionTime = Math.round((now - this.createdAt) / 60000); // minutes
        }
    }
    
    next();
});

// Indexes for better query performance
feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ priority: 1, status: 1 });
feedbackSchema.index({ relatedOrder: 1 });
feedbackSchema.index({ 'guestInfo.email': 1 });
feedbackSchema.index({ tags: 1 });
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
