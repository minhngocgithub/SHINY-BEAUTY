const User = require('../models/user.models');
const mongoose = require('mongoose');

class LoyaltyService {
    static getTierBenefits(tier) {
        const TIER_BENEFITS = {
            NEW_CUSTOMER: {
                name: 'New Customer',
                discountRate: 0,
                freeShippingThreshold: 4,
                pointsMultiplier: 1,
                earlyAccess: false,
                birthdayGift: false
            },
            REGULAR: {
                name: 'Regular Customer',
                discountRate: 0.05,
                freeShippingThreshold: 3,
                pointsMultiplier: 1.2,
                earlyAccess: false,
                birthdayGift: true
            },
            VIP: {
                name: 'VIP Customer',
                discountRate: 0.10,
                freeShippingThreshold: 2,
                pointsMultiplier: 1.5,
                earlyAccess: true,
                birthdayGift: true,
                exclusiveProducts: true
            },
            PLATINUM: {
                name: 'Platinum Elite',
                discountRate: 0.15,
                freeShippingThreshold: 0,
                pointsMultiplier: 2,
                earlyAccess: true,
                birthdayGift: true,
                exclusiveProducts: true,
                conciergeService: true
            }
        };

        return TIER_BENEFITS[tier] || TIER_BENEFITS.NEW_CUSTOMER;
    }

    static calculateDiscount(user, orderAmount) {
        if (!user || !user.loyaltyProfile) {
            return 0;
        }

        const benefits = this.getTierBenefits(user.loyaltyProfile.tier);
        return Math.round((orderAmount * benefits.discountRate) * 100) / 100;
    }

    static isEligibleForFreeShipping(user, orderAmount) {
        if (!user || !user.loyaltyProfile) {
            return orderAmount >= 100; // Default threshold
        }

        const benefits = this.getTierBenefits(user.loyaltyProfile.tier);
        return orderAmount >= benefits.freeShippingThreshold;
    }

    static calculatePointsToEarn(user, orderAmount) {
        if (!user || !user.loyaltyProfile) {
            return Math.floor(orderAmount); // Default 1:1 ratio
        }

        const benefits = this.getTierBenefits(user.loyaltyProfile.tier);
        return Math.floor(orderAmount * benefits.pointsMultiplier);
    }
    static getRecommendationStrategy(user) {
        if (!user || !user.loyaltyProfile) {
            return { bestSeller: 0.65, newProduct: 0.35 };
        }

        const tier = user.loyaltyProfile.tier;
        const isNewCustomer = user.loyaltyProfile.totalOrders === 0;

        if (isNewCustomer) {
            return { bestSeller: 0.8, newProduct: 0.2 };
        }

        const hour = new Date().getHours();
        const isEveningOrWeekend = hour >= 18 || [0, 6].includes(new Date().getDay());

        let strategy;
        switch (tier) {
            case 'NEW_CUSTOMER':
                strategy = { bestSeller: 0.75, newProduct: 0.25 };
                break;

            case 'REGULAR':
                strategy = { bestSeller: 0.6, newProduct: 0.4 };
                break;

            case 'VIP':
                strategy = { bestSeller: 0.3, newProduct: 0.7 };
                break;

            case 'PLATINUM':
                strategy = { bestSeller: 0.2, newProduct: 0.8 };
                break;

            default:
                strategy = { bestSeller: 0.65, newProduct: 0.35 };
        }

        if (isEveningOrWeekend && tier !== 'NEW_CUSTOMER') {
            const adjustment = 0.1;
            strategy.newProduct = Math.min(0.9, strategy.newProduct + adjustment);
            strategy.bestSeller = 1 - strategy.newProduct;
        }

        return strategy;
    }
    static async getLoyaltyDashboard(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                console.log('User not found');
            }

            const benefits = this.getTierBenefits(user.loyaltyProfile.tier);
            const nextTierInfo = this.getNextTierInfo(user);

