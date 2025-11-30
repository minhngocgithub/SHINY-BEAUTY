export const calculateProductPrice = (product, saleProgram = null) => {
  const basePrice = product.price || 0

  // ✅ PRIORITY 1: Use pre-calculated data from backend middleware if available
  if (product.activeSaleProgram || product.hasSale) {
    return {
      displayPrice: product.finalPrice || product.currentPrice || product.salePrice || basePrice,
      originalPrice: product.originalPrice || basePrice,
      discountPercentage: product.discountPercentage || 0,
      type: product.saleType || (product.activeSaleProgram ? 'sale_program' : 'direct_sale'),
      savings: product.savings || product.discount || 0,
      saleProgram: product.activeSaleProgram || null
    }
  }

  // ✅ PRIORITY 2: Direct product sale (fallback for when middleware isn't applied)
  if (product.salePrice && product.salePrice < basePrice) {
    if (product.saleStartDate && product.saleEndDate) {
      const now = new Date()
      const startDate = new Date(product.saleStartDate)
      const endDate = new Date(product.saleEndDate)
      if (now >= startDate && now <= endDate) {
        return {
          displayPrice: product.salePrice,
          originalPrice: basePrice,
          discountPercentage: Math.round(((basePrice - product.salePrice) / basePrice) * 100),
          type: "direct_sale",
          savings: basePrice - product.salePrice,
        }
      }
    }
  }

  // ✅ PRIORITY 3: Flash sale
  if (product.flashSale?.isFlashSale && product.flashSale?.salePrice) {
    if (product.saleEndDate) {
      const now = new Date()
      const endDate = new Date(product.saleEndDate)
      if (now <= endDate) {
        return {
          displayPrice: product.flashSale.salePrice,
          originalPrice: basePrice,
          discountPercentage: Math.round(((basePrice - product.flashSale.salePrice) / basePrice) * 100),
          type: "flash_sale",
          savings: basePrice - product.flashSale.salePrice,
        }
      }
    }
  }

  // ✅ PRIORITY 4: Sale program discount (manual calculation as last resort)
  if (saleProgram && saleProgram.benefits?.discountPercentage) {
    const discountAmount = (basePrice * saleProgram.benefits.discountPercentage) / 100
    const finalPrice = Math.max(0, basePrice - discountAmount)
    return {
      displayPrice: finalPrice,
      originalPrice: basePrice,
      discountPercentage: saleProgram.benefits.discountPercentage,
      type: "sale_program",
      savings: discountAmount,
      saleProgram: {
        id: saleProgram._id || saleProgram.id,
        title: saleProgram.title,
        type: saleProgram.type
      }
    }
  }

  // No sale
  return {
    displayPrice: basePrice,
    originalPrice: basePrice,
    discountPercentage: 0,
    type: "regular",
    savings: 0,
  }
}

export const calculateCartItemPrice = (cartItem) => {
  const itemData = cartItem.product || cartItem.bundle
  if (!itemData) return 0

  // Use finalPrice or currentPrice if available (from middleware)
  const price = itemData.finalPrice || itemData.currentPrice || itemData.salePrice || itemData.price || 0
  return price * (cartItem.quantity || 1)
}

export const calculateCartTotals = (cartItems) => {
  let subtotal = 0
  let totalDiscount = 0

  cartItems.forEach((item) => {
    const itemData = item.product || item.bundle
    if (!itemData) return

    const originalPrice = itemData.originalPrice || itemData.price || 0
    const finalPrice = itemData.finalPrice || itemData.currentPrice || itemData.salePrice || originalPrice
    const itemTotal = finalPrice * (item.quantity || 1)
    const itemDiscount = (originalPrice - finalPrice) * (item.quantity || 1)

    subtotal += itemTotal
    totalDiscount += itemDiscount
  })

  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  return {
    subtotal: subtotal.toFixed(2),
    totalDiscount: totalDiscount.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
  }
}

export const formatPrice = (price) => {
  return Number.parseFloat(price).toFixed(2)
}

export const calculateDiscount = (originalPrice, salePrice) => {
  if (!salePrice || salePrice >= originalPrice) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}