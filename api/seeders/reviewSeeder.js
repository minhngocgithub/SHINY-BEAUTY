const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const User = require('../models/user.models');
const Product = require('../models/product.models');
const Review = require('../models/review.models');
const Order = require('../models/order.models');
const Category = require('../models/category.models');
const SubCategory = require('../models/subCategory.models');

// Professional review templates for 5-star reviews
const fiveStarReviews = [
    "I highly recommend this product to anyone looking to streamline their financial operations and gain better control over their finances. The attention to detail and customer support is outstanding!",
    "Before using this product, managing our financial processes was a constant headache. We struggled with manual data entry, scattered reports, and a lack of real-time visibility into our financial health. This solution transformed everything!",
    "This product has been a game-changer for my business! The intuitive interface makes complex tasks simple, and the customer support team is always ready to help. I couldn't be happier with my purchase.",
    "Exceptional quality and performance! I've tried many similar products, but this one stands out for its reliability and comprehensive features. Definitely worth every penny.",
    "Outstanding product that exceeded all my expectations! The build quality is superb, and it works flawlessly. I've recommended it to all my colleagues and friends.",
    "This is hands down the best investment I've made for my business. The ROI was visible within the first month. The team behind this product clearly understands what customers need.",
    "I was skeptical at first, but this product has proven to be indispensable. The ease of use combined with powerful features makes it perfect for both beginners and professionals.",
    "Absolutely love this product! It has saved me countless hours and significantly improved my workflow. The customer service is also top-notch - they respond quickly and are genuinely helpful.",
    "Five stars all the way! This product delivers on all its promises. The quality is excellent, setup was a breeze, and the results speak for themselves. Highly recommended!",
    "Game-changing product! I've been using it for several months now, and it continues to impress me. The regular updates and improvements show that the developers truly care about their users.",
    "Perfect solution for my needs! The product is well-designed, easy to use, and incredibly efficient. I particularly appreciate the attention to detail and the seamless integration with my existing tools.",
    "This product has transformed how I work. The time I save using it allows me to focus on more important tasks. The value for money is unbeatable, and I couldn't be more satisfied!",
    "Incredible product with amazing features! Everything works exactly as described, and the quality exceeds expectations. This is a must-have for anyone serious about improving their productivity.",
    "I'm thoroughly impressed with this purchase. The product quality is outstanding, the performance is flawless, and it has become an essential part of my daily routine. Absolutely recommended!",
    "Best purchase I've made this year! The product is reliable, user-friendly, and delivers consistent results. The support team is responsive and knowledgeable. Five stars without hesitation!"
];

const fourStarReviews = [
    "Great product overall! Works well for most of my needs. The only minor issue is the learning curve at the beginning, but once you get the hang of it, it's fantastic.",
    "Very satisfied with this purchase. The quality is good and it does what it promises. Would be perfect with a few more customization options.",
    "Solid product that delivers good value. Interface could be slightly more intuitive, but it gets the job done efficiently.",
    "Good quality and reliable performance. I've been using it for a few weeks now and it meets my expectations. Worth the investment.",
    "Pretty good product! Does exactly what I needed. The only reason I'm not giving 5 stars is because shipping took a bit longer than expected."
];

const threeStarReviews = [
    "Decent product for the price. It works as advertised but lacks some features I was hoping for. Still useful for basic needs.",
    "Average product. Gets the job done but nothing exceptional. Could use some improvements in user interface.",
    "It's okay. Works fine for basic tasks but I expected more advanced features based on the description."
];

