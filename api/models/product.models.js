const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    name: {
        type: String,
        required: [ true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'product name cannot exceed 100 characters.']
    },
    image: [{
        public_id: { type: String, required: true },
        url: { type: String, required: true }
    }],
    brand: { type: String, required: true },
    category: [
        { 
            type: mongoose.Schema.ObjectId,
            ref: 'Category'
        }
    ],
    description: {
        type: String,
        required: [true, 'Please enter the product description.']
    },
    featured: {
        type: Boolean,
        default: false,
    },
    isNewProduct: {
        type: Boolean,
        default: true,
        index: true
    },
    // Date until which a product is considered "new"
    newUntil: {
        type: Date,
        default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        index: true
    },
    isBestSeller: {
        type: Boolean,
        default: false,
    },
    price: {
        type: Number,
        required: [true, 'Please enter the product price.'],
        maxLength: [5, 'Product price cannot exceed 5 places.']
    },
    countInstock: {
        type: Number,
        required: [true, 'Please enter product quantity.'],
        maxLength: [5, 'Product number position cannot exceed 7 characters.'],
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
      postedBy: { type: mongoose.Types.ObjectId, ref: 'User' }
    },
    
    totalRating: {
        type: Number,
        default: 0
    },
    createAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
    
}, { timestamps: true } )

productSchema.index({ price: 1, rating: -1 })
productSchema.index({ category: 1 })
productSchema.index({ brand: 1 })

// Virtual populate for reviews
productSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "product",
    localField: "_id",
})

// Query middleware
productSchema.pre(/^find/, function (next) {
    this.populate({
      path: "category",
      select: "name",
    })
    next()
})

module.exports = mongoose.model('Product', productSchema)