const Joi = require('joi');
const { objectId } = require('./product.validator');

const createOrderSchema = Joi.object({
    orderItems: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required(),
                image: Joi.string().uri().required(),
                price: Joi.number().positive().required(),
                originalPrice: Joi.number().positive().required(),
                product: objectId.required(),
                bundle: objectId.optional()
            })
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one item is required',
            'any.required': 'Order items are required'
        }),

    shippingAddress: Joi.object({
        fullName: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'Full name is required',
                'string.min': 'Full name must be at least 2 characters'
            }),

        address: Joi.string()
            .min(5)
            .max(200)
            .required()
            .messages({
                'string.empty': 'Address is required',
                'string.min': 'Address must be at least 5 characters'
            }),

        city: Joi.string()
            .required()
            .messages({
                'string.empty': 'City is required'
            }),

        postalCode: Joi.string()
            .pattern(/^[0-9]{5,10}$/)
            .required()
            .messages({
                'string.empty': 'Postal code is required',
                'string.pattern.base': 'Invalid postal code format'
            }),

        country: Joi.string()
            .required()
            .messages({
                'string.empty': 'Country is required'
            }),

        phone: Joi.string()
            .pattern(/^[0-9]{9,11}$/)
            .required()
            .messages({
                'string.empty': 'Phone number is required',
                'string.pattern.base': 'Phone number must be 9-11 digits'
            })
    }).required(),

    paymentMethod: Joi.string()
        .valid('COD', 'VNPAY', 'MOMO', 'BANK_TRANSFER', 'STRIPE')
        .required()
        .messages({
            'any.only': 'Invalid payment method',
            'string.empty': 'Payment method is required'
        }),

    appliedPrograms: Joi.array()
        .items(
            Joi.object({
                program: objectId.required(),
                programName: Joi.string().optional(),
                discountAmount: Joi.number().min(0).required(),
                discountType: Joi.string()
                    .valid('percentage', 'fixed_amount', 'flash_sale', 'bundle_deal')
                    .required(),
                productId: objectId.optional(),
                bundleId: objectId.optional()
            })
        )
        .optional(),

    couponProgram: objectId.optional(),

    couponCode: Joi.string()
        .uppercase()
        .trim()
        .optional(),

    couponDiscount: Joi.number()
        .min(0)
        .default(0)
        .optional(),

    note: Joi.string()
        .max(500)
        .optional()
        .allow('', null)
});

const updateOrderStatusSchema = Joi.object({
    orderStatus: Joi.string()
        .valid(
            'pending',
            'processing',
            'confirmed',
            'shipping',
            'delivered',
            'cancelled',
            'refunded'
        )
        .required()
        .messages({
            'any.only': 'Invalid order status',
            'string.empty': 'Order status is required'
        }),

    statusNote: Joi.string()
        .max(500)
        .optional()
});
const orderQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional(),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
        .optional(),

    status: Joi.string()
        .valid(
            'pending',
            'processing',
            'confirmed',
            'shipping',
            'delivered',
            'cancelled',
            'refunded'
        )
        .optional(),

    userId: objectId.optional(),

    fromDate: Joi.date().optional(),

    toDate: Joi.date()
        .greater(Joi.ref('fromDate'))
        .optional()
        .messages({
            'date.greater': 'To date must be after from date'
        }),

    paymentMethod: Joi.string()
        .valid('COD', 'VNPAY', 'MOMO', 'BANK_TRANSFER', 'STRIPE')
        .optional()
});

const cancelOrderSchema = Joi.object({
    reason: Joi.string()
        .min(10)
        .max(500)
        .required()
        .messages({
            'string.empty': 'Cancellation reason is required',
            'string.min': 'Reason must be at least 10 characters',
            'string.max': 'Reason cannot exceed 500 characters'
        })
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema,
    orderQuerySchema,
    cancelOrderSchema
};
