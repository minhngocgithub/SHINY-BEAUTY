import axios from "axios"
import axiosApiInstance from "../../utils/api";
axios.defaults.baseURL = import.meta.env.VITE_API_URL
const BASE_WISHLIST_API = '/wishlist'

export const getWishlistApi = async () => {
    // Add query params to populate sale programs and pricing data
    return await axiosApiInstance.get(BASE_WISHLIST_API, {
        params: {
            populate: 'product,bundle',
            includeSalePrograms: true,
            calculatePrices: true
        }
    });
}
export const addToWishlistApi = async (productId) => {
    return await axiosApiInstance.post(`${BASE_WISHLIST_API}/add`, { productId });
}
export const addBundleToWishlistApi = async (bundleId) => {
    return await axiosApiInstance.post(`${BASE_WISHLIST_API}/add`, { bundleId });
}
export const removeFromWishlistApi = async (productId) => {
    return await axiosApiInstance.delete(`${BASE_WISHLIST_API}/remove/${productId}`);
}
export const checkInWishlistApi = async (productId) => {
    return await axiosApiInstance.get(`${BASE_WISHLIST_API}/check/${productId}`);
}
export const clearWishlistApi = async () => {
    return await axiosApiInstance.delete(`${BASE_WISHLIST_API}/clear`);
}
export const moveToCartApi = async (productId, quantity = 1) => {
    return await axiosApiInstance.post(
        `${BASE_WISHLIST_API}/move-to-cart/${productId}`,
        { quantity }
    );
}
export const getPriceChangesApi = async () => {
    return await axiosApiInstance.get(`${BASE_WISHLIST_API}/price-changes`);
}
export const formatWishlistItem = (item) => {
    // Support both product and bundle wishlist items
    if (item.itemType === 'bundle' || item.bundle) {
        const bundle = item.bundle;
        if (!bundle) return null;

        // Use backend-calculated price if available (same as BundleCard.vue)
        const currentPrice = bundle.finalPrice || bundle.currentPrice || bundle.bundlePrice || 0;
        const originalPrice = bundle.originalPrice || bundle.price || 0;
        const priceDiff = originalPrice - currentPrice;
        const pricePercentChange = originalPrice > 0 ? ((priceDiff / originalPrice) * 100).toFixed(2) : 0;

        return {
            ...item,
            bundle: {
                ...bundle,
                displayPrice: currentPrice,
                originalPrice: originalPrice,
                discountPercentage: bundle.discountPercentage || parseInt(pricePercentChange) || 0
            },
            priceDiff: priceDiff.toFixed(2),
            pricePercentChange,
            isPriceLower: priceDiff > 0,
            hasPriceChange: Math.abs(priceDiff) > 0.01
        };
    }

    const product = item.product;
    if (!product) return null;

    // Priority: Use backend-calculated prices (same as CardProduct.vue logic)
    // Backend middleware should populate: finalPrice, currentPrice, hasSale, activeSaleProgram, discountPercentage
    const hasBackendSale = !!(
        product.hasSale ||
        product.activeSaleProgram ||
        (product.finalPrice && product.finalPrice < product.price)
    );

    const currentPrice = hasBackendSale
        ? (product.finalPrice || product.currentPrice || product.salePrice || product.price)
        : product.price;

    const originalPrice = product.originalPrice || product.price;
    const priceDiff = originalPrice - currentPrice;
    const pricePercentChange = originalPrice > 0
        ? ((priceDiff / originalPrice) * 100).toFixed(2)
        : 0;

    return {
        ...item,
        product: {
            ...product,
            displayPrice: currentPrice,
            originalPrice: originalPrice,
            // Preserve backend-calculated discount percentage
            discountPercentage: product.discountPercentage || parseInt(pricePercentChange) || 0,
            // Preserve sale info
            hasSale: hasBackendSale,
            activeSaleProgram: product.activeSaleProgram || null
        },
        priceDiff: priceDiff.toFixed(2),
        pricePercentChange,
        isPriceLower: priceDiff > 0,
        hasPriceChange: Math.abs(priceDiff) > 0.01
    };
}
export const getLocalWishlist = () => {
    try {
        const wishlist = localStorage.getItem('wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    } catch (error) {
        console.error('Error getting local wishlist:', error);
        return [];
    }
}
export const saveLocalWishlist = (items) => {
    try {
        localStorage.setItem('wishlist', JSON.stringify(items));
    } catch (error) {
        console.error('Error saving local wishlist:', error);
    }
}
export const mergeWishlistWithServer = async () => {
    try {
        const localWishlist = getLocalWishlist();
        if (localWishlist.length === 0) return;

        for (const item of localWishlist) {
            const productId = item.product?._id || item.productId;
            const bundleId = item.bundle?._id || item.bundleId;

            if (productId) {
                try {
                    await addToWishlistApi(productId);
                } catch (error) {
                    console.warn(`Could not add product ${productId} to wishlist:`, error);
                }
            } else if (bundleId) {
                try {
                    await addBundleToWishlistApi(bundleId);
                } catch (error) {
                    console.warn(`Could not add bundle ${bundleId} to wishlist:`, error);
                }
            }
        }

        localStorage.removeItem('wishlist');
        console.log('Wishlist merged with server successfully');
    } catch (error) {
        console.error('Error merging wishlist:', error);
    }
}
