const redisService = require("./redis.service")

class CacheService {
  static KEYS = {
    PRODUCT: (id) => `product:${id}`,
    PRODUCTS_FEATURED: "products:featured",
    PRODUCTS_BESTSELLER: "products:bestseller",
    CATEGORY: (id) => `category:${id}`,
    USER_CART: (userId) => `cart:${userId}`,
    FLASH_SALE: (productId) => `flashsale:${productId}`,
    SALE_PROGRAMS: "sale_programs:active",
    USER_WISHLIST: (userId) => `wishlist:${userId}`,
    WISHLIST_PRICE_DROP: (userId, productId) => `price_drop:${userId}:${productId}`,
    OTP: (email) => `otp:${email}`,
    SESSION: (sessionId) => `session:${sessionId}`,
    USER_LOYALTY: (userId) => `loyalty:${userId}`,
  }

  // Product caching
  async getProduct(productId) {
    return await redisService.get(this.constructor.KEYS.PRODUCT(productId))
  }

  async setProduct(productId, product, ttl = 1800) {
    return await redisService.set(this.constructor.KEYS.PRODUCT(productId), product, ttl)
  }

  async invalidateProduct(productId) {
    await redisService.del(this.constructor.KEYS.PRODUCT(productId))
    // Invalidate product lists
    await this.invalidateProductLists()
  }

  async invalidateProductLists() {
    const patterns = [this.constructor.KEYS.PRODUCTS_FEATURED, this.constructor.KEYS.PRODUCTS_BESTSELLER]

    for (const key of patterns) {
      await redisService.del(key)
    }
  }

  // Flash sale stock management
  async getFlashSaleStock(productId) {
    const key = this.constructor.KEYS.FLASH_SALE(productId)
    const stock = await redisService.get(`${key}:stock`)
    return stock !== null ? stock : null
  }

  async setFlashSaleStock(productId, stock) {
    const key = this.constructor.KEYS.FLASH_SALE(productId)
    await redisService.set(`${key}:stock`, stock, 86400) // 24 hours
  }

  async decrementFlashSaleStock(productId, quantity = 1) {
    const key = `${this.constructor.KEYS.FLASH_SALE(productId)}:stock`
    const current = await redisService.get(key)

    if (current === null || current < quantity) {
      return false
    }

    const newStock = await redisService.decrby(key, quantity)
    return newStock >= 0
  }

  async getUserPurchaseCount(userId, productId) {
    const key = `${this.constructor.KEYS.FLASH_SALE(productId)}:users`
    const count = await redisService.hget(key, userId)
    return count || 0
  }

  async incrementUserPurchaseCount(userId, productId, quantity = 1) {
    const key = `${this.constructor.KEYS.FLASH_SALE(productId)}:users`
    const current = (await redisService.hget(key, userId)) || 0
    await redisService.hset(key, userId, current + quantity)
  }

  // Cart caching
  async getUserCart(userId) {
    return await redisService.get(this.constructor.KEYS.USER_CART(userId))
  }

  async setUserCart(userId, cart, ttl = 604800) {
    // 7 days
    return await redisService.set(this.constructor.KEYS.USER_CART(userId), cart, ttl)
  }

  async deleteUserCart(userId) {
    return await redisService.del(this.constructor.KEYS.USER_CART(userId))
  }

  // Wishlist caching
  async getUserWishlist(userId) {
    return await redisService.get(this.constructor.KEYS.USER_WISHLIST(userId))
  }

  async setUserWishlist(userId, wishlist, ttl = 604800) {
    return await redisService.set(this.constructor.KEYS.USER_WISHLIST(userId), wishlist, ttl)
  }

  async invalidateUserWishlist(userId) {
    return await redisService.del(this.constructor.KEYS.USER_WISHLIST(userId))
  }

  // OTP management
  async setOTP(email, otp, ttl = 600) {
    // 10 minutes
    return await redisService.set(this.constructor.KEYS.OTP(email), { code: otp, createdAt: Date.now() }, ttl)
  }

  async getOTP(email) {
    return await redisService.get(this.constructor.KEYS.OTP(email))
  }

  async deleteOTP(email) {
    return await redisService.del(this.constructor.KEYS.OTP(email))
  }

  // Session management
  async setSession(sessionId, data, ttl = 86400) {
    return await redisService.set(this.constructor.KEYS.SESSION(sessionId), data, ttl)
  }

  async getSession(sessionId) {
    return await redisService.get(this.constructor.KEYS.SESSION(sessionId))
  }

  async deleteSession(sessionId) {
    return await redisService.del(this.constructor.KEYS.SESSION(sessionId))
  }

  // Loyalty data caching
  async getUserLoyalty(userId) {
    return await redisService.get(this.constructor.KEYS.USER_LOYALTY(userId))
  }

  async setUserLoyalty(userId, loyaltyData, ttl = 3600) {
    return await redisService.set(this.constructor.KEYS.USER_LOYALTY(userId), loyaltyData, ttl)
  }

  async invalidateUserLoyalty(userId) {
    return await redisService.del(this.constructor.KEYS.USER_LOYALTY(userId))
  }
}

module.exports = new CacheService()
