module.exports = async () => {
    // Stop in-memory MongoDB server
    const mongoServer = global.__MONGOSERVER__;

    if (mongoServer) {
        await mongoServer.stop();
        console.log('\n🛑 Global Teardown: MongoDB Memory Server stopped\n');
    }
};
