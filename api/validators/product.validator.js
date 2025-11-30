const Joi = require('joi');
const mongoose = require('mongoose');

const objectId = Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
}, 'ObjectId validation');

const createProductSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .trim()
        .required()
        .messages({
            'string.empty': 'Product name is required',
            'string.min': 'Product name must be at least 3 characters',
            'string.max': 'Product name cannot exceed 100 characters'
        }),

    brand: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Brand is required'
        }),

    category: Joi.alternatives()
        .try(
            objectId,
            Joi.array().items(objectId).min(1)
        )
        .required()
        .messages({
            'any.required': 'Category is required',
            'array.min': 'At least one category is required'
        }),

    description: Joi.string()
        .min(10)
        .max(5000)
        .required()
        .messages({
            'string.empty': 'Description is required',
            'string.min': 'Description must be at least 10 characters',
            'string.max': 'Description cannot exceed 5000 characters'
        }),

    price: Joi.number()
        .positive()
        .max(99999999)
        .required()
        .messages({
            'number.base': 'Price must be a number',
            'number.positive': 'Price must be positive',
            'number.max': 'Price is too high',
            'any.required': 'Price is required'
        }),

    originalPrice: Joi.number()
        .positive()
        .max(99999999)
        .optional(),

    salePrice: Joi.number()
        .positive()
        .max(99999999)
        .optional(),

    countInstock: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            'number.base': 'Stock count must be a number',
            'number.integer': 'Stock count must be an integer',
            'number.min': 'Stock count cannot be negative',
            'any.required': 'Stock count is required'
        }),

    image: Joi.alternatives()
        .try(
            Joi.object({
                public_id: Joi.string().required(),
                url: Joi.string().uri().required()
            }),
            Joi.array().items(
                Joi.object({
                    public_id: Joi.string().required(),
                    url: Joi.string().uri().required()
                })
            ),
            Joi.string().uri()
        )
        .optional(),

    featured: Joi.boolean().optional(),

    featuredType: Joi.string()
        .valid('homepage', 'category', 'search', 'banner', 'deal_of_day', 'trending')
        .optional()
})

const updateProductSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .trim()
        .optional(),

    brand: Joi.string()
        .trim()
        .optional(),

    category: Joi.alternatives()
        .try(
            objectId,
            Joi.array().items(objectId)
        )
        .optional(),

    description: Joi.string()
        .min(10)
        .max(5000)
        .optional(),

    price: Joi.number()
        .positive()
        .max(99999999)
        .optional(),

    originalPrice: Joi.number()
        .positive()
        .max(99999999)
        .optional(),

    salePrice: Joi.number()
        .positive()
        .max(99999999)
        .optional(),

    countInstock: Joi.number()
        .integer()
        .min(0)
        .optional(),

    featured: Joi.boolean().optional(),

    featuredType: Joi.string()
        .valid('homepage', 'category', 'search', 'banner', 'deal_of_day', 'trending')
        .optional()
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
})
const productQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional(),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .optional(),

    sort: Joi.string()
        .valid('price', '-price', 'createdAt', '-createdAt', 'name', '-name', 'rating', '-rating')
        .optional(),

    category: objectId.optional(),

    brand: Joi.string().optional(),

    minPrice: Joi.number()
        .positive()
        .optional(),

    maxPrice: Joi.number()
        .positive()
        .optional(),

    search: Joi.string()
        .max(100)
        .optional(),

    featured: Joi.boolean().optional(),

    inStock: Joi.boolean().optional()
})
const reviewSchema = Joi.object({
    rating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot exceed 5',
            'any.required': 'Rating is required'
        }),

    comment: Joi.string()
        .min(10)
        .max(1000)
        .trim()
        .required()
        .messages({
            'string.empty': 'Review comment is required',
            'string.min': 'Comment must be at least 10 characters',
            'string.max': 'Comment cannot exceed 1000 characters'
        }),

    images: Joi.array()
        .items(
            Joi.object({
                public_id: Joi.string().required(),
                url: Joi.string().uri().required()
            })
        )
        .max(5)
        .optional()
        .messages({
            'array.max': 'Maximum 5 images allowed'
        })
});

module.exports = {
    createProductSchema,
    updateProductSchema,
    productQuerySchema,
    reviewSchema,
    objectId
};
