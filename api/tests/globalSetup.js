const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports = async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create({
        instance: {
            port: 27018, // Use different port from main DB
            dbName: 'cosmetic_test'
        }
    });

    const mongoUri = mongoServer.getUri();

    // Make URI available to all tests
    process.env.MONGODB_URI_TEST = mongoUri;
    process.env.NODE_ENV = 'test';

    // Store mongo server instance globally for teardown
    global.__MONGOSERVER__ = mongoServer;

    console.log('\n🚀 Global Setup: MongoDB Memory Server started');
    console.log(`📦 Test Database URI: ${mongoUri}\n`);
};
