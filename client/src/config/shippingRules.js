/**
 * Shipping Rules Configuration
 * Priority-based shipping calculation system
 */

export const SHIPPING_RULES = [
  {
    id: 'sale_program_benefit',
    priority: 100,
    description: 'Free shipping from Sale Program',
    check: (context) => context.cartBenefits?.freeShipping === true,
    calculate: () => ({ fee: 0, reason: 'SALE_PROGRAM_BENEFIT' })
  },
  {
    id: 'loyalty_tier_benefit',
    priority: 80,
    description: 'Free shipping from Loyalty Tier',
    check: (context) => context.userLoyaltyTier?.benefits?.freeShipping === true,
    calculate: () => ({ fee: 0, reason: 'LOYALTY_TIER_BENEFIT' })
  },
  {
    id: 'product_free_shipping',
    priority: 70,
    description: 'Product-level free shipping',
    check: (context) => {
      return context.items?.some(item =>
        item.product?.freeShipping === true || item.bundle?.freeShipping === true
      )
    },
    calculate: () => ({ fee: 0, reason: 'PRODUCT_FREE_SHIPPING' })
  },
  {
    id: 'quantity_threshold',
    priority: 60,
    description: 'Free shipping for 5+ items',
    check: (context) => {
      const totalQty = context.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0
      return totalQty >= 5
    },
    calculate: () => ({ fee: 0, reason: 'QUANTITY_THRESHOLD' })
  },
  {
    id: 'subtotal_threshold',
    priority: 50,
    description: 'Free shipping for orders >= $50',
    check: (context) => context.subtotal >= 50,
    calculate: () => ({ fee: 0, reason: 'SUBTOTAL_THRESHOLD' })
  },
  {
    id: 'distance_based_vn',
    priority: 40,
    description: 'Vietnam distance-based shipping',
    check: (context) => context.shippingAddress?.city && context.useVNShipping === true,
    calculate: (context) => {
      const city = context.shippingAddress?.city || 'Hà Nội'

      // Import shipping service data
      const VN_SHIPPING_RATES = {
        'Hà Nội': 0, // Nội thành freeship
        'Hải Phòng': 0.8, // 60,000 VND ≈ $0.8 
        'Đà Nẵng': 1.8, // 140,000 VND ≈ $1.8
        'Hồ Chí Minh': 2.4, // 180,000 VND ≈ $2.4
        'Cần Thơ': 2.5,
        'default': 1.0
      }

      const fee = VN_SHIPPING_RATES[city] || VN_SHIPPING_RATES.default
      return {
        fee,
        reason: fee === 0 ? 'VN_LOCAL_FREESHIP' : 'VN_DISTANCE_BASED',
        city
      }
    }
  },
  {
    id: 'cod_surcharge',
    priority: 20,
    description: 'COD payment surcharge',
    check: (context) => context.paymentMethod === 'COD',
    calculate: (context) => {
      const baseFee = context.baseFee || 5
      const codSurcharge = 1.5
      return {
        fee: baseFee + codSurcharge,
        reason: 'COD_SURCHARGE',
        breakdown: { base: baseFee, surcharge: codSurcharge }
      }
    }
  },
  {
    id: 'standard_rate',
    priority: 0,
    description: 'Standard shipping rate',
    check: () => true, // Always applies as fallback
    calculate: () => ({ fee: 5, reason: 'STANDARD_RATE' })
  }
]

/**
 * Calculate shipping fee based on priority rules
 * @param {Object} context - Shipping calculation context
 * @returns {Object} { fee, reason, breakdown }
 */
export const calculateShippingFee = (context = {}) => {
  // Ensure context has required fields
  const ctx = {
    items: context.items || [],
    subtotal: context.subtotal || 0,
    cartBenefits: context.cartBenefits || {},
    userLoyaltyTier: context.userLoyaltyTier || null,
    shippingAddress: context.shippingAddress || null,
    paymentMethod: context.paymentMethod || 'STRIPE',
    useVNShipping: context.useVNShipping || false,
    ...context
  }

  // Sort rules by priority (highest first)
  const sortedRules = [...SHIPPING_RULES].sort((a, b) => b.priority - a.priority)

  // Find first matching rule
  for (const rule of sortedRules) {
    try {
      if (rule.check(ctx)) {
        const result = rule.calculate(ctx)
        return {
          fee: result.fee || 0,
          reason: result.reason || rule.id,
          rule: rule.id,
          description: rule.description,
          breakdown: result.breakdown || null,
          city: result.city || null
        }
      }
    } catch (error) {
      console.warn(`Shipping rule "${rule.id}" failed:`, error)
      continue
    }
  }

  // Fallback to standard rate
  return {
    fee: 5,
    reason: 'FALLBACK',
    rule: 'standard_rate',
    description: 'Standard rate (fallback)'
  }
}

/**
 * Format shipping reason for display
 */
export const formatShippingReason = (reason) => {
  const messages = {
    SALE_PROGRAM_BENEFIT: '🎉 Free Shipping (Sale Program)',
    LOYALTY_TIER_BENEFIT: '⭐ Free Shipping (VIP Member)',
    PRODUCT_FREE_SHIPPING: '🎁 Free Shipping (Product Benefit)',
    QUANTITY_THRESHOLD: '📦 Free Shipping (5+ Items)',
    SUBTOTAL_THRESHOLD: '💰 Free Shipping ($50+ Order)',
    VN_LOCAL_FREESHIP: '🇻🇳 Free Shipping (Hanoi Local)',
    VN_DISTANCE_BASED: '🇻🇳 Vietnam Shipping',
    COD_SURCHARGE: '💵 Cash on Delivery',
    STANDARD_RATE: '📮 Standard Shipping',
    FALLBACK: 'Standard Shipping'
  }
  return messages[reason] || reason
}

/**
 * Get all applicable shipping benefits
 */
export const getShippingBenefits = (context) => {
  const benefits = []

  if (context.cartBenefits?.freeShipping) {
    benefits.push({ type: 'sale_program', message: 'Free Shipping from Sale Program' })
  }

  if (context.userLoyaltyTier?.benefits?.freeShipping) {
    benefits.push({ type: 'loyalty', message: `Free Shipping for ${context.userLoyaltyTier.name} Members` })
  }

  if (context.subtotal >= 50) {
    benefits.push({ type: 'threshold', message: 'Free Shipping on $50+ Orders' })
  }

  const totalQty = context.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0
  if (totalQty >= 5) {
    benefits.push({ type: 'quantity', message: 'Free Shipping on 5+ Items' })
  }

  return benefits
}

export default {
  SHIPPING_RULES,
  calculateShippingFee,
  formatShippingReason,
  getShippingBenefits
}
