const mongoose = require('mongoose');

/**
 * Connect to test database
 */
const connectTestDB = async () => {
    const mongoUri = process.env.MONGODB_URI_TEST;

    if (!mongoUri) {
        throw new Error('MONGODB_URI_TEST not set');
    }

    await mongoose.connect(mongoUri);
};

/**
 * Disconnect from test database
 */
const disconnectTestDB = async () => {
    await mongoose.connection.close();
};

/**
 * Clear all collections in test database
 */
const clearTestDB = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

/**
 * Drop test database
 */
const dropTestDB = async () => {
    await mongoose.connection.dropDatabase();
};

module.exports = {
    connectTestDB,
    disconnectTestDB,
    clearTestDB,
    dropTestDB
};
