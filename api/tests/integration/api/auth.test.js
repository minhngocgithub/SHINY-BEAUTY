const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../../index'); // Main Express app
const User = require('../../../models/user.models');
const {
    createTestUser,
    generateAuthToken,
    createTestAdmin
} = require('../../fixtures/seeds');
const { generateUserData } = require('../../fixtures/factories');

describe('Authentication API - Integration Tests', () => {
    describe('POST /api/v1/users/register', () => {
        it('should register a new user successfully', async () => {
            const userData = generateUserData();

            const response = await request(app)
                .post('/api/v1/users/register')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user).toHaveProperty('email', userData.email.toLowerCase());
            expect(response.body.data.user).toHaveProperty('fullName', userData.fullName);
            expect(response.body.data.user).not.toHaveProperty('password');

            // Verify user in database
            const userInDb = await User.findOne({ email: userData.email.toLowerCase() });
            expect(userInDb).toBeTruthy();
            expect(userInDb.fullName).toBe(userData.fullName);
        });

        it('should fail with invalid email', async () => {
            const userData = generateUserData({ email: 'invalid-email' });

            const response = await request(app)
                .post('/api/v1/users/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should fail with weak password', async () => {
            const userData = generateUserData({ password: '123' });

            const response = await request(app)
                .post('/api/v1/users/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/password/i);
        });

        it('should fail with duplicate email', async () => {
            const userData = generateUserData();

            // Create first user
            await request(app)
                .post('/api/v1/users/register')
                .send(userData)
                .expect(201);

            // Try to create duplicate
            const response = await request(app)
                .post('/api/v1/users/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/already exists/i);
        });

        it('should fail with missing required fields', async () => {
            const response = await request(app)
                .post('/api/v1/users/register')
                .send({
                    email: 'test@test.com'
                    // Missing password, fullName, etc.
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('POST /api/v1/users/login', () => {
        let testUser;
        const testPassword = 'Test@1234';

        beforeEach(async () => {
            testUser = await createTestUser({ password: testPassword });
        });

        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: testUser.email,
                    password: testPassword
                })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user).toHaveProperty('email', testUser.email);
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        it('should fail with incorrect password', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword123!'
                })
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/invalid credentials/i);
        });

        it('should fail with non-existent email', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: testPassword
                })
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should fail with missing credentials', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: testUser.email
                    // Missing password
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should update lastLogin timestamp', async () => {
            const beforeLogin = testUser.lastLogin;

            await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: testUser.email,
                    password: testPassword
                })
                .expect(200);

            const updatedUser = await User.findById(testUser._id);
            expect(updatedUser.lastLogin).toBeDefined();

            if (beforeLogin) {
                expect(updatedUser.lastLogin.getTime()).toBeGreaterThan(beforeLogin.getTime());
            }
        });
    });

    describe('GET /api/v1/users/profile', () => {
        let testUser;
        let authToken;

        beforeEach(async () => {
            testUser = await createTestUser();
            authToken = generateAuthToken(testUser);
        });

        it('should get user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/v1/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('email', testUser.email);
            expect(response.body.data).toHaveProperty('fullName', testUser.fullName);
            expect(response.body.data).not.toHaveProperty('password');
        });

        it('should fail without authentication token', async () => {
            const response = await request(app)
                .get('/api/v1/users/profile')
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/unauthorized/i);
        });

        it('should fail with invalid token', async () => {
            const response = await request(app)
                .get('/api/v1/users/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should fail with expired token', async () => {
            const jwt = require('jsonwebtoken');
            const expiredToken = jwt.sign(
                { id: testUser._id },
                process.env.JWT_SECRET || 'test_jwt_secret',
                { expiresIn: '-1h' } // Already expired
            );

            const response = await request(app)
                .get('/api/v1/users/profile')
                .set('Authorization', `Bearer ${expiredToken}`)
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('PUT /api/v1/users/profile', () => {
        let testUser;
        let authToken;

        beforeEach(async () => {
            testUser = await createTestUser();
            authToken = generateAuthToken(testUser);
        });

        it('should update user profile successfully', async () => {
            const updateData = {
                fullName: 'Updated Name',
                phoneNumber: '0987654321'
            };

            const response = await request(app)
                .put('/api/v1/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('fullName', updateData.fullName);
            expect(response.body.data).toHaveProperty('phoneNumber', updateData.phoneNumber);

            // Verify in database
            const updatedUser = await User.findById(testUser._id);
            expect(updatedUser.fullName).toBe(updateData.fullName);
            expect(updatedUser.phoneNumber).toBe(updateData.phoneNumber);
        });

        it('should not allow updating email', async () => {
            const response = await request(app)
                .put('/api/v1/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'newemail@test.com'
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should not allow updating password directly', async () => {
            const response = await request(app)
                .put('/api/v1/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    password: 'NewPassword123!'
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .put('/api/v1/users/profile')
                .send({
                    fullName: 'Updated Name'
                })
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('POST /api/v1/users/logout', () => {
        let testUser;
        let authToken;

        beforeEach(async () => {
            testUser = await createTestUser();
            authToken = generateAuthToken(testUser);
        });

        it('should logout successfully', async () => {
            const response = await request(app)
                .post('/api/v1/users/logout')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.message).toMatch(/logout/i);
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/v1/users/logout')
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('Admin-only Routes', () => {
        let adminUser;
        let regularUser;
        let adminToken;
        let userToken;

        beforeEach(async () => {
            adminUser = await createTestAdmin();
            regularUser = await createTestUser();
            adminToken = generateAuthToken(adminUser);
            userToken = generateAuthToken(regularUser);
        });

        it('should allow admin to access admin routes', async () => {
            const response = await request(app)
                .get('/api/v1/admin/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
        });

        it('should deny regular user access to admin routes', async () => {
            const response = await request(app)
                .get('/api/v1/admin/users')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/forbidden|admin/i);
        });
    });
});
