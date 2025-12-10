const mongoose = require('mongoose');
const Review = require('../models/review.models');

const verifyReviews = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/shiny_beauty_dev');
        console.log('✅ Connected to MongoDB');

        const totalCount = await Review.countDocuments();
        const fiveStarCount = await Review.countDocuments({ rating: 5, status: 'published', verifiedPurchase: true });
        const fourStarCount = await Review.countDocuments({ rating: 4, status: 'published' });
        const threeStarCount = await Review.countDocuments({ rating: 3, status: 'published' });

        console.log('\n📊 Review Statistics:');
        console.log(`   Total reviews: ${totalCount}`);
        console.log(`   5⭐ reviews (verified): ${fiveStarCount}`);
        console.log(`   4⭐ reviews: ${fourStarCount}`);
        console.log(`   3⭐ reviews: ${threeStarCount}`);

        // Get sample testimonials
        const testimonials = await Review.find({
            rating: 5,
            status: 'published',
            verifiedPurchase: true,
            $expr: { $gte: [{ $strLenCP: '$comment' }, 30] }
        })
            .populate('user', 'name')
            .populate('product', 'name')
            .limit(3)
            .lean();

        console.log('\n✨ Sample Testimonials:');
        testimonials.forEach((review, idx) => {
            console.log(`\n${idx + 1}. ${review.user?.name} - ${review.product?.name}`);
            console.log(`   ⭐ Rating: ${review.rating}/5`);
            console.log(`   💬 "${review.comment.substring(0, 80)}..."`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyReviews();
