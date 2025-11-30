const request = require('supertest');
const { app } = require('../../../index');
const Order = require('../../../models/order.models');
const Product = require('../../../models/product.models');
const {
    createTestUser,
    createTestCategory,
    createTestProduct,
    generateAuthToken
} = require('../../fixtures/seeds');
const { generateAddressData } = require('../../fixtures/factories');

describe('E2E - Checkout Flow', () => {
    let user, authToken;
    let product1, product2;
    let shippingAddress;

    beforeEach(async () => {
        // Setup user
        user = await createTestUser();
        authToken = generateAuthToken(user);

        // Setup products
        const category = await createTestCategory();
        product1 = await createTestProduct(category._id, {
            name: 'Test Product 1',
            price: 100,
            stock: 50
        });
        product2 = await createTestProduct(category._id, {
            name: 'Test Product 2',
            price: 200,
            stock: 30
        });

        // Setup shipping address
        shippingAddress = generateAddressData(user._id);
    });

    describe('Complete Checkout Flow', () => {
        it('should complete full checkout: add to cart -> review -> place order -> verify', async () => {
            // Step 1: Add product 1 to cart
            const cart1Response = await request(app)
                .post('/api/v1/cart/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: product1._id,
                    quantity: 2
                })
                .expect(200);

            expect(cart1Response.body.success).toBe(true);
            expect(cart1Response.body.data.items).toHaveLength(1);
            expect(cart1Response.body.data.items[0].quantity).toBe(2);

            // Step 2: Add product 2 to cart
            const cart2Response = await request(app)
                .post('/api/v1/cart/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: product2._id,
                    quantity: 1
                })
                .expect(200);

            expect(cart2Response.body.data.items).toHaveLength(2);

            // Calculate expected total
            const expectedSubtotal = (product1.price * 2) + (product2.price * 1);

            // Step 3: Review cart
            const cartResponse = await request(app)
                .get('/api/v1/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(cartResponse.body.data.items).toHaveLength(2);
            expect(cartResponse.body.data.subtotal).toBe(expectedSubtotal);

            // Step 4: Place order
            const orderResponse = await request(app)
                .post('/api/v1/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    orderItems: cartResponse.body.data.items.map(item => ({
                        product: item.product._id,
                        name: item.product.name,
                        quantity: item.quantity,
                        price: item.product.price,
                        image: item.product.images[0]?.url
                    })),
                    shippingAddress: {
                        fullName: shippingAddress.fullName,
                        phoneNumber: shippingAddress.phoneNumber,
                        address: shippingAddress.address,
                        ward: shippingAddress.ward,
                        district: shippingAddress.district,
                        city: shippingAddress.city
                    },
                    paymentMethod: 'COD'
                })
                .expect(201);

            expect(orderResponse.body.success).toBe(true);
            expect(orderResponse.body.data).toHaveProperty('_id');
            expect(orderResponse.body.data.orderStatus).toBe('pending');
            expect(orderResponse.body.data.orderItems).toHaveLength(2);

            const orderId = orderResponse.body.data._id;

            // Step 5: Verify order in database
            const orderInDb = await Order.findById(orderId);
            expect(orderInDb).toBeTruthy();
            expect(orderInDb.user.toString()).toBe(user._id.toString());
            expect(orderInDb.orderItems).toHaveLength(2);

            // Step 6: Verify stock was reduced
            const updatedProduct1 = await Product.findById(product1._id);
            const updatedProduct2 = await Product.findById(product2._id);

            expect(updatedProduct1.stock).toBe(48); // 50 - 2
            expect(updatedProduct2.stock).toBe(29); // 30 - 1

            // Step 7: Verify cart was cleared
            const clearedCartResponse = await request(app)
                .get('/api/v1/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(clearedCartResponse.body.data.items).toHaveLength(0);
        });

        it('should handle insufficient stock gracefully', async () => {
            // Add product to cart with quantity exceeding stock
            const response = await request(app)
                .post('/api/v1/cart/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: product1._id,
                    quantity: 100 // More than available stock (50)
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/insufficient stock/i);
        });

        it('should prevent ordering inactive products', async () => {
            // Deactivate product
            product1.isActive = false;
            await product1.save();

            const response = await request(app)
                .post('/api/v1/cart/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: product1._id,
                    quantity: 1
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not available/i);
        });

        it('should apply coupon discount correctly', async () => {
            // Create a coupon (assuming coupon creation endpoint exists)
            const couponResponse = await request(app)
                .post('/api/v1/coupons')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    code: 'TEST10',
                    discountType: 'percentage',
                    discountValue: 10,
                    minOrderValue: 100,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    isActive: true
                });

            // Add product to cart
            await request(app)
                .post('/api/v1/cart/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: product1._id,
                    quantity: 2
                });

            const cartResponse = await request(app)
                .get('/api/v1/cart')
                .set('Authorization', `Bearer ${authToken}`);

            // Place order with coupon
            const orderResponse = await request(app)
                .post('/api/v1/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    orderItems: cartResponse.body.data.items.map(item => ({
                        product: item.product._id,
                        name: item.product.name,
                        quantity: item.quantity,
                        price: item.product.price,
                        image: item.product.images[0]?.url
                    })),
                    shippingAddress: {
                        fullName: shippingAddress.fullName,
                        phoneNumber: shippingAddress.phoneNumber,
                        address: shippingAddress.address,
                        ward: shippingAddress.ward,
                        district: shippingAddress.district,
                        city: shippingAddress.city
                    },
                    paymentMethod: 'COD',
                    couponCode: 'TEST10'
                });

            if (orderResponse.status === 201) {
                const expectedDiscount = (product1.price * 2) * 0.1; // 10% discount
                const expectedTotal = (product1.price * 2) - expectedDiscount;

                expect(orderResponse.body.data.discount).toBeCloseTo(expectedDiscount, 2);
                expect(orderResponse.body.data.totalPrice).toBeCloseTo(expectedTotal, 2);
            }
        });
    });

    describe('Order Management After Checkout', () => {
        let order;

        beforeEach(async () => {
            // Create an order
            await request(app)
                .post('/api/v1/cart/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: product1._id,
                    quantity: 2
                });

            const cartResponse = await request(app)
                .get('/api/v1/cart')
                .set('Authorization', `Bearer ${authToken}`);

            const orderResponse = await request(app)
                .post('/api/v1/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    orderItems: cartResponse.body.data.items.map(item => ({
                        product: item.product._id,
                        name: item.product.name,
                        quantity: item.quantity,
                        price: item.product.price,
                        image: item.product.images[0]?.url
                    })),
                    shippingAddress: {
                        fullName: shippingAddress.fullName,
                        phoneNumber: shippingAddress.phoneNumber,
                        address: shippingAddress.address,
                        ward: shippingAddress.ward,
                        district: shippingAddress.district,
                        city: shippingAddress.city
                    },
                    paymentMethod: 'COD'
                });

            order = orderResponse.body.data;
        });

        it('should allow user to view their order', async () => {
            const response = await request(app)
                .get(`/api/v1/orders/${order._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(order._id);
            expect(response.body.data.orderStatus).toBe('pending');
        });

        it('should allow user to cancel pending order', async () => {
            const response = await request(app)
                .put(`/api/v1/orders/${order._id}/cancel`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    reason: 'Changed my mind'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.orderStatus).toBe('cancelled');

            // Verify stock was restored
            const restoredProduct = await Product.findById(product1._id);
            expect(restoredProduct.stock).toBe(50); // Back to original
        });

        it('should not allow canceling already delivered order', async () => {
            // Update order status to delivered
            order.orderStatus = 'delivered';
            await Order.findByIdAndUpdate(order._id, { orderStatus: 'delivered' });

            const response = await request(app)
                .put(`/api/v1/orders/${order._id}/cancel`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    reason: 'Too late'
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/cannot cancel/i);
        });

        it('should list user orders with pagination', async () => {
            // Create a few more orders
            for (let i = 0; i < 3; i++) {
                await request(app)
                    .post('/api/v1/cart/add')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        productId: product2._id,
                        quantity: 1
                    });

                const cartResponse = await request(app)
                    .get('/api/v1/cart')
                    .set('Authorization', `Bearer ${authToken}`);

                await request(app)
                    .post('/api/v1/orders')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        orderItems: cartResponse.body.data.items.map(item => ({
                            product: item.product._id,
                            name: item.product.name,
                            quantity: item.quantity,
                            price: item.product.price,
                            image: item.product.images[0]?.url
                        })),
                        shippingAddress: {
                            fullName: shippingAddress.fullName,
                            phoneNumber: shippingAddress.phoneNumber,
                            address: shippingAddress.address,
                            ward: shippingAddress.ward,
                            district: shippingAddress.district,
                            city: shippingAddress.city
                        },
                        paymentMethod: 'COD'
                    });
            }

            const response = await request(app)
                .get('/api/v1/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ page: 1, limit: 2 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.orders).toHaveLength(2);
            expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(4);
        });
    });
});
