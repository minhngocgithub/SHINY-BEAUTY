import axios from "axios"
import axiosApiInstance from "../../utils/api"
axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_USER_API = "/users"

// ==================== PROFILE ====================
export const getUserProfile = async () => {
  return await axiosApiInstance.get(`${BASE_USER_API}/profile`)
}

export const updateUserProfile = async (data) => {
  return await axiosApiInstance.put(`${BASE_USER_API}/profile/update`, data)
}

export const uploadAvatar = async (formData) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/upload-avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const deleteAvatar = async () => {
  return await axiosApiInstance.delete(`${BASE_USER_API}/delete-avatar`)
}

// ==================== PASSWORD ====================
export const changePassword = async (data) => {
  return await axiosApiInstance.put(`${BASE_USER_API}/password/change`, data)
}

// ==================== ADDRESSES ====================
export const getUserAddresses = async () => {
  return await axiosApiInstance.get(`${BASE_USER_API}/addresses`)
}

export const addUserAddress = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/addresses`, data)
}

export const updateUserAddress = async (addressId, data) => {
  return await axiosApiInstance.put(`${BASE_USER_API}/addresses/${addressId}`, data)
}

export const deleteUserAddress = async (addressId) => {
  return await axiosApiInstance.delete(`${BASE_USER_API}/addresses/${addressId}`)
}

export const setDefaultAddress = async (addressId) => {
  return await axiosApiInstance.put(`${BASE_USER_API}/addresses/${addressId}/default`)
}

// ==================== STATS ====================
export const getUserStats = async () => {
  return await axiosApiInstance.get(`${BASE_USER_API}/stats`)
}

// ==================== NOTIFICATIONS ====================
export const updateNotificationPreferences = async (data) => {
  return await axiosApiInstance.put(`${BASE_USER_API}/notifications/preferences`, data)
}

export const getNotificationPreferences = async () => {
  return await axiosApiInstance.get(`${BASE_USER_API}/notifications/preferences`)
}

// ==================== OAUTH ====================
export const getOAuthUrls = async () => {
  return await axiosApiInstance.get(`${BASE_USER_API}/oauth/urls`)
}

export const linkOAuthAccount = async (provider) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/oauth/link`, { provider })
}

export const unlinkOAuthAccount = async (provider) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/oauth/unlink`, { provider })
}

export const getConnectedOAuthAccounts = async () => {
  return await axiosApiInstance.get(`${BASE_USER_API}/oauth/connected`)
}

// ==================== ACCOUNT DELETION ====================
export const deleteAccount = async (password) => {
  return await axiosApiInstance.delete(`${BASE_USER_API}/account`, {
    data: { password }
  })
}



