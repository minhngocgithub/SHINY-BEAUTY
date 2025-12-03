module.exports = (data) => require('./genericTemplate')({
    ...data,
    headerTitle: '🎉 New Product Launch',
    headerSubtitle: 'Be the first to discover our latest collection',
    headerColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
});
