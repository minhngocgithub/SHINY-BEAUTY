import axiosApiInstance from "../../utils/api"

const BASE_ADMIN_ORDER_API = "/order/admin"
const BASE_ANALYTICS_API = "/analytics"
const BASE_ANALYTIC_API = "/analytic"
const BASE_ADMIN_USERS_API = "/admin"
const BASE_ORDER_API = "/order"
const BASE_PRODUCT_API = "/products"
const BASE_INVENTORY_API = "/inventory"

export const getAllOrdersAdmin = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ORDER_API}/all`, { params })
}

export const getPendingOrders = async () => {
  return await axiosApiInstance.get(`${BASE_ORDER_API}/all`, {
    params: {
      status: "pending",
      sort: "-createdAt"
    }
  })
}

export const getPendingOrdersApi = async (params = {}) => {
  const response = await axiosApiInstance.get(`${BASE_ADMIN_ORDER_API}/pending`, {
    params
  })
  return response.data
}

export const getRecentOrders = async (limit = 10) => {
  return await axiosApiInstance.get(`${BASE_ORDER_API}/all`, {
    params: {
      limit,
      sort: "-createdAt"
    }
  })
}

export const confirmOrderApi = async (orderId) => {
  const response = await axiosApiInstance.post(
    `${BASE_ADMIN_ORDER_API}/${orderId}/confirm`
  )
  return response.data
}

export const adminCancelOrderApi = async (orderId, data) => {
  const response = await axiosApiInstance.post(
    `${BASE_ADMIN_ORDER_API}/${orderId}/cancel`,
    data
  )
  return response.data
}

export const updateOrderStatusApi = async (orderId, data) => {
  const response = await axiosApiInstance.patch(
    `${BASE_ADMIN_ORDER_API}/${orderId}/status`,
    data
  )
  return response.data
}

export const updateTrackingApi = async (orderId, data) => {
  const response = await axiosApiInstance.patch(
    `${BASE_ADMIN_ORDER_API}/${orderId}/tracking`,
    data
  )
  return response.data
}

export const addAdminNotesApi = async (orderId, data) => {
  const response = await axiosApiInstance.patch(
    `${BASE_ADMIN_ORDER_API}/${orderId}/notes`,
    data
  )
  return response.data
}

export const getOrderStatisticsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(
    `${BASE_ADMIN_ORDER_API}/statistics`,
    { params }
  )
  return response.data
}

export const getOrderStatistics = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ADMIN_ORDER_API}/statistics`, { params })
}

export const getDashboardAnalytics = async () => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/dashboard`)
}

export const getDashboardAnalyticsApi = async () => {
  const response = await axiosApiInstance.get(`${BASE_ANALYTICS_API}/dashboard`)
  return response.data
}

export const getRevenueAnalytics = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/revenue-trends`, { params })
}

export const getRevenueAnalyticsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(`${BASE_ANALYTICS_API}/revenue-trends`, {
    params
  })
  return response.data
}

export const getSalesAnalytics = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/daily-sales`, { params })
}

export const getSalesAnalyticsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(`${BASE_ANALYTICS_API}/daily-sales`, {
    params
  })
  return response.data
}

export const getProductAnalytics = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/products`, { params })
}

export const getProductAnalyticsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(`${BASE_ANALYTICS_API}/products`, {
    params
  })
  return response.data
}

export const getUserAnalytics = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/users`, { params })
}

export const getUserAnalyticsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(`${BASE_ANALYTICS_API}/users`, {
    params
  })
  return response.data
}

export const getSalesTrend = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTIC_API}/sales-trend`, { params })
}

export const getProductViews = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTIC_API}/product-views`, { params })
}

export const getInventoryStatus = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTIC_API}/low-stock`, { params })
}

export const getInventoryAnalyticsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(`${BASE_INVENTORY_API}/analytics`, {
    params
  })
  return response.data
}

export const getTopProducts = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_PRODUCT_API}/top-selling`, { params })
}

export const getTotalUsersCount = async () => {
  return await axiosApiInstance.get(`/users/admin/count`)
}

export const getAllUsersApi = async (params = {}) => {
  const response = await axiosApiInstance.get(`${BASE_ADMIN_USERS_API}/allUser`, {
    params
  })
  return response.data
}

export const getUserDetailApi = async (userId) => {
  const response = await axiosApiInstance.get(`${BASE_ADMIN_USERS_API}/${userId}`)
  return response.data
}

export const updateUserApi = async (userId, data) => {
  const response = await axiosApiInstance.put(
    `${BASE_ADMIN_USERS_API}/update/${userId}`,
    data
  )
  return response.data
}

export const deleteUserApi = async (userId) => {
  const response = await axiosApiInstance.delete(
    `${BASE_ADMIN_USERS_API}/delete/${userId}`
  )
  return response.data
}

export const toggleUserBanApi = async (userId, isBanned) => {
  const response = await axiosApiInstance.put(
    `${BASE_ADMIN_USERS_API}/update/${userId}`,
    { isBanned }
  )
  return response.data
}

export default {
  getAllOrdersAdmin,
  getPendingOrders,
  getPendingOrdersApi,
  getRecentOrders,
  confirmOrderApi,
  adminCancelOrderApi,
  updateOrderStatusApi,
  updateTrackingApi,
  addAdminNotesApi,
  getOrderStatistics,
  getOrderStatisticsApi,

  getDashboardAnalytics,
  getDashboardAnalyticsApi,
  getRevenueAnalytics,
  getRevenueAnalyticsApi,
  getSalesAnalytics,
  getSalesAnalyticsApi,
  getProductAnalytics,
  getProductAnalyticsApi,
  getUserAnalytics,
  getUserAnalyticsApi,
  getSalesTrend,
  getProductViews,
  getInventoryStatus,
  getInventoryAnalyticsApi,

  getTopProducts,

  getTotalUsersCount,
  getAllUsersApi,
  getUserDetailApi,
  updateUserApi,
  deleteUserApi,
  toggleUserBanApi
}