            return {
                currentTier: {
                    name: benefits.name,
                    tier: user.loyaltyProfile.tier,
                    benefits: benefits
                },
                points: user.loyaltyProfile.points,
                totalSpent: user.loyaltyProfile.totalSpent,
                totalOrders: user.loyaltyProfile.totalOrders,
                averageOrderValue: user.loyaltyProfile.averageOrderValue,
                nextTier: nextTierInfo,
                memberSince: user.createdAt,
                lastPurchase: user.loyaltyProfile.lastPurchaseDate
            };
        } catch (error) {
            console.log(`Error getting loyalty dashboard: ${error.message}`);
        }
    }
    static getNextTierInfo(user) {
        const currentTier = user.loyaltyProfile.tier;
        const totalSpent = user.loyaltyProfile.totalSpent;
        const totalOrders = user.loyaltyProfile.totalOrders;

        let nextTier, requiredSpending, requiredOrders;

        switch (currentTier) {
            case 'NEW_CUSTOMER':
                nextTier = 'REGULAR';
                requiredSpending = Math.max(0, 0 - totalSpent); // No spending requirement
                requiredOrders = Math.max(0, 3 - totalOrders);
                break;

            case 'REGULAR':
                nextTier = 'VIP';
                requiredSpending = Math.max(0, 1000 - totalSpent);
                requiredOrders = Math.max(0, 20 - totalOrders);
                break;

            case 'VIP':
                nextTier = 'PLATINUM';
                requiredSpending = Math.max(0, 2000 - totalSpent);
                requiredOrders = Math.max(0, 50 - totalOrders);
                break;

            case 'PLATINUM':
                return null;

            default:
                return null;
        }

        return {
            tier: nextTier,
            name: this.getTierBenefits(nextTier).name,
            requiredSpending,
            requiredOrders,
            progressSpending: requiredSpending === 0 ? 100 : ((totalSpent / (totalSpent + requiredSpending)) * 100),
            progressOrders: requiredOrders === 0 ? 100 : ((totalOrders / (totalOrders + requiredOrders)) * 100)
        };
    }

    static async updateUserTier(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const totalSpent = user.loyaltyProfile.totalSpent;
            const totalOrders = user.loyaltyProfile.totalOrders;
            let newTier = 'NEW_CUSTOMER';

            // Determine tier based on spending and orders
            if (totalSpent >= 2000 && totalOrders >= 50) {
                newTier = 'PLATINUM';
            } else if (totalSpent >= 1000 && totalOrders >= 20) {
                newTier = 'VIP';
            } else if (totalOrders >= 3) {
                newTier = 'REGULAR';
            }

            // Update tier if changed
            if (user.loyaltyProfile.tier !== newTier) {
                const oldTier = user.loyaltyProfile.tier;
                user.loyaltyProfile.tier = newTier;
                await user.save();

                console.log(`User ${userId} tier upgraded from ${oldTier} to ${newTier}`);
            }

            return user;
        } catch (error) {
            console.error('Error updating user tier:', error);
            throw error;
        }
    }

    static async syncUserLoyaltyData(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Convert userId to ObjectId for aggregation
            const userObjectId = new mongoose.Types.ObjectId(userId);

            const Order = mongoose.model('Order')

            // Get order statistics (exclude CANCELLED orders)
            const orderStats = await Order.aggregate([
                {
                    $match: {
                        user: userObjectId,
                        status: { $ne: 'CANCELLED' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalSpent: { $sum: '$totalPrice' },
                        averageOrderValue: { $avg: '$totalPrice' },
                        lastPurchaseDate: { $max: '$createdAt' }
                    }
                }
            ]);

            // Get total loyalty points from DELIVERED orders only
            const pointsStats = await Order.aggregate([
                {
                    $match: {
                        user: userObjectId,
                        status: 'DELIVERED',
                        loyaltyPointsEarned: { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPoints: { $sum: '$loyaltyPointsEarned' }
                    }
                }
            ]);

            const stats = orderStats[0] || {
                totalOrders: 0,
                totalSpent: 0,
                averageOrderValue: 0,
                lastPurchaseDate: null
            };

            const totalPoints = pointsStats[0]?.totalPoints || 0;

            console.log(`Syncing loyalty data for user ${userId}:`, stats, `Total points: ${totalPoints}`);

            // Update loyalty profile
            user.loyaltyProfile.totalOrders = stats.totalOrders;
            user.loyaltyProfile.totalSpent = stats.totalSpent;
            user.loyaltyProfile.averageOrderValue = stats.averageOrderValue || 0;
            user.loyaltyProfile.points = totalPoints; // Update total points from DELIVERED orders
            if (stats.lastPurchaseDate) {
                user.loyaltyProfile.lastPurchaseDate = stats.lastPurchaseDate;
            }

            await user.save();

            // Update tier based on new stats
            return await this.updateUserTier(userId);
        } catch (error) {
            console.error('Error syncing user loyalty data:', error);
            throw error;
        }
    }
}

module.exports = LoyaltyService;