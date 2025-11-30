import axios from "axios"
import axiosApiInstance from "../../utils/api"

axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_CATEGORY_API = "/category"

// ==================== PUBLIC ROUTES ====================

export const getCategoryTreeApi = async () => {
  return await axiosApiInstance.get(`${BASE_CATEGORY_API}/tree`)
}

export const getRootCategoriesWithChildrenApi = async () => {
  return await axiosApiInstance.get(`${BASE_CATEGORY_API}/root-with-children`)
}

export const getCategoryBySlugApi = async (slug) => {
  return await axiosApiInstance.get(`${BASE_CATEGORY_API}/slug/${slug}`)
}

export const getCategoryBreadcrumbApi = async (slug) => {
  return await axiosApiInstance.get(`${BASE_CATEGORY_API}/breadcrumb/${slug}`)
}

export const searchCategoriesApi = async (query) => {
  return await axiosApiInstance.get(`${BASE_CATEGORY_API}/search`, {
    params: { q: query }
  })
}

export const getCategoryHierarchyApi = async (slug) => {
  return await axiosApiInstance.get(`${BASE_CATEGORY_API}/${slug}/hierarchy`)
}

// ==================== ADMIN ROUTES ====================

export const getCategoriesApi = async () => {
  return await axiosApiInstance.get(`${BASE_CATEGORY_API}/all-category`)
}

export const createCategoryApi = async (payload) => {
  return await axiosApiInstance.post(`${BASE_CATEGORY_API}`, payload)
}

export const updateCategoryApi = async (payload) => {
  return await axiosApiInstance.put(`${BASE_CATEGORY_API}`, payload)
}

export const updateCategoryHierarchyApi = async (payload) => {
  return await axiosApiInstance.put(`${BASE_CATEGORY_API}/hierarchy`, payload)
}

export const updateCategoryProductCountApi = async (id) => {
  return await axiosApiInstance.put(`${BASE_CATEGORY_API}/${id}/product-count`)
}

export const bulkUpdateProductCountsApi = async () => {
  return await axiosApiInstance.put(`${BASE_CATEGORY_API}/bulk-update-counts`)
}

export const deleteCategoryApi = async (id) => {
  return await axiosApiInstance.delete(`${BASE_CATEGORY_API}/${id}`)
}

export const forceDeleteCategoryApi = async (id) => {
  return await axiosApiInstance.delete(`${BASE_CATEGORY_API}/${id}/force`)
}

// ==================== LEGACY ROUTES (DEPRECATED) ====================

// @deprecated Use createCategoryApi instead
export const addNewCategoryApi = async (data) => {
  return await axiosApiInstance.post(`${BASE_CATEGORY_API}/add-category`, data)
}

// @deprecated Use updateCategoryApi instead
export const updateCategoryLegacyApi = async (data) => {
  return await axiosApiInstance.put(`${BASE_CATEGORY_API}/update-category`, data)
}

// @deprecated Use deleteCategoryApi instead
export const deleteCategoryLegacyApi = async (data) => {
  return await axiosApiInstance.delete(`${BASE_CATEGORY_API}/delete-category`, { data })
}

// ==================== UTILITY FUNCTIONS ====================

export const getCategorySlug = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9-]/g, "")
}

export const getCategoryBySlug = (categories, slug) => {
  return categories.find((cat) => getCategorySlug(cat.name) === slug)
}

