const mongoose = require('mongoose')
const crypto = require('crypto');
const { type } = require('os');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: function() {
            return !this.isOAuthUser; // Password không bắt buộc cho OAuth users
        }
    },
    phone: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                return !v || /^[0-9]{9,10}$/.test(v); // Validate phone format nếu có
            },
            message: 'Phone number must be 9-10 digits'
        }
    },
    dateOfBirth: {
        type: Date,
        required: false,
        validate: {
            validator: function(v) {
                if (!v) return true; // Cho phép null/undefined
                const today = new Date();
                const birthDate = new Date(v);
                
                // Kiểm tra xem date có hợp lệ không
                if (isNaN(birthDate.getTime())) {
                    return false;
                }
                
                // Kiểm tra xem date có trong tương lai không
                if (birthDate > today) {
                    return false;
                }
                
                // Tính tuổi chính xác hơn
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                
                return age >= 10 && age <= 100;
            },
            message: 'Date of birth must be valid and result in age between 10-100'
        }
    },
    googleId: { type: String, sparse: true },
    facebookId: { type: String, sparse: true },
    twitterId: { type: String, sparse: true },
    isOAuthUser: { type: Boolean, default: false },
    avatar: {
        public_id: {
            type: String,
            required: function() {
                return !this.isOAuthUser;
            }
        },
        url: {
            type: String,
            required: function() {
                return !this.isOAuthUser;
            }
        }
    },
    cartItems: [
        {
            quantity: {
                type: Number,
                default: 1,
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        },
    ],
    isAdmin: { 
        type: Boolean, 
        required: true, 
        default: false 
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true} )

module.exports = mongoose.model('User', userSchema)
