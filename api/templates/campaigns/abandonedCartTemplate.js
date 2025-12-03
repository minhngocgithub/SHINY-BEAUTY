module.exports = (data) => require('./genericTemplate')({
    ...data,
    headerTitle: '🛒 You left something behind',
    headerSubtitle: 'Complete your purchase and get 10% OFF',
    headerColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
});