// Realistic customer names
const customerNames = [
    "John Clayton", "Sarah Mitchell", "Michael Chen", "Emily Rodriguez",
    "David Thompson", "Jennifer Williams", "Robert Anderson", "Lisa Martinez",
    "James Wilson", "Maria Garcia", "William Taylor", "Jessica Brown",
    "Richard Davis", "Amanda Moore", "Thomas Jackson", "Michelle Lee",
    "Christopher White", "Stephanie Harris", "Daniel Martin", "Rebecca Clark"
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.CONNECT_DB_URL);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const createReviewUser = async (name) => {
    try {
        // Check if user exists
        const existingUser = await User.findOne({ email: name.toLowerCase().replace(' ', '.') + '@example.com' });
        if (existingUser) return existingUser;

        // Generate valid Vietnamese phone number (9-10 digits)
        const phone = '0' + faker.string.numeric(9);

        const user = await User.create({
            name: name,
            email: name.toLowerCase().replace(' ', '.') + '@example.com',
            password: 'Password@123',  // Valid password with special char
            role: 'user',
            avatar: {
                url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`,
                public_id: faker.string.uuid()
            },
            phone: phone,
            isEmailVerified: true
        });

        return user;
    } catch (error) {
        console.error('Error creating user:', error);
        return null;
    }
};

const createVerifiedOrder = async (userId, productId) => {
    try {
        const product = await Product.findById(productId);
        if (!product) return null;

        const order = await Order.create({
            user: userId,
            orderItems: [{
                product: productId,
                name: product.name,
                quantity: 1,
                price: product.price,
                originalPrice: product.price,
                image: product.image?.[0]?.url || product.image
            }],
            shippingAddress: {
                fullName: faker.person.fullName(),
                phone: '0' + faker.string.numeric(9),
                address: faker.location.streetAddress(),
                city: faker.location.city(),
                postalCode: faker.location.zipCode(),
                country: 'Vietnam',
                district: faker.location.county(),
                ward: faker.location.street()
            },
            paymentMethod: 'COD',
            itemsPrice: product.price,
            shippingPrice: 30000,
            totalPrice: product.price + 30000,
            isPaid: true,
            paidAt: faker.date.past({ years: 1 }),
            status: 'DELIVERED',
            deliveredAt: faker.date.past({ years: 1 })
        });

        return order;
    } catch (error) {
        console.error('Error creating order:', error);
        return null;
    }
};

const seedReviews = async () => {
    try {
        await connectDB();

        console.log('🌱 Starting review seeding...\n');

        // Get all active products
        const products = await Product.find({ isAvailable: true }).limit(20);

        if (products.length === 0) {
            console.log('❌ No products found. Please seed products first.');
            return;
        }

        console.log(`📦 Found ${products.length} products\n`);

        let createdCount = 0;
        let skippedCount = 0;

        for (const product of products) {
            // Create 1-3 reviews per product
            const reviewCount = faker.number.int({ min: 1, max: 3 });

            for (let i = 0; i < reviewCount; i++) {
                // 70% chance of 5-star, 20% chance of 4-star, 10% chance of 3-star
                const rand = Math.random();
                let rating, comment;

                if (rand < 0.7) {
                    rating = 5;
                    comment = faker.helpers.arrayElement(fiveStarReviews);
                } else if (rand < 0.9) {
                    rating = 4;
                    comment = faker.helpers.arrayElement(fourStarReviews);
                } else {
                    rating = 3;
                    comment = faker.helpers.arrayElement(threeStarReviews);
                }

                // Create user
                const userName = faker.helpers.arrayElement(customerNames);
                const user = await createReviewUser(userName);

                if (!user) {
                    skippedCount++;
                    continue;
                }

                // Check if user already reviewed this product
                const existingReview = await Review.findOne({
                    user: user._id,
                    product: product._id,
                    reviewType: 'rating'
                });

                if (existingReview) {
                    skippedCount++;
                    continue;
                }

                // Create verified order
                const order = await createVerifiedOrder(user._id, product._id);

                // Create review
                const review = await Review.create({
                    user: user._id,
                    product: product._id,
                    order: order?._id,
                    rating: rating,
                    comment: comment,
                    reviewType: 'rating',
                    verifiedPurchase: !!order,
                    status: 'published',
                    helpful: rating === 5 ? Array(faker.number.int({ min: 2, max: 15 })).fill(null).map(() => new mongoose.Types.ObjectId()) : [],
                    createdAt: faker.date.past({ years: 1 })
                });

                createdCount++;
                console.log(`✅ Created ${rating}⭐ review for "${product.name}" by ${userName}`);
            }
        }

        console.log(`\n✅ Seeding completed!`);
        console.log(`   Created: ${createdCount} reviews`);
        console.log(`   Skipped: ${skippedCount} reviews`);

        // Trigger testimonials cache
        console.log('\n🔄 Caching testimonials...');
        const topReviews = await Review.find({
            rating: 5,
            status: 'published',
            reviewType: 'rating',
            verifiedPurchase: true,
            comment: { $exists: true, $ne: '' },
            $expr: { $gte: [{ $strLenCP: '$comment' }, 30] }
        })
            .populate('user', 'name avatar')
            .populate('product', 'name image')
            .sort({ 'helpful.length': -1, createdAt: -1 })
            .limit(8)
            .lean();

        // Store in global cache
        global.cache = global.cache || {};
        global.cache.testimonials = {
            data: topReviews,
            timestamp: Date.now(),
            expiresIn: 30 * 24 * 60 * 60 * 1000 // 30 days
        };

        console.log(`✅ Cached ${topReviews.length} testimonials`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

// Run seeder
seedReviews();
