const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
    },
    ward: {
        type: String,
        trim: true
    },
    district: {
        type: String,
        required: [true, 'District is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    country: {
        type: String,
        default: 'Vietnam',
        trim: true
    },
    postalCode: {
        type: String,
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    addressType: {
        type: String,
        enum: ['home', 'office', 'other'],
        default: 'home'
    },
    note: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
})

addressSchema.index({ user: 1, isDefault: -1 })

addressSchema.pre('save', async function (next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        )
    }
    next()
})

module.exports = mongoose.model('Address', addressSchema)
