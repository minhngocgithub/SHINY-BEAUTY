const User = require('../../models/user.models');
const Category = require('../../models/category.models');
const SubCategory = require('../../models/subCategory.models');
const Product = require('../../models/product.models');
const Order = require('../../models/order.models');
const {
    generateUserData,
    generateCategoryData,
    generateSubCategoryData,
    generateProductData,
    hashPassword
} = require('./factories');

/**
 * Create a test user
 */
const createTestUser = async (overrides = {}) => {
    const userData = generateUserData(overrides);

    // Hash password before saving
    if (userData.password) {
        userData.password = await hashPassword(userData.password);
    }

    const user = await User.create(userData);
    return user;
};

/**
 * Create a test admin user
 */
const createTestAdmin = async (overrides = {}) => {
    return await createTestUser({
        role: 'admin',
        ...overrides
    });
};

/**
 * Create a test category
 */
const createTestCategory = async (overrides = {}) => {
    const categoryData = generateCategoryData(overrides);
    const category = await Category.create(categoryData);
    return category;
};

/**
 * Create a test subcategory
 */
const createTestSubCategory = async (categoryId, overrides = {}) => {
    const subCategoryData = generateSubCategoryData(categoryId, overrides);
    const subCategory = await SubCategory.create(subCategoryData);
    return subCategory;
};

/**
 * Create a test product
 */
const createTestProduct = async (categoryId, overrides = {}) => {
    const productData = generateProductData({
        category: categoryId,
        ...overrides
    });
    const product = await Product.create(productData);
    return product;
};

/**
 * Create a complete product hierarchy (category -> subcategory -> product)
 */
const createProductHierarchy = async () => {
    const category = await createTestCategory();
    const subCategory = await createTestSubCategory(category._id);
    const product = await createTestProduct(category._id, {
        subCategory: subCategory._id
    });

    return { category, subCategory, product };
};

/**
 * Create multiple test products
 */
const createTestProducts = async (count = 5, categoryId = null) => {
    const products = [];

    // Create category if not provided
    if (!categoryId) {
        const category = await createTestCategory();
        categoryId = category._id;
    }

    for (let i = 0; i < count; i++) {
        const product = await createTestProduct(categoryId);
        products.push(product);
    }

    return products;
};

/**
 * Generate JWT token for a user
 */
const generateAuthToken = (user) => {
    const jwt = require('jsonwebtoken');

    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET || 'test_jwt_secret',
        { expiresIn: '1d' }
    );
};

module.exports = {
    createTestUser,
    createTestAdmin,
    createTestCategory,
    createTestSubCategory,
    createTestProduct,
    createProductHierarchy,
    createTestProducts,
    generateAuthToken
};
