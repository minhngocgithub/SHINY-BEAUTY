module.exports = (data) => require('./genericTemplate')({
    ...data,
    headerTitle: '💰 Price Drop Alert',
    headerSubtitle: 'Products on your wishlist are now cheaper!',
    headerColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
});
