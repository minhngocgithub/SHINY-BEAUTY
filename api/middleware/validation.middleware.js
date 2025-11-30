const logger = require('../config/logger');

/**
 * Joi Validation Middleware Factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {String} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true, // Remove unknown properties
            convert: true // Attempt to cast values to correct types
        });

        if (error) {
            const errorMessage = error.details
                .map(detail => detail.message)
                .join(', ');

            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                type: detail.type
            }));

            logger.warn('Validation error', {
                path: req.path,
                method: req.method,
                errors: errorDetails,
                userId: req.user?.id || 'anonymous'
            });

            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: errorMessage,
                details: errorDetails
            });
        }

        // Replace request property with validated and sanitized value
        req[property] = value;
        next();
    };
};

/**
 * Validate Request Body
 */
const validateBody = (schema) => validate(schema, 'body');

/**
 * Validate Query Parameters
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate URL Parameters
 */
const validateParams = (schema) => validate(schema, 'params');

/**
 * MongoDB ObjectId Parameter Validation
 */
const Joi = require('joi');
const mongoose = require('mongoose');

const objectIdParamSchema = Joi.object({
    id: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        }, 'ObjectId validation')
        .required()
        .messages({
            'any.invalid': 'Invalid ID format',
            'string.empty': 'ID is required'
        })
});

const validateObjectIdParam = validateParams(objectIdParamSchema);

/**
 * Sanitize input to prevent XSS and injection attacks
 */
const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                // Remove potential XSS vectors
                obj[key] = obj[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '');
            } else if (typeof obj[key] === 'object') {
                sanitize(obj[key]);
            }
        });

        return obj;
    };

    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);

    next();
};

module.exports = {
    validate,
    validateBody,
    validateQuery,
    validateParams,
    validateObjectIdParam,
    sanitizeInput
};
