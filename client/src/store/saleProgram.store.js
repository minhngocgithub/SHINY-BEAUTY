import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getActiveSaleProgramsApi,
  getSaleProgramByIdApi,
  createSaleProgramApi,
  updateSaleProgramApi,
  deleteSaleProgramApi,
  getAllSaleProgramsApi,
  getProductsBySaleProgramApi,
  getBundlesBySaleProgramApi,
  validateCouponCodeApi,
  syncProductsToSaleProgramApi,
  syncBundlesToSaleProgramApi,
  getSaleProgramAnalyticsApi,
  toggleSaleProgramStatusApi
} from '../service/saleProgram.service'

export const useSaleProgramStore = defineStore('saleProgram', () => {
  // State
  const salePrograms = ref([])
  const activePrograms = ref([])
  const currentProgram = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Computed
  const flashSales = computed(() =>
    activePrograms.value.filter(program => program.type === 'flash_sale')
  )

  const seasonalSales = computed(() =>
    activePrograms.value.filter(program => program.type === 'seasonal')
  )

  const clearanceSales = computed(() =>
    activePrograms.value.filter(program => program.type === 'clearance')
  )

  const bundleDeals = computed(() =>
    activePrograms.value.filter(program => program.type === 'bundle')
  )

  const programsByType = computed(() => ({
    flash_sale: flashSales.value,
    seasonal: seasonalSales.value,
    clearance: clearanceSales.value,
    bundle: bundleDeals.value
  }))

  const isProgramActive = computed(() => (program) => {
    if (!program) return false
    const now = new Date()
    const startDate = new Date(program.startDate)
    const endDate = new Date(program.endDate)
    return now >= startDate && now <= endDate && program.isActive !== false
  })

  // ✅ FIXED: Correct logic to find program for product
  const getProgramForProduct = computed(() => (product) => {
    if (!product || !activePrograms.value.length) {
      return null
    }
    if (product.saleProgram) {
      const programById = activePrograms.value.find(program =>
        program._id === product.saleProgram._id ||
        program._id === product.saleProgram ||
        program.id === product.saleProgram._id ||
        program.id === product.saleProgram
      )
      if (programById && isProgramActive.value(programById)) {
        return programById
      }
    }

    // Priority 2: Check if product ID is in program's applicableProducts array
    for (const program of activePrograms.value) {
      if (!isProgramActive.value(program)) continue

      const applicableProducts = program.conditions?.applicableProducts || []
      if (applicableProducts.length > 0) {
        const productIdStr = product._id?.toString() || product._id
        const isApplicable = applicableProducts.some(prodId => {
          const programProdId = prodId?.toString() || prodId
          return programProdId === productIdStr
        })

        if (isApplicable) {
          return program
        }
      }
    }

    // Priority 3: Check category-based programs
    if (product.category && Array.isArray(product.category) && product.category.length > 0) {
      for (const category of product.category) {
        for (const program of activePrograms.value) {
          if (!isProgramActive.value(program)) continue

          const applicableCategories = program.conditions?.categories || []
          if (applicableCategories.length > 0) {
            const categoryIdStr = category._id?.toString() || category._id || category
            const categoryMatch = applicableCategories.some(catId => {
              const programCatId = catId?.toString() || catId
              return programCatId === categoryIdStr
            })

            if (categoryMatch) {
              console.log('✅ Found by category:', {
                programTitle: program.title,
                categoryName: category.name || categoryIdStr,
                discount: program.benefits?.discountPercentage + '%'
              })
              return program
            }
          }
        }
      }
    }

    // Priority 4: Check brand-based programs
    if (product.brand) {
      for (const program of activePrograms.value) {
        if (!isProgramActive.value(program)) continue

        const applicableBrands = program.conditions?.brands || []
        if (applicableBrands.length > 0) {
          const brandMatch = applicableBrands.some(
            brand => brand.toLowerCase() === product.brand.toLowerCase()
          )

          if (brandMatch) {
            console.log('✅ Found by brand:', {
              programTitle: program.title,
              brand: product.brand,
              discount: program.benefits?.discountPercentage + '%'
            })
            return program
          }
        }
      }
    }

    // Priority 5: Check general programs (no targeting = applies to all)
    for (const program of activePrograms.value) {
      if (!isProgramActive.value(program)) continue

      const conditions = program.conditions || {}
      const hasNoTargeting = (
        (!conditions.applicableProducts || conditions.applicableProducts.length === 0) &&
        (!conditions.categories || conditions.categories.length === 0) &&
        (!conditions.brands || conditions.brands.length === 0)
      )

      if (hasNoTargeting) {
        console.log('✅ Found general program (applies to ALL):', {
          programTitle: program.title,
          discount: program.benefits?.discountPercentage + '%',
          productName: product.name
        })
        return program
      }
    }
    return null
  })

  const calculateDiscount = computed(() => (product, program) => {
    if (!product || !program) return { amount: 0, percentage: 0 }

    const originalPrice = product.price || 0
    let discountAmount = 0
    let discountPercentage = 0

    if (program.benefits?.discountPercentage) {
      discountPercentage = program.benefits.discountPercentage
      discountAmount = (originalPrice * discountPercentage) / 100
    } else if (program.benefits?.discountAmount) {
      discountAmount = program.benefits.discountAmount
      discountPercentage = (discountAmount / originalPrice) * 100
    }

    return {
      amount: Math.round(discountAmount * 100) / 100,
      percentage: Math.round(discountPercentage * 100) / 100
    }
  })

  const getProgramBadge = computed(() => (program) => {
    if (!program) return null

    const badges = {
      flash_sale: { text: '⚡ Flash Sale', class: 'bg-yellow-500 text-white' },
      percentage_sale: { text: '🔥 Sale', class: 'bg-red-500 text-white' },
      seasonal: { text: '🎉 Seasonal', class: 'bg-blue-500 text-white' },
      clearance: { text: '🔥 Clearance', class: 'bg-red-500 text-white' },
      bundle: { text: '📦 Bundle Deal', class: 'bg-purple-500 text-white' }
    }

    return badges[program.type] || { text: '💰 Sale', class: 'bg-gray-500 text-white' }
  })

  // Actions
  const fetchSalePrograms = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const response = await getAllSaleProgramsApi(params)

      if (response.data.success) {
        salePrograms.value = response.data.salePrograms || []
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch sale programs'
      console.error('Fetch sale programs error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchActivePrograms = async () => {
    try {
      console.log('📡 Fetching active programs...')
      const response = await getActiveSaleProgramsApi()

      if (response.data.success) {
        activePrograms.value = response.data.salePrograms || []
        console.log('✅ Active programs loaded:', {
          count: activePrograms.value.length,
          programs: activePrograms.value.map(p => ({
            id: p.id,
            title: p.title,
            type: p.type,
            discount: p.benefits?.discountPercentage,
            hasApplicableProducts: !!p.conditions?.applicableProducts?.length,
            applicableProductsCount: p.conditions?.applicableProducts?.length || 0,
            hasCategories: !!p.conditions?.categories?.length,
            categoriesCount: p.conditions?.categories?.length || 0,
            hasBrands: !!p.conditions?.brands?.length,
            brandsCount: p.conditions?.brands?.length || 0
          }))
        })
      }
    } catch (err) {
      console.error('Fetch active programs error:', err)
    }
  }

  const fetchSaleProgram = async (id) => {
    try {
      loading.value = true
      error.value = null

      const response = await getSaleProgramByIdApi(id)

      if (response.data.success) {
        currentProgram.value = response.data.saleProgram
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch sale program'
      console.error('Fetch sale program error:', err)
    } finally {
      loading.value = false
    }
  }

  const createSaleProgram = async (data) => {
    try {
      loading.value = true
      error.value = null

      const response = await createSaleProgramApi(data)

      if (response.data.success) {
        salePrograms.value.push(response.data.saleProgram)
        return { success: true, data: response.data.saleProgram }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create sale program'
      console.error('Create sale program error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSaleProgram = async (id, data) => {
    try {
      loading.value = true
      error.value = null

      const response = await updateSaleProgramApi(id, data)

      if (response.data.success) {
        const index = salePrograms.value.findIndex(program => program._id === id)
        if (index !== -1) {
          salePrograms.value[index] = response.data.saleProgram
        }
        return { success: true, data: response.data.saleProgram }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update sale program'
      console.error('Update sale program error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSaleProgram = async (id) => {
    try {
      loading.value = true
      error.value = null

      const response = await deleteSaleProgramApi(id)

      if (response.data.success) {
        salePrograms.value = salePrograms.value.filter(program => program._id !== id)
        activePrograms.value = activePrograms.value.filter(program => program._id !== id)
        return { success: true }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete sale program'
      console.error('Delete sale program error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    salePrograms,
    activePrograms,
    currentProgram,
    loading,
    error,

    // Computed
    flashSales,
    seasonalSales,
    clearanceSales,
    bundleDeals,
    programsByType,
    isProgramActive,
    getProgramForProduct,
    calculateDiscount,
    getProgramBadge,

    // Actions
    fetchSalePrograms,
    fetchActivePrograms,
    fetchSaleProgram,
    createSaleProgram,
    updateSaleProgram,
    deleteSaleProgram,
    clearError
  }
})