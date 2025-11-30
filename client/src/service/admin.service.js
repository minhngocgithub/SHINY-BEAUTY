import axiosApiInstance from "../../utils/api";

const BASE_ADMIN_API = "/order/admin";
const BASE_ANALYTICS_API = "/analytics";
const BASE_USERS_API = "/admin/users";

/**
 * Admin Order Management APIs
 */

// Get pending orders waiting for confirmation
export const getPendingOrdersApi = async (params = {}) => {
  const response = await axiosApiInstance.get(`${BASE_ADMIN_API}/pending`, {
    params,
  });
  return response.data;
};

// Confirm order and generate tracking
export const confirmOrderApi = async (orderId) => {
  const response = await axiosApiInstance.post(
    `${BASE_ADMIN_API}/${orderId}/confirm`
  );
  return response.data;
};

// Cancel order (admin)
export const adminCancelOrderApi = async (orderId, data) => {
  const response = await axiosApiInstance.post(
    `${BASE_ADMIN_API}/${orderId}/cancel`,
    data
  );
  return response.data;
};

// Update order status
export const updateOrderStatusApi = async (orderId, data) => {
  const response = await axiosApiInstance.patch(
    `${BASE_ADMIN_API}/${orderId}/status`,
    data
  );
  return response.data;
};

// Update tracking location
export const updateTrackingApi = async (orderId, data) => {
  const response = await axiosApiInstance.patch(
    `${BASE_ADMIN_API}/${orderId}/tracking`,
    data
  );
  return response.data;
};

// Add admin notes
export const addAdminNotesApi = async (orderId, data) => {
  const response = await axiosApiInstance.patch(
    `${BASE_ADMIN_API}/${orderId}/notes`,
    data
  );
  return response.data;
};

// Get order statistics
export const getOrderStatisticsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(
    `${BASE_ADMIN_API}/statistics`,
    {
      params,
    }
  );
  return response.data;
};

/**
 * Analytics APIs
 */

// Get dashboard analytics
export const getDashboardAnalyticsApi = async () => {
  const response = await axiosApiInstance.get(`${BASE_ANALYTICS_API}/dashboard`);
  return response.data;
};

// Get revenue analytics (revenue trends)
export const getRevenueAnalyticsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(`${BASE_ANALYTICS_API}/revenue-trends`, {
    params,
  });
  return response.data;
};

// Get sales analytics (daily sales)
export const getSalesAnalyticsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(`${BASE_ANALYTICS_API}/daily-sales`, {
    params,
  });
  return response.data;
};

// Get product analytics
export const getProductAnalyticsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(
    `${BASE_ANALYTICS_API}/products`,
    {
      params,
    }
  );
  return response.data;
};

// Get user analytics
export const getUserAnalyticsApi = async (params = {}) => {
  const response = await axiosApiInstance.get(`${BASE_ANALYTICS_API}/users`, {
    params,
  });
  return response.data;
};

// Get inventory analytics (inventory analytics from inventoryRouter)
export const getInventoryAnalyticsApi = async (params = {}) => {
  // Đúng router BE là /api/v1/inventory/analytics
  const response = await axiosApiInstance.get(
    `/inventory/analytics`,
    {
      params,
    }
  );
  return response.data;
};

/**
 * User Management APIs
 */

// Get all users
export const getAllUsersApi = async (params = {}) => {
  const response = await axiosApiInstance.get('/admin/allUser', { params });
  return response.data;
};

// Get user details
export const getUserDetailApi = async (userId) => {
  const response = await axiosApiInstance.get(`/admin/${userId}`);
  return response.data;
};

// Update user
export const updateUserApi = async (userId, data) => {
  const response = await axiosApiInstance.put(
    `/admin/update/${userId}`,
    data
  );
  return response.data;
};

// Delete user
export const deleteUserApi = async (userId) => {
  const response = await axiosApiInstance.delete(`/admin/delete/${userId}`);
  return response.data;
};

// Change user role (using update endpoint)
export const changeUserRoleApi = async (userId, isAdmin) => {
  const response = await axiosApiInstance.put(
    `/admin/update/${userId}`,
    { isAdmin }
  );
  return response.data;
};

// Ban/unban user (using update endpoint)
export const toggleUserStatusApi = async (userId, isBanned) => {
  const response = await axiosApiInstance.put(
    `/admin/update/${userId}`,
    { isBanned }
  );
  return response.data;
};

export default {
  // Orders
  getPendingOrdersApi,
  confirmOrderApi,
  adminCancelOrderApi,
  updateOrderStatusApi,
  updateTrackingApi,
  addAdminNotesApi,
  getOrderStatisticsApi,

  // Analytics
  getDashboardAnalyticsApi,
  getRevenueAnalyticsApi,
  getSalesAnalyticsApi,
  getProductAnalyticsApi,
  getUserAnalyticsApi,
  getInventoryAnalyticsApi,

  // Users
  getAllUsersApi,
  getUserDetailApi,
  updateUserApi,
  deleteUserApi,
  changeUserRoleApi,
  toggleUserStatusApi,
};
