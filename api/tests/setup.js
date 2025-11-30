const mongoose = require('mongoose');

// Setup runs before each test file
beforeAll(async () => {
    // Use test database URI from global setup
    const mongoUri = process.env.MONGODB_URI_TEST;

    if (!mongoUri) {
        throw new Error('Test database URI not found. Global setup may have failed.');
    }

    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to test database');
    }
});

// Cleanup after each test
afterEach(async () => {
    // Clear all collections after each test
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// Cleanup after all tests in the file
afterAll(async () => {
    // Close database connection
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('✅ Disconnected from test database');
    }
});

// Suppress console logs during tests (optional)
global.console = {
    ...console,
    // Uncomment to suppress logs:
    // log: jest.fn(),
    // info: jest.fn(),
    // debug: jest.fn(),
    // Keep error and warn
    error: console.error,
    warn: console.warn,
};
