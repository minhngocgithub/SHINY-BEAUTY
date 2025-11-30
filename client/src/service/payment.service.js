import axios from "axios"
import axiosApiInstance from '../../utils/api'
axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_PAYMENT_API = '/payment'

// ==================== PAYMENT API CALLS ====================

export const createOrderWithPaymentApi = async (orderData) => {
  return await axiosApiInstance.post(`${BASE_PAYMENT_API}/create-order`, orderData)
}

export const verifyStripePaymentApi = async (sessionId) => {
  return await axiosApiInstance.post(`${BASE_PAYMENT_API}/stripe/verify`, { sessionId })
}

export const getPaymentMethodsApi = async () => {
  return await axiosApiInstance.get(`${BASE_PAYMENT_API}/methods`)
}

export const getPaymentStatusApi = async (orderId) => {
  return await axiosApiInstance.get(`${BASE_PAYMENT_API}/status/${orderId}`)
}

// ==================== PAYMENT METHODS ====================

export const PAYMENT_METHODS = {
  STRIPE: 'STRIPE',
  MOMO: 'MOMO',
  ZALOPAY: 'ZALOPAY',
  COD: 'COD'
}

export const getPaymentMethodLabel = (method) => {
  const labels = {
    STRIPE: 'Credit Card (Stripe)',
    MOMO: 'MoMo Wallet',
    ZALOPAY: 'ZaloPay',
    COD: 'Cash on Delivery'
  }
  return labels[method] || method
}

export const getPaymentMethodDescription = (method) => {
  const descriptions = {
    STRIPE: 'Visa, Mastercard, American Express',
    MOMO: 'Vietnam Mobile Money Wallet',
    ZALOPAY: 'Vietnam E-Wallet',
    COD: 'Pay when you receive your order'
  }
  return descriptions[method] || ''
}

export const getPaymentMethodIcon = (method) => {
  const icons = {
    STRIPE: '💳',
    MOMO: '📱',
    ZALOPAY: '📱',
    COD: '💵'
  }
  return icons[method] || '💰'
}

// ==================== ORDER PAYLOAD BUILDERS ====================

export const buildOrderPayload = (checkoutItems, shippingAddress, paymentMethod, couponCode = null, loyaltyPoints = 0, note = '') => {
  // Convert wishlist items to cart items format for backend
  const cartItems = checkoutItems.map(item => ({
    itemType: item.product ? 'product' : 'bundle',
    productId: item.product?._id,
    bundleId: item.bundle?._id,
    quantity: item.quantity || 1
  }))

  return {
    cartItems,
    shippingAddress: {
      fullName: shippingAddress.name,
      phone: shippingAddress.phone,
      email: shippingAddress.email,
      address: shippingAddress.address,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipCode: shippingAddress.zipCode,
      country: shippingAddress.country || 'VN'
    },
    paymentMethod,
    couponCode,
    loyaltyPointsUsed: Math.max(0, loyaltyPoints),
    note
  }
}

// ==================== PRICE CALCULATION ====================

/**
 * Calculate order pricing with shipping rules support
 * @param {Array} checkoutItems - Items in checkout
 * @param {Number} loyaltyPoints - Loyalty points to use
 * @param {Number} couponDiscount - Coupon discount percentage
 * @param {Object} cartBenefits - Cart benefits from backend (includes freeShipping)
 * @param {Object} options - Additional options (userLoyaltyTier, shippingAddress, paymentMethod)
 * @returns {Object} Pricing breakdown
 */
