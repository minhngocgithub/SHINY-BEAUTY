const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

/**
 * Generate fake user data
 */
const generateUserData = (overrides = {}) => {
    return {
        fullName: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'Test@1234', // Meets password requirements
        phoneNumber: faker.phone.number('##########'),
        dateOfBirth: faker.date.past({ years: 30 }),
        gender: faker.helpers.arrayElement(['male', 'female', 'other']),
        ...overrides
    };
};

/**
 * Generate fake product data
 */
const generateProductData = (overrides = {}) => {
    return {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
        category: null, // Will be set by test
        brand: faker.company.name(),
        stock: faker.number.int({ min: 0, max: 1000 }),
        images: [
            {
                url: faker.image.url(),
                publicId: faker.string.uuid()
            }
        ],
        ingredients: Array.from({ length: 5 }, () => faker.commerce.productMaterial()),
        howToUse: faker.lorem.paragraph(),
        isActive: true,
        ...overrides
    };
};

/**
 * Generate fake category data
 */
const generateCategoryData = (overrides = {}) => {
    return {
        name: faker.commerce.department(),
        description: faker.commerce.productDescription(),
        image: faker.image.url(),
        isActive: true,
        ...overrides
    };
};

/**
 * Generate fake subcategory data
 */
const generateSubCategoryData = (categoryId, overrides = {}) => {
    return {
        name: faker.commerce.product(),
        description: faker.commerce.productDescription(),
        category: categoryId,
        isActive: true,
        ...overrides
    };
};

/**
 * Generate fake order data
 */
const generateOrderData = (userId, overrides = {}) => {
    return {
        user: userId,
        orderItems: [
            {
                product: null, // Will be set by test
                name: faker.commerce.productName(),
                quantity: faker.number.int({ min: 1, max: 5 }),
                price: parseFloat(faker.commerce.price()),
                image: faker.image.url()
            }
        ],
        shippingAddress: {
            fullName: faker.person.fullName(),
            phoneNumber: faker.phone.number('##########'),
            address: faker.location.streetAddress(),
            ward: faker.location.street(),
            district: faker.location.city(),
            city: faker.location.state()
        },
        paymentMethod: faker.helpers.arrayElement(['COD', 'Stripe', 'VNPAY']),
        ...overrides
    };
};

/**
 * Generate fake review data
 */
const generateReviewData = (userId, productId, overrides = {}) => {
    return {
        user: userId,
        product: productId,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.paragraph(),
        ...overrides
    };
};

/**
 * Generate fake address data
 */
const generateAddressData = (userId, overrides = {}) => {
    return {
        user: userId,
        fullName: faker.person.fullName(),
        phoneNumber: faker.phone.number('##########'),
        address: faker.location.streetAddress(),
        ward: faker.location.street(),
        district: faker.location.city(),
        city: faker.location.state(),
        isDefault: false,
        ...overrides
    };
};

/**
 * Generate fake coupon data
 */
const generateCouponData = (overrides = {}) => {
    return {
        code: faker.string.alphanumeric(8).toUpperCase(),
        description: faker.commerce.productDescription(),
        discountType: faker.helpers.arrayElement(['percentage', 'fixed']),
        discountValue: faker.number.int({ min: 5, max: 50 }),
        minOrderValue: faker.number.int({ min: 100, max: 500 }),
        maxDiscountValue: faker.number.int({ min: 50, max: 200 }),
        startDate: faker.date.soon(),
        endDate: faker.date.future(),
        usageLimit: faker.number.int({ min: 10, max: 100 }),
        usageCount: 0,
        isActive: true,
        ...overrides
    };
};

/**
 * Generate fake sale program data
 */
const generateSaleProgramData = (overrides = {}) => {
    return {
        name: faker.commerce.productName() + ' Sale',
        description: faker.commerce.productDescription(),
        discountType: faker.helpers.arrayElement(['percentage', 'fixed', 'buy_x_get_y']),
        discountValue: faker.number.int({ min: 10, max: 50 }),
        startDate: faker.date.soon(),
        endDate: faker.date.future(),
        isActive: true,
        ...overrides
    };
};

/**
 * Hash password for testing
 */
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

module.exports = {
    generateUserData,
    generateProductData,
    generateCategoryData,
    generateSubCategoryData,
    generateOrderData,
    generateReviewData,
    generateAddressData,
    generateCouponData,
    generateSaleProgramData,
    hashPassword
};
