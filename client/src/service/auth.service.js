import axios from "axios"
import axiosApiInstance from "../../utils/api"
axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_USER_API = "/users"
const BASE_USER_OTP_API = "/otp"

// ==================== AUTH ROUTES ====================

export const loginApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/login`, data, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
}

export const registerApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/register`, data)
}

export const logoutAccountApi = async () => {
  return await axiosApiInstance.post(`${BASE_USER_API}/logOut`)
}

export const refreshAccessToken = async () => {
  const refresh_token = localStorage.getItem("refreshToken")
  const data = {
    newRefreshToken: refresh_token,
  }
  return await axios.post(`${BASE_USER_API}/refresh-token`, data)
}

// ==================== PROFILE ROUTES ====================

export const getInfo = async () => {
  return await axiosApiInstance.get(`${BASE_USER_API}/profile`)
}

export const updateUserProfile = async (data) => {
  const response = await axiosApiInstance.put(`${BASE_USER_API}/profile/update`, data)
  return response.data
}

export const uploadAvatar = async (formData) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/upload-avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const deleteAvatarApi = async () => {
  return await axiosApiInstance.delete(`${BASE_USER_API}/delete-avatar`)
}

// ==================== PASSWORD ROUTES ====================

export const forgotPasswordApi = async (email) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/password/forgot`, email)
}

export const resetPasswordApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/password/reset/${data.token}`, {
    password: data.password
  })
}

export const changePasswordApi = async (data) => {
  return await axiosApiInstance.put(`${BASE_USER_API}/password/change`, data)
}

// ==================== OAUTH ROUTES ====================

export const getOAuthUrls = async () => {
  return await axiosApiInstance.get(`${BASE_USER_API}/oauth/urls`)
}

export const linkOAuthAccount = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/oauth/link`, data)
}

export const unlinkOAuthAccount = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/oauth/unlink`, data)
}

// ==================== ADDRESS MANAGEMENT ROUTES ====================

export const getUserAddressesApi = async () => {
  return await axiosApiInstance.get(`${BASE_USER_API}/addresses`)
}

export const addUserAddressApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_API}/addresses`, data)
}

export const updateUserAddressApi = async (addressId, data) => {
  return await axiosApiInstance.put(`${BASE_USER_API}/addresses/${addressId}`, data)
}

export const deleteUserAddressApi = async (addressId) => {
  return await axiosApiInstance.delete(`${BASE_USER_API}/addresses/${addressId}`)
}

export const setDefaultAddressApi = async (addressId) => {
  return await axiosApiInstance.put(`${BASE_USER_API}/addresses/${addressId}/default`)
}

// ==================== USER STATS ROUTE ====================

export const getUserStatsApi = async () => {
  return await axiosApiInstance.get(`${BASE_USER_API}/stats`)
}

// ==================== OTP ROUTES ====================

export const sendOTPApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_OTP_API}/send-otp`, data)
}

export const resendOTPApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_USER_OTP_API}/resend-otp`, data)
}