export const calculateOrderPricing = (
  checkoutItems,
  loyaltyPoints = 0,
  couponDiscount = 0,
  cartBenefits = {},
  options = {}
) => {
  // Calculate subtotal
  const subtotal = checkoutItems.reduce((sum, item) => {
    const price = item.product?.finalPrice || item.product?.salePrice || item.product?.price || 0
    return sum + (price * (item.quantity || 1))
  }, 0)

  // Calculate shipping using priority-based rules
  let shippingPrice = 0
  let shippingReason = 'STANDARD_RATE'

  // Priority 1: Check Sale Program Free Shipping benefit
  if (cartBenefits?.freeShipping === true) {
    shippingPrice = 0
    shippingReason = 'SALE_PROGRAM_BENEFIT'
  }
  // Priority 2: Check Loyalty Tier benefit
  else if (options.userLoyaltyTier?.benefits?.freeShipping === true) {
    shippingPrice = 0
    shippingReason = 'LOYALTY_TIER_BENEFIT'
  }
  // Priority 3: Check product-level free shipping
  else if (checkoutItems.some(item => item.product?.freeShipping === true)) {
    shippingPrice = 0
    shippingReason = 'PRODUCT_FREE_SHIPPING'
  }
  // Priority 4: Check quantity threshold (10+ items)
  else if (checkoutItems.reduce((sum, item) => sum + (item.quantity || 1), 0) >= 10) {
    shippingPrice = 0
    shippingReason = 'QUANTITY_THRESHOLD'
  }
  // Priority 5: Check subtotal threshold ($50+)
  else if (subtotal >= 50) {
    shippingPrice = 0
    shippingReason = 'SUBTOTAL_THRESHOLD'
  }
  // Priority 6: Use calculated distance-based shipping (from API)
  else if (options.calculatedShipping) {
    shippingPrice = options.calculatedShipping.fee || 0
    shippingReason = options.calculatedShipping.reason || 'DISTANCE_BASED'

    // Apply COD surcharge if applicable
    if (options.paymentMethod === 'COD' && shippingPrice > 0) {
      shippingPrice += 1.5
      shippingReason = 'DISTANCE_BASED_COD'
    }
  }
  // Priority 7: COD surcharge on standard rate
  else if (options.paymentMethod === 'COD') {
    shippingPrice = 6.5 // Base $5 + $1.5 COD surcharge
    shippingReason = 'COD_SURCHARGE'
  }
  // Default: Standard rate (fallback if no address provided)
  else {
    shippingPrice = 5
    shippingReason = 'STANDARD_RATE'
  }

  // Calculate tax (10%)
  const taxPrice = subtotal * 0.1

  // Loyalty points discount (1 point = $1 USD)
  const loyaltyDiscount = loyaltyPoints

  // Apply coupon discount percentage
  const couponDiscountAmount = couponDiscount > 0 ? (subtotal * couponDiscount) / 100 : 0

  // Total
  const totalPrice = Math.max(0, subtotal + shippingPrice + taxPrice - couponDiscountAmount - loyaltyDiscount)

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    shippingPrice: parseFloat(shippingPrice.toFixed(2)),
    taxPrice: parseFloat(taxPrice.toFixed(2)),
    loyaltyDiscount: parseFloat(loyaltyDiscount.toFixed(2)),
    couponDiscount: parseFloat(couponDiscountAmount.toFixed(2)),
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    isFreeShipping: shippingPrice === 0,
    shippingReason, // Add reason for transparency
    // Formatted strings for display
    formatted: {
      subtotal: subtotal.toFixed(2),
      shippingPrice: shippingPrice.toFixed(2),
      taxPrice: taxPrice.toFixed(2),
      loyaltyDiscount: loyaltyDiscount.toFixed(2),
      couponDiscount: couponDiscountAmount.toFixed(2),
      totalPrice: totalPrice.toFixed(2)
    }
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
    QUANTITY_THRESHOLD: '📦 Free Shipping (10+ Items)',
    SUBTOTAL_THRESHOLD: '💰 Free Shipping ($50+ Order)',
    DISTANCE_BASED: '📍 Distance-based Shipping',
    DISTANCE_BASED_COD: '📍 Distance + COD (+$1.50)',
    COD_SURCHARGE: '💵 Cash on Delivery (+$1.50)',
    STANDARD_RATE: '📮 Standard Shipping',
  }
  return messages[reason] || 'Standard Shipping'
}

// ==================== VALIDATION ====================

