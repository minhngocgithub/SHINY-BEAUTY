const SaleProgram = require('../models/saleProgram.models');

class SaleProgramTrackingService {
    /**
     * Update Sale Program stats when order is created/confirmed
     * @param {Object} order - Order document
     * @param {String} event - Event type: 'created' | 'confirmed' | 'cancelled' | 'delivered'
     */
    static async updateProgramStats(order, event = 'created') {
        try {
            if (!order) {
                console.warn('[SaleProgramTracking] No order provided');
                return;
            }

            const updates = [];

            // Track coupon program
            if (order.couponProgram && order.couponCode) {
                const couponUpdate = this._buildStatsUpdate(
                    order.couponProgram,
                    event,
                    order.couponDiscount || 0,
                    order.totalPrice
                );
                if (couponUpdate) updates.push(couponUpdate);
            }

            // Track applied programs
            if (order.appliedPrograms && order.appliedPrograms.length > 0) {
                for (const appliedProgram of order.appliedPrograms) {
                    if (appliedProgram.program) {
                        const programUpdate = this._buildStatsUpdate(
                            appliedProgram.program,
                            event,
                            appliedProgram.discountAmount || 0,
                            order.totalPrice
                        );
                        if (programUpdate) updates.push(programUpdate);
                    }
                }
            }

            // Execute all updates
            if (updates.length > 0) {
                await Promise.all(updates);
                console.log(`[SaleProgramTracking] Updated ${updates.length} programs for order ${order._id}, event: ${event}`);
            }

        } catch (error) {
            console.error('[SaleProgramTracking] Error updating program stats:', error);
            // Don't throw - this should not break order flow
        }
    }

    /**
     * Build stats update operation based on event
     * @private
     */
    static _buildStatsUpdate(programId, event, discountAmount, orderTotal) {
        let updateOps = {};

        switch (event) {
            case 'created':
                // Increment usage counter when order created
                updateOps = {
                    $inc: {
                        currentUsage: 1,
                        'stats.applications': 1
                    }
                };
                break;

            case 'confirmed':
            case 'delivered':
                // Increment successful orders and revenue when order confirmed/delivered
                updateOps = {
                    $inc: {
                        'stats.successfulOrders': 1,
                        'stats.totalRevenue': orderTotal || 0,
                        'stats.totalDiscount': discountAmount || 0
                    }
                };
                break;

            case 'cancelled':
                // Decrement usage when order cancelled
                updateOps = {
                    $inc: {
                        currentUsage: -1,
                        'stats.applications': -1
                    }
                };
                break;

            default:
                return null;
        }

        return SaleProgram.findByIdAndUpdate(
            programId,
            updateOps,
            { new: true }
        );
    }

    /**
     * Recalculate stats from all orders (useful for data migration or fixing discrepancies)
     * @param {String} programId - Sale Program ID
     */
    static async recalculateStats(programId) {
        try {
            const Order = require('../models/order.models');

            // Count orders using this program
            const [couponOrders, appliedProgramOrders] = await Promise.all([
                Order.find({
                    couponProgram: programId,
                    status: { $in: ['CONFIRMED', 'PREPARING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'] }
                }),
                Order.find({
                    'appliedPrograms.program': programId,
                    status: { $in: ['CONFIRMED', 'PREPARING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'] }
                })
            ]);

            // Combine and deduplicate
            const allOrders = [...new Set([...couponOrders, ...appliedProgramOrders])];

            const stats = {
                successfulOrders: allOrders.length,
                totalRevenue: 0,
                totalDiscount: 0
            };

            allOrders.forEach(order => {
                stats.totalRevenue += order.totalPrice || 0;

                // Add coupon discount
                if (order.couponProgram?.toString() === programId.toString()) {
                    stats.totalDiscount += order.couponDiscount || 0;
                }

                // Add applied program discounts
                if (order.appliedPrograms) {
                    order.appliedPrograms.forEach(ap => {
                        if (ap.program?.toString() === programId.toString()) {
                            stats.totalDiscount += ap.discountAmount || 0;
                        }
                    });
                }
            });

            // Count total usage (including pending orders)
            const totalUsage = await Order.countDocuments({
                $or: [
                    { couponProgram: programId },
                    { 'appliedPrograms.program': programId }
                ]
            });

            // Update Sale Program
            await SaleProgram.findByIdAndUpdate(programId, {
                currentUsage: totalUsage,
                'stats.successfulOrders': stats.successfulOrders,
                'stats.totalRevenue': stats.totalRevenue,
                'stats.totalDiscount': stats.totalDiscount
            });

            console.log(`[SaleProgramTracking] Recalculated stats for program ${programId}:`, stats);
            return stats;

        } catch (error) {
            console.error('[SaleProgramTracking] Error recalculating stats:', error);
            throw error;
        }
    }

    /**
     * Batch recalculate stats for all programs
     */
    static async recalculateAllStats() {
        try {
            const programs = await SaleProgram.find({}).select('_id');

            console.log(`[SaleProgramTracking] Recalculating stats for ${programs.length} programs...`);

            for (const program of programs) {
                await this.recalculateStats(program._id);
            }

            console.log(`[SaleProgramTracking] Completed recalculation for all programs`);

        } catch (error) {
            console.error('[SaleProgramTracking] Error in batch recalculation:', error);
            throw error;
        }
    }
}

module.exports = SaleProgramTrackingService;
