import axiosApiInstance from '../../utils/api'

const BASE_SALE_PROGRAM_API = '/sale-programs'

// ==================== PUBLIC ROUTES ====================

export const getActiveSaleProgramsApi = async () => {
  return await axiosApiInstance.get(`${BASE_SALE_PROGRAM_API}/active`)
}

export const getSaleProgramByIdApi = async (id) => {
  return await axiosApiInstance.get(`${BASE_SALE_PROGRAM_API}/${id}`)
}

export const getProductsBySaleProgramApi = async (id, params = {}) => {
  return await axiosApiInstance.get(`${BASE_SALE_PROGRAM_API}/${id}/products`, { params })
}

export const getBundlesBySaleProgramApi = async (id, params = {}) => {
  return await axiosApiInstance.get(`${BASE_SALE_PROGRAM_API}/${id}/bundles`, { params })
}

export const validateCouponCodeApi = async (code) => {
  return await axiosApiInstance.post(`${BASE_SALE_PROGRAM_API}/validate-coupon`, { code })
}

// ==================== ADMIN ROUTES ====================

export const createSaleProgramApi = async (formData) => {
  return await axiosApiInstance.post(`${BASE_SALE_PROGRAM_API}/admin/create`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getAllSaleProgramsApi = async () => {
  return await axiosApiInstance.get(`${BASE_SALE_PROGRAM_API}/admin/all`)
}

export const updateSaleProgramApi = async (id, formData) => {
  return await axiosApiInstance.put(`${BASE_SALE_PROGRAM_API}/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const deleteSaleProgramApi = async (id) => {
  return await axiosApiInstance.delete(`${BASE_SALE_PROGRAM_API}/admin/${id}`)
}

export const syncProductsToSaleProgramApi = async (id, productIds) => {
  return await axiosApiInstance.post(`${BASE_SALE_PROGRAM_API}/admin/${id}/sync-products`, { productIds })
}

export const syncBundlesToSaleProgramApi = async (id, bundleIds) => {
  return await axiosApiInstance.post(`${BASE_SALE_PROGRAM_API}/admin/${id}/sync-bundles`, { bundleIds })
}

export const getSaleProgramAnalyticsApi = async (id, params = {}) => {
  return await axiosApiInstance.get(`${BASE_SALE_PROGRAM_API}/admin/${id}/analytics`, { params })
}

export const toggleSaleProgramStatusApi = async (id) => {
  return await axiosApiInstance.patch(`${BASE_SALE_PROGRAM_API}/admin/${id}/toggle-status`)
}

export const uploadSaleProgramBannerApi = async (formData) => {
  return await axiosApiInstance.post(`${BASE_SALE_PROGRAM_API}/admin/upload-banner`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Utility functions
export const calculateTimeRemaining = (endDate) => {
  const now = new Date().getTime()
  const end = new Date(endDate).getTime()
  const difference = end - now

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
      isExpired: true
    }
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
    total: difference,
    isExpired: false
  }
}

export const formatSaleProgramForDisplay = (program) => {
  if (!program) return null

  const timeRemaining = program.endDate ? calculateTimeRemaining(program.endDate) : null

  return {
    ...program,
    timeRemaining,
    isActive: timeRemaining ? !timeRemaining.isExpired : true,
    discountText: program.benefits?.discountPercentage
      ? `${program.benefits.discountPercentage}% OFF`
      : program.benefits?.discountAmount
        ? `$${program.benefits.discountAmount} OFF`
        : 'Special Offer',
    badgeClass: getProgramBadgeClass(program.type),
    icon: getProgramIcon(program.type)
  }
}

const getProgramBadgeClass = (type) => {
  const classes = {
    flash_sale: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
    seasonal: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    clearance: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
    bundle: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    percentage: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    fixed_amount: 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'
  }
  return classes[type] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
}

const getProgramIcon = (type) => {
  const icons = {
    flash_sale: '⚡',
    seasonal: '🎉',
    clearance: '🔥',
    bundle: '📦',
    percentage: '💰',
    fixed_amount: '💵'
  }
  return icons[type] || '💰'
}