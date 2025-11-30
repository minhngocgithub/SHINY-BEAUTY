import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.store'
import {
    addToCartApi,
    getCartApi,
    updateCartItemApi,
    removeFromCartApi,
    clearCartApi,
    calculateCartTotals,
    validateCartItem,
    formatCartItem,
    getLocalCart,
    saveLocalCart,
    mergeCartWithServer,
    getCartCount
} from '../service/cart.service'

export const useCartStore = defineStore('cart', () => {
    const authStore = useAuthStore()
    const cartItems = ref([])
    const cartSummary = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const cartCount = computed(() => {
        if (cartSummary.value?.totalItems) {
            return cartSummary.value.totalItems
        }
        return cartItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
    })

    const cartTotals = computed(() => {
        return calculateCartTotals(cartSummary.value)
    })

    const isEmpty = computed(() => cartItems.value.length === 0)

    const formattedCartItems = computed(() => {
        return cartItems.value.map(item => formatCartItem(item)).filter(item => item !== null)
    })

    const cartBenefits = computed(() => {
        return cartSummary.value?.cartBenefits || {
            freeShipping: false,
            additionalDiscount: 0,
            gifts: []
        }
    })

    const hasAppliedPrograms = computed(() => {
        return cartItems.value.some(item => item.appliedProgram)
    })

    const getTotalSavings = computed(() => {
        const itemSavings = cartItems.value.reduce((sum, item) =>
            sum + (item.savings || 0), 0
        )
        const benefitSavings = cartSummary.value?.cartBenefits?.additionalDiscount || 0
        const shippingSavings = cartSummary.value?.cartBenefits?.freeShipping ? 5 : 0

        return itemSavings + benefitSavings + shippingSavings
    })

    // Actions
    const fetchCart = async (forceServer = false) => {
        try {
            loading.value = true
            error.value = null

            const isLoggedIn = forceServer || authStore.state.isLoggedIn

            if (!isLoggedIn) {
                const localCart = getLocalCart()
                cartItems.value = localCart
                return
            }

            const response = await getCartApi()

            if (response.data.success) {
                cartItems.value = response.data.cartItems || []
                cartSummary.value = response.data.summary || null
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch cart'
            console.error('Fetch cart error:', err)

            if (!authStore.state.isLoggedIn) {
                cartItems.value = getLocalCart()
            }
        } finally {
            loading.value = false
        }
    }

    const addToCart = async ({ product, bundle, quantity = 1 }) => {
        try {
            loading.value = true
            error.value = null

            if (product) {
                const validation = validateCartItem(product, quantity)
                if (!validation.valid) {
                    throw new Error(validation.message)
                }
            }

            // 🔍 DEBUG: Log frontend addToCart calls
            const callStack = new Error().stack?.split('\n') || []
            const callerInfo = callStack.slice(1, 6).join('\n')

            console.log('🛒 Frontend addToCart called:', {
                productId: product?._id,
                bundleId: bundle?._id,
                quantity,
                timestamp: new Date().toISOString()
            })
            console.log('📞 Call stack:', callerInfo)

            // Detect rapid duplicate calls (within 100ms)
            const now = Date.now()
            const cacheKey = `${product?._id || bundle?._id}_${quantity}`
            if (window.__lastAddToCartCall &&
                window.__lastAddToCartKey === cacheKey &&
                now - window.__lastAddToCartCall < 100) {
                console.warn('⚠️ DUPLICATE CALL DETECTED! Ignoring within 100ms')
                return { success: true, message: 'Duplicate call ignored' }
            }
            window.__lastAddToCartCall = now
            window.__lastAddToCartKey = cacheKey

            if (!authStore.state.isLoggedIn) {
                addToLocalCart(product, bundle, quantity)
                return { success: true, message: 'Added to cart' }
            }

            const requestData = { quantity }

            if (product) {
                requestData.productId = product._id
            } else if (bundle) {
                requestData.bundleId = bundle._id
            } else {
                throw new Error('Product or Bundle is required')
            }

            const response = await addToCartApi(requestData)

            if (response.data.success) {
                cartItems.value = response.data.cartItems || []
                cartSummary.value = response.data.summary || null

                return {
                    success: true,
                    message: response.data.message || 'Added to cart successfully',
                    cartCount: getCartCount(response.data)
                }
            }
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Failed to add to cart'
            console.error('Add to cart error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateQuantity = async (itemId, quantity) => {

        try {
            loading.value = true
            error.value = null

            if (!authStore.state.isLoggedIn) {
                updateLocalCartQuantity(itemId, quantity)
                return
            }
            const response = await updateCartItemApi({ itemId, quantity })

            if (response.data.success) {
                cartItems.value = response.data.cartItems || []
                cartSummary.value = response.data.summary || null
            } else {
                console.error('❌ [CART STORE] Update failed:', response.data);
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to update cart'
            throw err
        } finally {
            loading.value = false
        }
    }

    const removeItem = async (itemId) => {
        try {
            loading.value = true
            error.value = null

            if (!authStore.state.isLoggedIn) {
                removeFromLocalCart(itemId)
                return
            }
            const response = await removeFromCartApi(itemId)

            if (response.data.success) {
                cartItems.value = response.data.cartItems || []
                cartSummary.value = response.data.summary || null
            } else {
                console.error('❌ [CART STORE] Remove failed:', response.data);
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to remove item'
            throw err
        } finally {
            loading.value = false
        }
    }

    const clearCart = async () => {
        try {
            loading.value = true
            error.value = null

            if (!authStore.state.isLoggedIn) {
                localStorage.removeItem('cart')
                cartItems.value = []
                cartSummary.value = null
                return
            }

            const response = await clearCartApi()

            if (response.data.success) {
                cartItems.value = []
                cartSummary.value = null
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to clear cart'
            console.error('Clear cart error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Local cart helpers
    const addToLocalCart = (product, bundle, quantity) => {
        const localCart = getLocalCart()
        const itemData = product || bundle
        const itemType = product ? 'product' : 'bundle'

        const existingIndex = localCart.findIndex(item => {
            if (product) {
                return item.product?._id === product._id
            } else {
                return item.bundle?._id === bundle._id
            }
        })

        if (existingIndex > -1) {
            localCart[existingIndex].quantity += quantity
        } else {
            localCart.push({
                _id: `local_${Date.now()}`,
                [itemType]: itemData,
                quantity,
                itemType,
                addedAt: new Date().toISOString()
            })
        }

        saveLocalCart(localCart)
        cartItems.value = localCart
    }

    const updateLocalCartQuantity = (itemId, quantity) => {
        const localCart = getLocalCart()
        const item = localCart.find(i => i._id === itemId)
        if (item) {
            item.quantity = quantity
            saveLocalCart(localCart)
            cartItems.value = localCart
        }
    }

    const removeFromLocalCart = (itemId) => {
        let localCart = getLocalCart()
        localCart = localCart.filter(i => i._id !== itemId)
        saveLocalCart(localCart)
        cartItems.value = localCart
    }

    const syncCartAfterLogin = async () => {
        try {
            await mergeCartWithServer()
            await fetchCart(true)
        } catch (err) {
            console.error('Sync cart error:', err)
        }
    }

    /**
     * Get cart benefits for shipping calculation
     * @returns {Object} Cart benefits including freeShipping flag
     */
    const getCartBenefits = () => {
        return cartSummary.value?.cartBenefits || {
            freeShipping: false,
            additionalDiscount: 0,
            bonusPoints: 0,
            gifts: []
        }
    }

    /**
     * Calculate checkout pricing with cart benefits
     * Wrapper around payment.service.calculateOrderPricing
     */
    const calculateCheckoutPricing = (items, loyaltyPoints = 0, couponDiscount = 0, options = {}) => {
        const benefits = getCartBenefits()

        // Import calculateOrderPricing dynamically to avoid circular dependency
        // Or pass it from the calling component
        return {
            cartBenefits: benefits,
            items,
            loyaltyPoints,
            couponDiscount,
            options
        }
    }

    return {
        cartItems,
        cartSummary,
        loading,
        error,

        cartCount,
        cartTotals,
        isEmpty,
        formattedCartItems,
        cartBenefits,
        hasAppliedPrograms,
        getTotalSavings,

        fetchCart,
        addToCart,
        updateCartItem: updateQuantity,
        updateQuantity, // Export thêm để FloatingCart có thể gọi
        removeFromCart: removeItem,
        removeItem, // Export thêm để FloatingCart có thể gọi
        clearCart,
        syncCartAfterLogin,
        getCartBenefits, // NEW: Get cart benefits
        calculateCheckoutPricing // NEW: Calculate with benefits
    }
})