import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const calculateShippingFee = async (city, hasFreeShipping = false, isExpress = false) => {
  try {
    const response = await axios.post(`${API_URL}/shipping/calculate`, {
      city,
      hasFreeShipping,
      isExpress
    });

    // Backend returns {success: true, data: {...}}
    return response.data.data;
  } catch (error) {
    console.error('Error calculating shipping fee:', error);

    // Fallback to standard rate if API fails
    return {
      fee: 5,
      zone: 'UNKNOWN',
      distance: 0,
      isFree: false,
      currency: 'USD',
      deliveryEstimate: '3-5 ngày',
      reason: 'API_ERROR',
      error: error.response?.data?.message || 'Failed to calculate shipping fee'
    };
  }
};

export const getProvinces = async () => {
  try {
    const response = await axios.get(`${API_URL}/shipping/provinces`);
    // Backend returns {success: true, provinces: [...], warehouse: {...}}
    return response.data.provinces || response.data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw error;
  }
};

export const getShippingRates = async () => {
  try {
    const response = await axios.get(`${API_URL}/shipping/rates`);
    // Backend returns {success: true, rates: [...]}
    return response.data.rates || response.data;
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    throw error;
  }
};

/**
 * Format shipping fee for display
 * @param {number} fee - Shipping fee in USD
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted fee (e.g., "$5.00")
 */
export const formatShippingFee = (fee, currency = 'USD') => {
  if (fee === 0) return 'Miễn phí';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(fee);
};

/**
 * Get shipping suggestion message based on current cart state
 * @param {number} currentShipping - Current shipping fee
 * @param {number} subtotal - Cart subtotal
 * @param {number} totalQuantity - Total items in cart
 * @returns {{type: string, message: string, progress?: number}}
 */
export const getShippingSuggestion = (currentShipping, subtotal, totalQuantity) => {
  // Free shipping achieved
  if (currentShipping === 0) {
    return {
      type: 'success',
      message: '🎉 Bạn được miễn phí ship!'
    };
  }

  // Close to free shipping by subtotal ($50 threshold)
  if (subtotal >= 40 && subtotal < 50) {
    const remaining = 50 - subtotal;
    const progress = (subtotal / 50) * 100;
    return {
      type: 'info-subtotal',
      message: `Mua thêm $${remaining.toFixed(2)} để được freeship!`,
      progress: progress
    };
  }

  // Close to free shipping by quantity (10 items threshold)
  if (totalQuantity >= 7 && totalQuantity < 10) {
    const remaining = 10 - totalQuantity;
    const progress = (totalQuantity / 10) * 100;
    return {
      type: 'info-quantity',
      message: `Thêm ${remaining} sản phẩm nữa để được freeship!`,
      progress: progress
    };
  }

  return {
    type: 'neutral',
    message: 'Phí ship sẽ được tính khi thanh toán'
  };
};
