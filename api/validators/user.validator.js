const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 50 characters'
        }),

    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required'
        }),

    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.max': 'Password cannot exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'string.empty': 'Password is required'
        }),

    phone: Joi.string()
        .pattern(/^[0-9]{9,11}$/)
        .optional()
        .allow('', null)
        .messages({
            'string.pattern.base': 'Phone number must be 9-11 digits'
        }),

    dateOfBirth: Joi.date()
        .max('now')
        .optional()
        .allow('', null)
        .messages({
            'date.max': 'Date of birth cannot be in the future'
        })
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required'
        }),

    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required'
        })
});


const updateProfileSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .optional(),

    phone: Joi.string()
        .pattern(/^[0-9]{9,11}$/)
        .optional()
        .allow('', null),

    dateOfBirth: Joi.date()
        .max('now')
        .optional()
        .allow('', null),

    avatar: Joi.object({
        public_id: Joi.string().optional(),
        url: Joi.string().uri().optional()
    }).optional()
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'string.empty': 'Current password is required'
        }),

    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.min': 'New password must be at least 8 characters',
            'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'string.empty': 'New password is required'
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'string.empty': 'Confirm password is required'
        })
});

const emailSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required'
        })
});

const resetPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required(),

    otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
            'string.length': 'OTP must be 6 digits',
            'string.pattern.base': 'OTP must contain only numbers'
        }),

    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    changePasswordSchema,
    emailSchema,
    resetPasswordSchema
};
