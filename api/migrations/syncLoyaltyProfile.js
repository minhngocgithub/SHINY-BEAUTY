/**
 * Migration Script: Sync Loyalty Profile Data
 * 
 * This script recalculates and syncs totalSpent and totalOrders for all users
 * based on their DELIVERED orders. This fixes the issue where loyalty points
 * were awarded but spending/order counts were not tracked.
 * 
 * Run: node api/migrations/syncLoyaltyProfile.js
 */

const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const User = require('../models/user.models')
const Order = require('../models/order.models')

const syncLoyaltyProfiles = async () => {
  try {
    console.log('🔄 Starting loyalty profile synchronization...')
    
    // Connect to MongoDB
    await mongoose.connect(process.env.CONNECT_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB')

    // Get all users
    const users = await User.find({})
    console.log(`📊 Found ${users.length} users to process`)

    let updatedCount = 0
    let skippedCount = 0

    for (const user of users) {
      // Get all DELIVERED orders for this user
      const deliveredOrders = await Order.find({
        user: user._id,
        status: 'DELIVERED'
      }).select('totalPrice loyaltyPointsEarned createdAt')

      if (deliveredOrders.length === 0) {
        skippedCount++
        continue
      }

      // Calculate totals from actual orders
      const actualTotalOrders = deliveredOrders.length
      const actualTotalSpent = deliveredOrders.reduce((sum, order) => sum + order.totalPrice, 0)
      const actualAverageOrderValue = actualTotalSpent / actualTotalOrders

      // Find last purchase date
      const lastPurchase = deliveredOrders.reduce((latest, order) => {
        return order.createdAt > latest ? order.createdAt : latest
      }, deliveredOrders[0].createdAt)

      // Calculate actual points earned (might differ from current points if some were used)
      const totalPointsEarned = deliveredOrders.reduce((sum, order) => {
        return sum + (order.loyaltyPointsEarned || 0)
      }, 0)

      // Current loyalty profile
      const currentProfile = user.loyaltyProfile
      const currentTier = currentProfile.tier

      console.log(`\n👤 User: ${user.email}`)
      console.log(`   Current: Orders=${currentProfile.totalOrders}, Spent=$${currentProfile.totalSpent.toFixed(2)}, Points=${currentProfile.points}`)
      console.log(`   Actual:  Orders=${actualTotalOrders}, Spent=$${actualTotalSpent.toFixed(2)}, Earned=${totalPointsEarned}`)

      // Update loyalty profile with correct values
      user.loyaltyProfile.totalOrders = actualTotalOrders
      user.loyaltyProfile.totalSpent = actualTotalSpent
      user.loyaltyProfile.averageOrderValue = actualAverageOrderValue
      user.loyaltyProfile.lastPurchaseDate = lastPurchase

      // Note: We keep the current points value as it might have been used/redeemed
      // But we log the difference for verification
      if (Math.abs(currentProfile.points - totalPointsEarned) > 0) {
        console.log(`   ⚠️  Points difference: ${totalPointsEarned - currentProfile.points} (likely used/redeemed)`)
      }

      // Recalculate tier based on actual spending and orders
      const newTier = user.calculateTier()
      user.loyaltyProfile.tier = newTier

      if (currentTier !== newTier) {
        console.log(`   🎯 Tier updated: ${currentTier} → ${newTier}`)
      }

      // Save updated user
      await user.save()
      updatedCount++

      console.log(`   ✅ Synced successfully`)
    }

    console.log('\n' + '='.repeat(60))
    console.log(`✅ Migration completed!`)
    console.log(`   - Updated: ${updatedCount} users`)
    console.log(`   - Skipped: ${skippedCount} users (no delivered orders)`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run migration
syncLoyaltyProfiles()
