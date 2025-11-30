import axiosApiInstance from '../../utils/api'
import axios from 'axios'
axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_PRODUCT_API = '/product'


export const searchProductApi = async (query) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/search?${query}`)
}

export const getBestSellerApi = async (data) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/bestSeller`, data)
}

export const getTrendingProductsApi = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/trending${queryString ? `?${queryString}` : ''}`)
}

export const getNewProductApi = async (data) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/newProduct`, data)
}

export const getAllProductsApi = async (params = {}) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/allProduct`, { params })
}

export const getProductApi = async (id, data) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/${id}`, data)
}

export const getRelatedProductsApi = async (productId, params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await axiosApiInstance.get(
        `${BASE_PRODUCT_API}/${productId}/related${queryString ? `?${queryString}` : ''}`
    )
}

export const getProductWithReviewsApi = async (id, params = {}) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/${id}/with-reviews`, { params })
}

export const getProductsWithReviewDataApi = async (id) => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/${id}/review-data`)
}

// ==================== CATEGORY PRODUCT ROUTES ====================

export const getProductsByCategoryApi = async (categorySlug, filters = {}) => {

    const queryString = new URLSearchParams(filters).toString()
    const url = `${BASE_PRODUCT_API}/by-category/${categorySlug}${queryString ? `?${queryString}` : ''}`

    return await axiosApiInstance.get(url)
}

export const getCategoryFiltersApi = async (categorySlug) => {
    // Support multi-level category URLs
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/filters/${categorySlug}`)
}

export const getFeaturedProductApi = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/featured${queryString ? `?${queryString}` : ''}`)
}

export const getFeaturedByTypeApi = async (type, params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/featured/${type}${queryString ? `?${queryString}` : ''}`)
}

export const getFeaturedAnalyticsApi = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/featured/analytics${queryString ? `?${queryString}` : ''}`)
}

export const setProductFeaturedApi = async (id, data) => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/featured/${id}`, data)
}

export const removeProductFeaturedApi = async (id, data = {}) => {
    return await axiosApiInstance.delete(`${BASE_PRODUCT_API}/featured/${id}`, { data })
}

export const updateFeaturedOrderApi = async (products) => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/featured/order`, { products })
}

export const autoPromoteFeaturedApi = async (data) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/featured/auto-promote`, data)
}

export const trackFeaturedInteractionApi = async (id, type) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/featured/${id}/track`, { type })
}

// ==================== SALE PRODUCT ROUTES ====================

export const getSaleProductsApi = async () => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/sale`)
}

export const getFlashSaleProductsApi = async () => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/flash-sale`)
}

export const getSaleStatisticsApi = async () => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/sale/statistics`)
}

export const getExpiredSalesApi = async () => {
    return await axiosApiInstance.get(`${BASE_PRODUCT_API}/expired-sales`)
}

export const setSaleForProductApi = async (id, data) => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/${id}/sale`, data)
}

export const endSaleForProductApi = async (id) => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/${id}/sale/end`)
}

export const updateSalePriceApi = async (id, data) => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/${id}/sale/update`, data)
}

export const setFlashSaleForProductApi = async (id, data) => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/${id}/flash-sale`, data)
}

export const setBulkSaleApi = async (data) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/bulk-sale`, data)
}

export const cleanupExpiredSalesApi = async () => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/cleanup-expired-sales`)
}

export const setSaleForCategoryApi = async (categoryId, data) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/sale/category/${categoryId}`, data)
}

export const setSaleForBrandApi = async (brandName, data) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/sale/brand/${brandName}`, data)
}

export const setSaleForMultipleCategoriesApi = async (data) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/sale/categories`, data)
}

export const endSaleForCategoryApi = async (categoryId) => {
    return await axiosApiInstance.delete(`${BASE_PRODUCT_API}/sale/category/${categoryId}`)
}

export const endSaleForBrandApi = async (brandName) => {
    return await axiosApiInstance.delete(`${BASE_PRODUCT_API}/sale/brand/${brandName}`)
}

// ==================== ADMIN PRODUCT ROUTES ====================

export const createProductApi = async (data) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/addProduct`, data)
}

export const updateProductApi = async (id, data) => {
    return await axiosApiInstance.put(`${BASE_PRODUCT_API}/updateProduct/${id}`, data)
}

export const deleteProductApi = async (id) => {
    return await axiosApiInstance.delete(`${BASE_PRODUCT_API}/${id}`)
}

export const uploadProductImageApi = async (file) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/upload-image`, file)
}

// Bulk operations
export const bulkDeleteProductsApi = async (productIds) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/bulk-delete`, { productIds })
}

export const bulkUpdateStockApi = async (updates) => {
    return await axiosApiInstance.post(`${BASE_PRODUCT_API}/bulk-stock`, { updates })
}

// Stock management
export const updateStockApi = async (productId, stock) => {
    return await axiosApiInstance.patch(`${BASE_PRODUCT_API}/${productId}/stock`, { countInStock: stock })
}

// Product availability
export const toggleAvailabilityApi = async (productId) => {
    return await axiosApiInstance.patch(`${BASE_PRODUCT_API}/${productId}/toggle-availability`)
}

// Featured product
export const toggleFeaturedApi = async (productId) => {
    return await axiosApiInstance.patch(`${BASE_PRODUCT_API}/${productId}/toggle-featured`)
}

// ==================== CATEGORY ROUTES ====================

export const getAllCategoriesApi = async (params = {}) => {
    return await axiosApiInstance.get('/category/all-category', { params })
}

export const getCategoryTreeApi = async () => {
    return await axiosApiInstance.get('/category/tree')
}

export const getRootCategoriesApi = async () => {
    return await axiosApiInstance.get('/category/root-with-children')
}

export const createCategoryApi = async (data) => {
    return await axiosApiInstance.post('/category/add-category', data)
}

export const updateCategoryApi = async (id, data) => {
    return await axiosApiInstance.put('/category', { ...data, _id: id })
}

export const deleteCategoryApi = async (id) => {
    return await axiosApiInstance.delete('/category/delete-category', { data: { _id: id } })
}

// ==================== IMAGE UPLOAD ROUTES ====================

export const uploadImageApi = async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return await axiosApiInstance.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

export const uploadImagesApi = async (files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('images', file))
    return await axiosApiInstance.post('/product/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

export const deleteImageApi = async (publicId) => {
    return await axiosApiInstance.delete(`/upload/${publicId}`)
}

// Delete an image from a product by product ID and image ID
export const deleteProductImageApi = async (productId, imageId) => {
    return await axiosApiInstance.delete(`${BASE_PRODUCT_API}/${productId}/images/${imageId}`)
}
