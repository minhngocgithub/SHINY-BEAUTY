import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAllProductsApi,
  getProductApi,
  getFeaturedProductApi,
  getSaleProductsApi,
  getFlashSaleProductsApi,
  getNewProductApi,
  getBestSellerApi,
  getTrendingProductsApi,
  getRelatedProductsApi,
  searchProductApi,
  getProductsByCategoryApi,
  getCategoryFiltersApi
} from '../service/product.service'

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref([])
  const currentProduct = ref(null)
  const featuredProducts = ref([])
  const trendingProducts = ref([])
  const saleProducts = ref([])
  const flashSaleProducts = ref([])
  const newProducts = ref([])
  const bestSellerProducts = ref([])
  const relatedProducts = ref([])
  const searchResults = ref([])
  const categoryProducts = ref([])
  const categoryInfo = ref(null)
  const availableFilters = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    category: null,
    brand: null,
    priceRange: { min: 0, max: 1000 },
    rating: null,
    inStock: null,
    onSale: null,
    sortBy: 'name',
    sortOrder: 'asc'
  })
  const pagination = ref({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // Computed
  const filteredProducts = computed(() => {
    let filtered = [...products.value]

    // Apply filters
    if (filters.value.category) {
      filtered = filtered.filter(product =>
        product.category?.some(cat =>
          cat._id === filters.value.category ||
          cat.slug === filters.value.category
        )
      )
    }

    if (filters.value.brand) {
      filtered = filtered.filter(product =>
        product.brand?.toLowerCase().includes(filters.value.brand.toLowerCase())
      )
    }

    if (filters.value.priceRange) {
      filtered = filtered.filter(product => {
        const price = product.salePrice || product.price || 0
        return price >= filters.value.priceRange.min &&
          price <= filters.value.priceRange.max
      })
    }

    if (filters.value.rating) {
      filtered = filtered.filter(product =>
        (product.ratings?.average || 0) >= filters.value.rating
      )
    }

    if (filters.value.inStock !== null) {
      filtered = filtered.filter(product =>
        filters.value.inStock ? product.countInstock > 0 : product.countInstock === 0
      )
    }

    if (filters.value.onSale !== null) {
      filtered = filtered.filter(product =>
        filters.value.onSale ? product.isOnSale : !product.isOnSale
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (filters.value.sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
          break
        case 'price':
          aValue = a.salePrice || a.price || 0
          bValue = b.salePrice || b.price || 0
          break
        case 'rating':
          aValue = a.ratings?.average || 0
          bValue = b.ratings?.average || 0
          break
        case 'sold':
          aValue = a.sold || 0
          bValue = b.sold || 0
          break
        case 'created':
          aValue = new Date(a.createdAt || 0)
          bValue = new Date(b.createdAt || 0)
          break
        default:
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
      }

      if (filters.value.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      }
      return aValue > bValue ? 1 : -1
    })

    return filtered
  })

  const isOnSale = computed(() => (product) => {
    return product.isOnSale ||
      product.salePrice ||
      product.flashSale?.isFlashSale ||
      (product.saleStartDate && product.saleEndDate &&
        new Date() >= new Date(product.saleStartDate) &&
        new Date() <= new Date(product.saleEndDate))
  })

  const getActiveSale = computed(() => (product) => {
    if (product.flashSale?.isFlashSale) {
      return {
        type: 'flash_sale',
        discountPercentage: product.discountPercentage || 0,
        endDate: product.saleEndDate,
        ...product.flashSale
      }
    }

    if (product.isOnSale && product.salePrice) {
      const discount = ((product.price - product.salePrice) / product.price) * 100
      return {
        type: 'sale',
        discountPercentage: Math.round(discount),
        endDate: product.saleEndDate,
        originalPrice: product.price,
        salePrice: product.salePrice
      }
    }

    return null
  })

  // Actions
  const fetchProducts = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const response = await getAllProductsApi(params)

      if (response.data.success) {
        products.value = response.data.products || []
        pagination.value = {
          page: response.data.page || 1,
          limit: response.data.limit || 12,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0
        }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch products'
      console.error('Fetch products error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProduct = async (id) => {
    try {
      loading.value = true
      error.value = null

      const response = await getProductApi(id)

      if (response.data.success) {
        currentProduct.value = response.data.product
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch product'
      console.error('Fetch product error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchFeaturedProducts = async (params = {}) => {
    try {
      const response = await getFeaturedProductApi(params)
      if (response.data.success) {
        featuredProducts.value = response.data.products || []
      }
    } catch (err) {
      console.error('Fetch featured products error:', err)
    }
  }

  const fetchSaleProducts = async () => {
    try {
      const response = await getSaleProductsApi()
      if (response.data.success) {
        saleProducts.value = response.data.products || []
      }
    } catch (err) {
      console.error('Fetch sale products error:', err)
    }
  }

  const fetchFlashSaleProducts = async () => {
    try {
      const response = await getFlashSaleProductsApi()
      if (response.data.success) {
        flashSaleProducts.value = response.data.products || []
      }
    } catch (err) {
      console.error('Fetch flash sale products error:', err)
    }
  }

  const fetchNewProducts = async (params = {}) => {
    try {
      const response = await getNewProductApi(params)
      if (response.data.success) {
        newProducts.value = response.data.products || []
      }
    } catch (err) {
      console.error('Fetch new products error:', err)
    }
  }

  const fetchBestSellerProducts = async (params = {}) => {
    try {
      const response = await getBestSellerApi(params)
      if (response.data.success) {
        bestSellerProducts.value = response.data.products || []
      }
    } catch (err) {
      console.error('Fetch best seller products error:', err)
    }
  }

  const fetchTrendingProducts = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const response = await getTrendingProductsApi(params)

      if (response.data.success) {
        trendingProducts.value = response.data.products || []
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch trending products'
      console.error('Fetch trending products error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchRelatedProducts = async (productId, params = {}) => {
    try {
      const response = await getRelatedProductsApi(productId, params)
      if (response.data.success) {
        relatedProducts.value = response.data.products || []
      }
    } catch (err) {
      console.error('Fetch related products error:', err)
    }
  }

  const searchProducts = async (query) => {
    try {
      loading.value = true
      error.value = null

      const response = await searchProductApi(query)

      if (response.data.success) {
        searchResults.value = response.data.products || []
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Search failed'
      console.error('Search products error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProductsByCategory = async (categorySlug, filters = {}) => {
    try {
      loading.value = true
      error.value = null

      const response = await getProductsByCategoryApi(categorySlug, filters)

      if (response.data.success) {
        categoryProducts.value = response.data.products || []
        categoryInfo.value = response.data.category || null
        pagination.value = response.data.pagination || {
          page: 1,
          limit: 24,
          total: 0,
          totalPages: 0
        }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch category products'
      console.error('Fetch category products error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCategoryFilters = async (categorySlug) => {
    try {
      const response = await getCategoryFiltersApi(categorySlug)

      if (response.data.success) {
        availableFilters.value = response.data.filters || null
      }
    } catch (err) {
      console.error('Fetch category filters error:', err)
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      category: null,
      brand: null,
      priceRange: { min: 0, max: 1000 },
      rating: null,
      inStock: null,
      onSale: null,
      sortBy: 'name',
      sortOrder: 'asc'
    }
  }

  const setPagination = (page) => {
    pagination.value.page = page
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    products,
    currentProduct,
    featuredProducts,
    trendingProducts,
    saleProducts,
    flashSaleProducts,
    newProducts,
    bestSellerProducts,
    relatedProducts,
    searchResults,
    categoryProducts,
    categoryInfo,
    availableFilters,
    loading,
    error,
    filters,
    pagination,

    // Computed
    filteredProducts,
    isOnSale,
    getActiveSale,

    // Actions
    fetchProducts,
    fetchProduct,
    fetchFeaturedProducts,
    fetchSaleProducts,
    fetchFlashSaleProducts,
    fetchNewProducts,
    fetchBestSellerProducts,
    fetchTrendingProducts,
    fetchRelatedProducts,
    searchProducts,
    fetchProductsByCategory,
    fetchCategoryFilters,
    setFilters,
    clearFilters,
    setPagination,
    clearError
  }
})

