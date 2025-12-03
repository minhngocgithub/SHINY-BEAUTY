const Campaign = require('../models/campaign.models');
const User = require('../models/user.models');
const Product = require('../models/product.models');
const Order = require('../models/order.models');
const logger = require('../config/logger');

class CampaignService {
    /**
     * Get target users based on segment
     * @returns {Array} User IDs
     */
    static async getTargetUsers(campaign) {
        let query = { isActive: true }; // Only active users

        switch (campaign.targetSegment) {
            case 'ALL_USERS':
                // No additional filters
                break;

            case 'LOYALTY_TIER':
                if (campaign.segmentFilters.loyaltyTiers?.length > 0) {
                    query['loyalty.tier'] = {
                        $in: campaign.segmentFilters.loyaltyTiers
                    };
                }
                break;

            case 'PURCHASED_CATEGORY':
                if (campaign.segmentFilters.categoryIds?.length > 0) {
                    const usersWithOrders = await Order.distinct('user', {
                        'orderItems.product': {
                            $in: await Product.distinct('_id', {
                                category: { $in: campaign.segmentFilters.categoryIds }
                            })
                        }
                    });
                    query._id = { $in: usersWithOrders };
                }
                break;

            case 'WISHLIST_PRODUCT':
                if (campaign.segmentFilters.productIds?.length > 0) {
                    query['wishlist'] = {
                        $in: campaign.segmentFilters.productIds
                    };
                }
                break;

            case 'CART_ABANDONED':
                // Users with cart items but no order in last 24h
                const cartsWithItems = await this.getAbandonedCarts();
                query._id = { $in: cartsWithItems };
                break;

            case 'BIRTHDAY_THIS_MONTH':
                const currentMonth = new Date().getMonth() + 1;
                query.$expr = {
                    $eq: [{ $month: '$birthday' }, currentMonth]
                };
                break;

            case 'CUSTOM_QUERY':
                if (campaign.segmentFilters.customQuery) {
                    query = { ...query, ...campaign.segmentFilters.customQuery };
                }
                break;
        }

        // Additional filters
        if (campaign.segmentFilters.minOrderValue || campaign.segmentFilters.maxOrderValue) {
            const orderQuery = {};
            if (campaign.segmentFilters.minOrderValue) {
                orderQuery['totalSpent'] = { $gte: campaign.segmentFilters.minOrderValue };
            }
            if (campaign.segmentFilters.maxOrderValue) {
                orderQuery['totalSpent'] = { ...orderQuery['totalSpent'], $lte: campaign.segmentFilters.maxOrderValue };
            }

            const matchingUsers = await User.find(orderQuery).distinct('_id');
            query._id = query._id ? { $in: matchingUsers } : { $in: matchingUsers };
        }

        // Get users
        const users = await User.find(query)
            .select('_id email fullName notificationPreferences')
            .lean();

        logger.info(`Campaign ${campaign._id}: Found ${users.length} target users`);

        return users;
    }

    /**
     * Get abandoned carts (cart with items but no order)
     */
    static async getAbandonedCarts() {
        const redis = require('../config/redis');
        const keys = await redis.keys('cart:*');

        const abandonedUsers = [];
        for (const key of keys) {
            const userId = key.replace('cart:', '');
            const cart = await redis.get(key);

            if (cart) {
                const cartData = JSON.parse(cart);
                if (cartData.items && cartData.items.length > 0) {
                    // Check if user has ordered in last 24h
                    const recentOrder = await Order.findOne({
                        user: userId,
                        createdAt: { $gte: new Date(Date.now() - 86400000) }
                    });

                    if (!recentOrder) {
                        abandonedUsers.push(userId);
                    }
                }
            }
        }

        return abandonedUsers;
    }

    /**
     * Estimate campaign reach
     */
    static async estimateCampaignReach(segmentConfig) {
        const tempCampaign = {
            targetSegment: segmentConfig.targetSegment,
            segmentFilters: segmentConfig.segmentFilters
        };

        const users = await this.getTargetUsers(tempCampaign);
        return users.length;
    }

