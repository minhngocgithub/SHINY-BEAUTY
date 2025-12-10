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

export const getDashboardAnalytics = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/dashboard`, { params })
}

export const getDashboardAnalyticsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(`${BASE_ANALYTICS_API}/dashboard`, { params })
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

// export const getLowStockProductsApi = async (params = {}) => {
//   const response = await axiosApiInstance.get(`${BASE_ANALYTICS_API}/low-stock`, {
//     params
//   })
//   return response.data
// }

export const getTopProductsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(`${BASE_ANALYTICS_API}/top-products`, {
    params
  })
  return response.data
}

export const getCategoryStatsApi = async () => {
  const response = await axiosApiInstance.get(`${BASE_ANALYTICS_API}/categories`)
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
export const getInventoryAnalyticsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(
    `${BASE_INVENTORY_API}/analytics`,
    { params }
  )
  return response.data
}

export const getLowStockProductsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(
    `${BASE_INVENTORY_API}/low-stock`,
    { params }

  )
  return response.data
}

export const getStockLevelApi = async (productId) => {
  const response = await axiosApiInstance.get(
    `${BASE_INVENTORY_API}/stock/${productId}`
  )
  return response.data
}

export const validateStockBulkApi = async (items) => {
  const response = await axiosApiInstance.post(
    `${BASE_INVENTORY_API}/validate`,
    items
  )
  return response.data
}

export const getBulkStockLevelsApi = async (productIds) => {
  const response = await axiosApiInstance.post(
    `${BASE_INVENTORY_API}/stock/bulk`,
    productIds
  )
  return response.data
}

export const reserveStockApi = async (data) => {
  const response = await axiosApiInstance.post(
    `${BASE_INVENTORY_API}/reserve`,
    data
  )
  return response.data
}

export const getReservationApi = async (reservationId) => {
  const response = await axiosApiInstance.get(
    `${BASE_INVENTORY_API}/reserve/${reservationId}`
  )
  return response.data
}

export const cancelReservationApi = async (reservationId) => {
  const response = await axiosApiInstance.post(
    `${BASE_INVENTORY_API}/reserve/${reservationId}/cancel`
  )
  return response.data
}

export const confirmReservationApi = async (reservationId) => {
  const response = await axiosApiInstance.post(
    `${BASE_INVENTORY_API}/reserve/${reservationId}/confirm`
  )
  return response.data
}

export const adjustStockApi = async (productId, data) => {
  const response = await axiosApiInstance.post(
    `${BASE_INVENTORY_API}/adjust/${productId}`,
    data
  )
  return response.data
}

export const restockProductApi = async (productId, data) => {
  const response = await axiosApiInstance.post(
    `${BASE_INVENTORY_API}/restock/${productId}`,
    data
  )
  return response.data
}

export const processReturnApi = async (productId, data) => {
  const response = await axiosApiInstance.post(
    `${BASE_INVENTORY_API}/return/${productId}`,
    data
  )
  return response.data
}

export const updateStockThresholdApi = async (productId, data) => {
  const response = await axiosApiInstance.patch(
    `${BASE_INVENTORY_API}/threshold/${productId}`,
    data
  )
  return response.data
}

export const getStockHistoryApi = async (productId) => {
  const response = await axiosApiInstance.get(
    `${BASE_INVENTORY_API}/history/${productId}`
  )
  return response.data
}

export const getAllReservationsApi = async () => {
  const response = await axiosApiInstance.get(
    `${BASE_INVENTORY_API}/reservations`
  )
  return response.data
}

export const getExpiredReservationsApi = async () => {
  const response = await axiosApiInstance.get(
    `${BASE_INVENTORY_API}/reservations/expired`
  )
  return response.data
}

export const syncStockCacheApi = async () => {
  const response = await axiosApiInstance.post(
    `${BASE_INVENTORY_API}/sync-cache`
  )
  return response.data
}

export const refreshProductCacheApi = async (productId) => {
  const response = await axiosApiInstance.post(
    `${BASE_INVENTORY_API}/cache/refresh/${productId}`
  )
  return response.data
}

export const clearStockCacheApi = async () => {
  const response = await axiosApiInstance.delete(
    `${BASE_INVENTORY_API}/cache`
  )
  return response.data
}

export const getInventoryValuationApi = async (params = {}) => {
  const response = await axiosApiInstance.get(
    `${BASE_INVENTORY_API}/reports/valuation`,
    { params }
  )
  return response.data
}

export const getStockMovementReportApi = async (params = {}) => {
  const response = await axiosApiInstance.get(
    `${BASE_INVENTORY_API}/reports/movements`,
    { params }
  )
  return response.data
}

export const getRestockNeededApi = async (params = {}) => {
  const response = await axiosApiInstance.get(
    `${BASE_INVENTORY_API}/reports/restock-needed`,
    { params }
  )
  return response.data
}

