const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema= new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    orderItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        name: { type: String, require: true },
        quantity: { type: Number, require: true },
        image: { type: String, require: true },
        price: { type: Number, require: true },
    }],
    shippingAddress: {
        address: { type: String, require: true },
        phone: {type: String, require: true},
        city: { type: String, require: true },
        postalCode: { type: String, require: true },
    },
    paymentMethod: { type: String, require: true },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
    itemsPrice: { type: Number, require: true, default: 0.0 },
    taxPrice: { type: Number, require: true, default: 0.0 },
    shippingPrice: { type: Number, require: true, default: 0.0 },
    totalPrice:{type:Number, required:true, default:0.0},
	isPaid:{type:Boolean, required:true, default:false},
    paidAt: { type: Date },
    isDelivered: { type: Boolean, require: true, default: false },
    deliveredAt: { type: Date }

}, {timestamps: true})
 
module.exports = mongoose.model('Order', orderSchema)