const request = require('supertest');
const { app } = require('../../../index');
const Product = require('../../../models/product.models');
const {
    createTestUser,
    createTestAdmin,
    createTestCategory,
    createTestProduct,
    createTestProducts,
    generateAuthToken
} = require('../../fixtures/seeds');
const { generateProductData } = require('../../fixtures/factories');

describe('Product API - Integration Tests', () => {
    let adminUser, adminToken;
    let regularUser, userToken;
    let testCategory;

    beforeEach(async () => {
        adminUser = await createTestAdmin();
        adminToken = generateAuthToken(adminUser);
        regularUser = await createTestUser();
        userToken = generateAuthToken(regularUser);
        testCategory = await createTestCategory();
    });

    describe('GET /api/v1/products', () => {
        beforeEach(async () => {
            // Create multiple test products
            await createTestProducts(10, testCategory._id);
        });

        it('should get all products with pagination', async () => {
            const response = await request(app)
                .get('/api/v1/products')
                .query({ page: 1, limit: 5 })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('products');
            expect(response.body.data.products).toHaveLength(5);
            expect(response.body.data).toHaveProperty('pagination');
            expect(response.body.data.pagination).toHaveProperty('total', 10);
            expect(response.body.data.pagination).toHaveProperty('page', 1);
        });

        it('should filter products by category', async () => {
            const response = await request(app)
                .get('/api/v1/products')
                .query({ category: testCategory._id })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data.products).toHaveLength(10);

            response.body.data.products.forEach(product => {
                expect(product.category.toString()).toBe(testCategory._id.toString());
            });
        });

        it('should filter products by price range', async () => {
            const response = await request(app)
                .get('/api/v1/products')
                .query({ minPrice: 100, maxPrice: 500 })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);

            response.body.data.products.forEach(product => {
                expect(product.price).toBeGreaterThanOrEqual(100);
                expect(product.price).toBeLessThanOrEqual(500);
            });
        });

        it('should search products by name', async () => {
            // Create a product with specific name
            await createTestProduct(testCategory._id, { name: 'Unique Search Product' });

            const response = await request(app)
                .get('/api/v1/products')
                .query({ search: 'Unique Search' })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data.products.length).toBeGreaterThan(0);
            expect(response.body.data.products[0].name).toMatch(/Unique Search/i);
        });

        it('should sort products by price ascending', async () => {
            const response = await request(app)
                .get('/api/v1/products')
                .query({ sort: 'price' })
                .expect(200);

            const products = response.body.data.products;

            for (let i = 1; i < products.length; i++) {
                expect(products[i].price).toBeGreaterThanOrEqual(products[i - 1].price);
            }
        });

        it('should sort products by price descending', async () => {
            const response = await request(app)
                .get('/api/v1/products')
                .query({ sort: '-price' })
                .expect(200);

            const products = response.body.data.products;

            for (let i = 1; i < products.length; i++) {
                expect(products[i].price).toBeLessThanOrEqual(products[i - 1].price);
            }
        });

        it('should return only active products by default', async () => {
            // Create inactive product
            await createTestProduct(testCategory._id, { isActive: false });

            const response = await request(app)
                .get('/api/v1/products')
                .expect(200);

            response.body.data.products.forEach(product => {
                expect(product.isActive).toBe(true);
            });
        });
    });

    describe('GET /api/v1/products/:id', () => {
        let testProduct;

        beforeEach(async () => {
            testProduct = await createTestProduct(testCategory._id);
        });

        it('should get product by ID', async () => {
            const response = await request(app)
                .get(`/api/v1/products/${testProduct._id}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('_id', testProduct._id.toString());
            expect(response.body.data).toHaveProperty('name', testProduct.name);
            expect(response.body.data).toHaveProperty('price', testProduct.price);
        });

        it('should return 404 for non-existent product', async () => {
            const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

            const response = await request(app)
                .get(`/api/v1/products/${fakeId}`)
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/not found/i);
        });

        it('should return 400 for invalid product ID', async () => {
            const response = await request(app)
                .get('/api/v1/products/invalid-id')
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/invalid/i);
        });
    });

    describe('POST /api/v1/products', () => {
        it('should create product as admin', async () => {
            const productData = generateProductData({
                category: testCategory._id
            });

            const response = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(productData)
                .expect(201);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('name', productData.name);
            expect(response.body.data).toHaveProperty('price', productData.price);

            // Verify in database
            const productInDb = await Product.findOne({ name: productData.name });
            expect(productInDb).toBeTruthy();
        });

        it('should fail to create product without auth', async () => {
            const productData = generateProductData({
                category: testCategory._id
            });

            const response = await request(app)
                .post('/api/v1/products')
                .send(productData)
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should fail to create product as regular user', async () => {
            const productData = generateProductData({
                category: testCategory._id
            });

            const response = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${userToken}`)
                .send(productData)
                .expect(403);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should fail with missing required fields', async () => {
            const response = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Test Product'
                    // Missing price, category, etc.
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should fail with negative price', async () => {
            const productData = generateProductData({
                category: testCategory._id,
                price: -100
            });

            const response = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(productData)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('PUT /api/v1/products/:id', () => {
        let testProduct;

        beforeEach(async () => {
            testProduct = await createTestProduct(testCategory._id);
        });

        it('should update product as admin', async () => {
            const updateData = {
                name: 'Updated Product Name',
                price: 199.99
            };

            const response = await request(app)
                .put(`/api/v1/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('name', updateData.name);
            expect(response.body.data).toHaveProperty('price', updateData.price);

            // Verify in database
            const updatedProduct = await Product.findById(testProduct._id);
            expect(updatedProduct.name).toBe(updateData.name);
            expect(updatedProduct.price).toBe(updateData.price);
        });

        it('should fail to update without auth', async () => {
            const response = await request(app)
                .put(`/api/v1/products/${testProduct._id}`)
                .send({ name: 'Updated' })
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should fail to update as regular user', async () => {
            const response = await request(app)
                .put(`/api/v1/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Updated' })
                .expect(403);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should return 404 for non-existent product', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .put(`/api/v1/products/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Updated' })
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('DELETE /api/v1/products/:id', () => {
        let testProduct;

        beforeEach(async () => {
            testProduct = await createTestProduct(testCategory._id);
        });

        it('should delete product as admin', async () => {
            const response = await request(app)
                .delete(`/api/v1/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.message).toMatch(/deleted/i);

            // Verify product is deleted
            const deletedProduct = await Product.findById(testProduct._id);
            expect(deletedProduct).toBeNull();
        });

        it('should fail to delete without auth', async () => {
            const response = await request(app)
                .delete(`/api/v1/products/${testProduct._id}`)
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should fail to delete as regular user', async () => {
            const response = await request(app)
                .delete(`/api/v1/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('Product Stock Management', () => {
        let testProduct;

        beforeEach(async () => {
            testProduct = await createTestProduct(testCategory._id, { stock: 100 });
        });

        it('should update product stock', async () => {
            const response = await request(app)
                .put(`/api/v1/products/${testProduct._id}/stock`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ stock: 150 })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('stock', 150);

            // Verify in database
            const updatedProduct = await Product.findById(testProduct._id);
            expect(updatedProduct.stock).toBe(150);
        });

        it('should not allow negative stock', async () => {
            const response = await request(app)
                .put(`/api/v1/products/${testProduct._id}/stock`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ stock: -10 })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });
    });
});