    /**
     * Validate campaign before sending
     */
    static async validateCampaign(campaign) {
        const errors = [];

        // Check content
        if (campaign.type === 'EMAIL' || campaign.type === 'BOTH') {
            if (!campaign.subject || !campaign.emailTemplate) {
                errors.push('Email campaigns require subject and template');
            }
        }

        if (campaign.type === 'NOTIFICATION' || campaign.type === 'BOTH') {
            if (!campaign.notificationTitle || !campaign.notificationMessage) {
                errors.push('Notification campaigns require title and message');
            }
        }

        // Check segment
        const targetCount = await this.estimateCampaignReach({
            targetSegment: campaign.targetSegment,
            segmentFilters: campaign.segmentFilters
        });

        if (targetCount === 0) {
            errors.push('No users match the target segment');
        }

        // Check schedule
        if (!campaign.sendImmediately && !campaign.scheduledAt) {
            errors.push('Must specify either sendImmediately or scheduledAt');
        }

        if (campaign.scheduledAt && new Date(campaign.scheduledAt) < new Date()) {
            errors.push('Scheduled time cannot be in the past');
        }

        return {
            valid: errors.length === 0,
            errors,
            estimatedReach: targetCount
        };
    }

    /**
     * Get campaign statistics
     */
    static async getCampaignStats(campaignId) {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        return {
            name: campaign.name,
            status: campaign.status,
            type: campaign.type,
            category: campaign.category,
            stats: {
                target: campaign.stats.targetCount,
                sent: campaign.stats.sentCount,
                delivered: campaign.stats.deliveredCount,
                failed: campaign.stats.failedCount,
                opened: campaign.stats.openedCount,
                clicked: campaign.stats.clickedCount,
                unsubscribed: campaign.stats.unsubscribedCount
            },
            rates: {
                delivery: campaign.deliveryRate,
                open: campaign.openRate,
                click: campaign.clickRate
            },
            timeline: {
                created: campaign.createdAt,
                scheduled: campaign.scheduledAt,
                started: campaign.startedAt,
                completed: campaign.completedAt
            }
        };
    }

    /**
     * Cancel campaign
     */
    static async cancelCampaign(campaignId, reason) {
        const campaign = await Campaign.findById(campaignId);

        if (!campaign) {
            throw new Error('Campaign not found');
        }

        if (campaign.status === 'COMPLETED') {
            throw new Error('Cannot cancel completed campaign');
        }

        campaign.status = 'CANCELLED';
        campaign.errorLog.push({
            error: `Cancelled: ${reason}`,
            timestamp: new Date()
        });

        await campaign.save();

        logger.info(`Campaign ${campaignId} cancelled: ${reason}`);

        return campaign;
    }

    /**
     * Get campaign performance summary
     */
    static async getCampaignsSummary(filters = {}) {
        const query = {};

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.category) {
            query.category = filters.category;
        }

        if (filters.dateFrom || filters.dateTo) {
            query.createdAt = {};
            if (filters.dateFrom) {
                query.createdAt.$gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                query.createdAt.$lte = new Date(filters.dateTo);
            }
        }

        const campaigns = await Campaign.find(query)
            .sort({ createdAt: -1 })
            .select('name type category status stats createdAt')
            .lean();

        const summary = {
            total: campaigns.length,
            byStatus: {},
            byCategory: {},
            totalSent: 0,
            totalDelivered: 0,
            totalOpened: 0,
            totalClicked: 0,
            avgOpenRate: 0,
            avgClickRate: 0
        };

        let openRateSum = 0;
        let clickRateSum = 0;
        let completedCount = 0;

        campaigns.forEach(campaign => {

            summary.byStatus[campaign.status] = (summary.byStatus[campaign.status] || 0) + 1;

            summary.byCategory[campaign.category] = (summary.byCategory[campaign.category] || 0) + 1;

            summary.totalSent += campaign.stats.sentCount || 0;
            summary.totalDelivered += campaign.stats.deliveredCount || 0;
            summary.totalOpened += campaign.stats.openedCount || 0;
            summary.totalClicked += campaign.stats.clickedCount || 0;

            if (campaign.status === 'COMPLETED' && campaign.stats.deliveredCount > 0) {
                openRateSum += (campaign.stats.openedCount / campaign.stats.deliveredCount) * 100;
                if (campaign.stats.openedCount > 0) {
                    clickRateSum += (campaign.stats.clickedCount / campaign.stats.openedCount) * 100;
                }
                completedCount++;
            }
        });

        if (completedCount > 0) {
            summary.avgOpenRate = (openRateSum / completedCount).toFixed(2);
            summary.avgClickRate = (clickRateSum / completedCount).toFixed(2);
        }

        return summary;
    }
}

module.exports = CampaignService;