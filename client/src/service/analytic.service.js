import axiosApiInstance from "../../utils/api"

const BASE_ANALYTICS_API = "/analytic"
const BASE_ORDER_API = "/order"
const BASE_USER_API = "/users"
const BASE_PRODUCT_API = "/products"

// Dashboard Overview
export const getDashboardAnalytics = async () => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/dashboard`)
}

// Order Statistics
export const getOrderStatistics = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ORDER_API}/admin/statistics`, { params })
}

// Revenue Analytics (revenue trends)
export const getRevenueAnalytics = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/revenue-trends`, { params })
}

// Sales Analytics (daily sales)
export const getSalesAnalytics = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/daily-sales`, { params })
}

// Product Analytics
export const getProductAnalytics = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/products`, { params })
}

// User Analytics
export const getUserAnalytics = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/users`, { params })
}

// Inventory Status (low stock products)
export const getInventoryStatus = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/low-stock`, { params })
}

// All Orders (Admin)
export const getAllOrdersAdmin = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ORDER_API}/all`, { params })
}

// Top Products
export const getTopProducts = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_PRODUCT_API}/top-selling`, { params })
}

// Recent Orders
export const getRecentOrders = async (limit = 10) => {
  return await axiosApiInstance.get(`${BASE_ORDER_API}/all`, {
    params: {
      limit,
      sort: "-createdAt",
    },
  })
}

// Pending Orders
export const getPendingOrders = async () => {
  return await axiosApiInstance.get(`${BASE_ORDER_API}/all`, {
    params: {
      status: "pending",
      sort: "-createdAt",
    },
  })
}

// Total Users Count
export const getTotalUsersCount = async () => {
  return await axiosApiInstance.get(`${BASE_USER_API}/admin/count`)
}

// Sales Trend (for chart)
export const getSalesTrend = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/sales-trend`, { params })
}

// Product Views (for chart)
export const getProductViews = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ANALYTICS_API}/product-views`, { params })
}
