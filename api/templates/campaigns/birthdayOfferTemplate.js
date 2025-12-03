module.exports = (data) => require('./genericTemplate')({
    ...data,
    headerTitle: '🎂 Happy Birthday!',
    headerSubtitle: 'Celebrate with a special gift from us',
    headerColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
});
