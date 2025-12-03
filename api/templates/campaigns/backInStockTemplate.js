module.exports = (data) => require('./genericTemplate')({
    ...data,
    headerTitle: '🔔 Back in Stock',
    headerSubtitle: 'Your favorite products are available again!',
    headerColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
});
