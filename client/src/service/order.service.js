import axiosApiInstance from "../../utils/api";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
const BASE_ORDER_API = "/order";

/**
 * User Order APIs
 */

export const createOrderApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_ORDER_API}/`, data);
};

export const getMyOrdersApi = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ORDER_API}/myOrders`, {
    params: {
      ...params,
      populate: 'orderItems.productId'
    }
  });
};

export const getOrderDetailApi = async (orderId) => {
  return await axiosApiInstance.get(`${BASE_ORDER_API}/${orderId}`);
};

export const cancelOrderApi = async (orderId, reason = "") => {
  return await axiosApiInstance.put(`${BASE_ORDER_API}/${orderId}/cancel`, {
    reason,
  });
};

export const updateOrderToPaidApi = async (orderId, paymentData) => {
  return await axiosApiInstance.put(
    `${BASE_ORDER_API}/${orderId}/pay`,
    paymentData
  );
};

// Get order tracking information
export const getOrderTrackingApi = async (orderId) => {
  const response = await axiosApiInstance.get(
    `${BASE_ORDER_API}/${orderId}/tracking`
  );
  return response.data;
};

// Get order timeline
export const getOrderTimelineApi = async (orderId) => {
  const response = await axiosApiInstance.get(
    `${BASE_ORDER_API}/${orderId}/timeline`
  );
  return response.data;
};

// Reorder from existing order
export const reorderApi = async (orderId, data = {}) => {
  const response = await axiosApiInstance.post(
    `${BASE_ORDER_API}/${orderId}/reorder`,
    data
  );
  return response.data;
};

/**
 * Admin Order APIs
 */

export const getAllOrdersApi = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_ORDER_API}/all`, { params });
};

export const updateOrderToDeliveredApi = async (orderId) => {
  return await axiosApiInstance.put(`${BASE_ORDER_API}/${orderId}/deliver`);
};

export default {
  createOrderApi,
  getMyOrdersApi,
  getOrderDetailApi,
  cancelOrderApi,
  updateOrderToPaidApi,
  getOrderTrackingApi,
  getOrderTimelineApi,
  reorderApi,
  getAllOrdersApi,
  updateOrderToDeliveredApi,
};