export const validateShippingAddress = (address) => {
  const errors = {}

  if (!address.name?.trim()) {
    errors.name = 'Full name is required'
  }

  if (!address.phone?.trim()) {
    errors.phone = 'Phone number is required'
  } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(address.phone)) {
    errors.phone = 'Invalid phone number'
  }

  if (!address.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
    errors.email = 'Invalid email address'
  }

  if (!address.address?.trim()) {
    errors.address = 'Street address is required'
  }

  if (!address.city?.trim()) {
    errors.city = 'City is required'
  }

  if (!address.state?.trim()) {
    errors.state = 'State/Province is required'
  }

  if (!address.zipCode?.trim()) {
    errors.zipCode = 'Zip/Postal code is required'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export const validatePaymentMethod = (method) => {
  const validMethods = Object.values(PAYMENT_METHODS)
  return validMethods.includes(method)
}

export const validateCheckoutItems = (items) => {
  if (!items || items.length === 0) {
    return {
      valid: false,
      error: 'No items in checkout'
    }
  }

  // Check each item has required properties
  const hasInvalidItems = items.some(item => {
    return !item.product || !item.product._id || !item.product.price || (item.quantity || 1) <= 0
  })

  if (hasInvalidItems) {
    return {
      valid: false,
      error: 'Some items are invalid'
    }
  }

  return {
    valid: true
  }
}

// ==================== PAYMENT REDIRECT HANDLERS ====================

export const handlePaymentRedirect = (response) => {
  const { success, paymentMethod, paymentUrl } = response.data

  if (!success) {
    throw new Error(response.data.message || 'Payment failed')
  }

  // Handle different payment methods
  switch (paymentMethod) {
    case PAYMENT_METHODS.STRIPE:
      if (paymentUrl) {
        window.location.href = paymentUrl
      }
      break

    case PAYMENT_METHODS.MOMO:
      if (paymentUrl) {
        // Can use window.location.href or open in new tab
        window.open(paymentUrl, '_blank')
      }
      break

    case PAYMENT_METHODS.ZALOPAY:
      if (paymentUrl) {
        window.open(paymentUrl, '_blank')
      }
      break

    case PAYMENT_METHODS.COD:
      // No redirect for COD, order is created
      return response.data
  }

  return response.data
}

// ==================== ORDER FORMATTING ====================

export const formatOrderResponse = (response) => {
  return {
    success: response.data?.success || false,
    orderId: response.data?.orderId || response.data?.order?._id,
    orderNumber: response.data?.order?.orderNumber,
    totalPrice: response.data?.order?.totalPrice || response.data?.totalPrice,
    paymentMethod: response.data?.order?.paymentMethod || response.data?.paymentMethod,
    status: response.data?.order?.status || response.data?.status,
    paymentUrl: response.data?.paymentUrl,
    message: response.data?.message
  }
}

// ==================== PAYMENT STATUS HELPERS ====================

export const getPaymentStatusLabel = (status) => {
  const labels = {
    'PENDING': 'Pending',
    'PAID': 'Paid',
    'FAILED': 'Failed',
    'CANCELLED': 'Cancelled',
    'REFUNDED': 'Refunded'
  }
  return labels[status] || status
}

export const getOrderStatusLabel = (status) => {
  const labels = {
    'PENDING': 'Pending',
    'CONFIRMED': 'Confirmed',
    'PROCESSING': 'Processing',
    'SHIPPED': 'Shipped',
    'DELIVERED': 'Delivered',
    'CANCELLED': 'Cancelled'
  }
  return labels[status] || status
}

// ==================== ERROR HANDLING ====================

export const getPaymentErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.message === 'Network Error') {
    return 'Network error. Please check your connection and try again.'
  }

  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.'
  }

  return error.message || 'An error occurred during payment'
}

// ==================== COUPON VALIDATION ====================

export const validateCouponCode = (code) => {
  if (!code) return { valid: true } // Coupon is optional

  if (code.length < 3) {
    return {
      valid: false,
      error: 'Coupon code must be at least 3 characters'
    }
  }

  if (code.length > 20) {
    return {
      valid: false,
      error: 'Coupon code is too long'
    }
  }

  return { valid: true }
}

// ==================== LOYALTY POINTS ====================

export const validateLoyaltyPoints = (pointsToUse, availablePoints) => {
  if (pointsToUse < 0) {
    return {
      valid: false,
      error: 'Cannot use negative points'
    }
  }

  if (pointsToUse > availablePoints) {
    return {
      valid: false,
      error: `You only have ${availablePoints} loyalty points`
    }
  }

  return { valid: true }
}

export const calculatePointsValue = (points) => {
  // 1 point = 1000 currency units (adjust as needed)
  return points * 1000
}