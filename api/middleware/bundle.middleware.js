const bundleProduct = require('../models/productBundle.models');
const bundleUtils = require('../utils/bundle.utils')

const validateBundleExist = async (req, res, next) => {
    try {
        const bundleId = req.params.bundleId || req.params.id;

        const bundle = await bundleProduct.findById(bundleId);
        if (!bundle) {
            console.log(' [validateBundleExist] Bundle not found');
            return res.status(404).json({ message: 'Bundle not found' });
        }
        if (!bundle.isActive) {
            console.log(' [validateBundleExist] Bundle is inactive');
            return res.status(400).json({ message: 'Bundle is not available' });
        }
        console.log(' [validateBundleExist] Bundle found and active');
        req.bundle = bundle
        next();

    } catch (error) {
        console.error(' [validateBundleExist] Error:', error);
        return res.status(400).json({ message: 'Error validating bundle existence', error: error.message });
    }
}
const validateBundleItems = async (req, res, next) => {
    try {
        const { items } = req.body;


        if (!items || !Array.isArray(items) || items.length === 0) {
            console.log(' [validateBundleItems] No items found');
            return res.status(400).json({ message: 'Bundle must contain at least one item' })
        }

        // Handle both ObjectId and string product IDs
        const productIds = items.map(item => {
            const productId = typeof item.product === 'string' ? item.product : item.product.toString();
            return productId;
        });

        const uniqueProductIds = [...new Set(productIds)];

        if (productIds.length !== uniqueProductIds.length) {
            console.log('[validateBundleItems] Duplicate products found');
            return res.status(400).json({ message: 'Bundle cannot contain duplicate products' });
        }

        for (const item of items) {
            if (!item.product || !item.quantity || item.quantity <= 0) {
                console.log('[validateBundleItems] Invalid item:', item);
                return res.status(400).json({ message: 'Each item must have a valid product ID and quantity greater than 0' });
            }
        }
        next();
    } catch (error) {
        console.error('[validateBundleItems] Error:', error);
        return res.status(400).json({ message: 'Invalid bundle items', error: error.message })
    }
}
const validateBundlePricing = async (req, res, next) => {
    try {
        const { bundlePrice, items } = req.body;

        console.log(' [validateBundlePricing] Price:', bundlePrice);

        if (!bundlePrice || bundlePrice <= 0) {
            console.log('[validateBundlePricing] Invalid price');
            return res.status(400).json({ message: 'Bundle price must be greater than 0' })
        }
        const pricingValidation = await bundleUtils.validateBundlePricing(bundlePrice, items)
        req.pricingInfo = pricingValidation;

        console.log('[validateBundlePricing] Validation passed');
        next();
    } catch (error) {
        console.error(' [validateBundlePricing] Error:', error);
        return res.status(400).json({ message: 'Error validating bundle pricing', error: error.message })
    }
};
const checkBundleStock = async (req, res, next) => {
    try {
        const { quantity = 1 } = req.body;
        const bundle = req.bundle || await bundleProduct.findById(req.params.id);
        if (!bundle) {
            return res.status(404).json({ message: 'Bundle not found' });
        }
        const stockCheck = await bundle.checkStock();
        if (!stockCheck.available) {
            return res.status(400).json({ message: stockCheck.reason });
        }
        const availableQuantity = await bundle.getAvailableQuantity();
        if (quantity > availableQuantity) {
            return res.status(400).json({ message: `Only ${availableQuantity} bundles available in stock` });
        }
        req.stockInfo = {
            available: stockCheck.available,
            maxQuantity: availableQuantity
        }
        next()
    } catch (error) {
        return res.status(400).json({ message: 'Error checking bundle stock' });
    }
}
const validateBundleCompatibility = (compatibilityRules = {}) => {
    return async (req, res, next) => {
        try {
            const { items } = req.body

            console.log('[validateBundleCompatibility] Checking compatibility');

            if (!items) {
                console.log('[validateBundleCompatibility] No items, skipping');
                return next();
            }

            const compatibility = bundleUtils.validateBundleCompatibility(items, compatibilityRules)

            if (!compatibility.isCompatible) {
                console.log(' [validateBundleCompatibility] Compatibility issues:', compatibility.issues);
                return res.status(400).json({ message: `Bundle compatibility issues: ${compatibility.issues.join(', ')}` })
            }
            next();
        } catch (error) {
            console.error(' [validateBundleCompatibility] Error:', error);
            return res.status(400).json({ message: 'Error validating bundle compatibility', error: error.message })
        }
    }
}
const checkSeasonalRelevance = async (req, res, next) => {
    try {
        if (req.query.seasonal === 'true') {
            const bundle = req.bundle || await bundleProduct.findById(req.params.id).populate('items.product')

            if (bundle) {
                const seasonalInfo = bundleUtils.checkSeasonalEligibility(bundle)
                req.seasonalInfo = seasonalInfo
            }
        }
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Error checking seasonal relevance' })
    }
}
const trackBundleViews = async (req, res, next) => {
    try {
        const bundleId = req.params.id
        if (req.method === 'GET' && bundleId) {
            await bundleProduct.findByIdAndUpdate(
                bundleId,
                { $inc: { views: 1 } },
                { new: false }
            );
        }
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Error tracking bundle views' });
    }
}
const validateAdminBundleOperation = async (req, res, next) => {
    try {
        console.log('[validateAdminBundleOperation] Checking admin operation');

        const { featured, featuredType } = req.body
        if (featured && (!featuredType || !['homepage', 'category', 'deal'].includes(featuredType))) {
            console.log('[validateAdminBundleOperation] Invalid featured type');
            return res.status(400).json({ message: 'Invalid featured type' });
        }
        if (featured) {
            const featuredCount = await bundleProduct.countDocuments({
                featured: true,
                featuredType,
                isActive: true
            });

            const maxFeatured = {
                homepage: 8,
                category: 12,
                deal: 6
            };

            if (featuredCount >= maxFeatured[featuredType]) {
                console.log('[validateAdminBundleOperation] Too many featured bundles');
                return res.status(400).json({ message: `Cannot feature more than ${maxFeatured[featuredType]} bundles on ${featuredType}` });
            }
        }
        next();
    } catch (error) {
        console.error('[validateAdminBundleOperation] Error:', error);
        return res.status(400).json({ message: 'Error validating admin operation', error: error.message });
    }
}
const formatBundleResponse = (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
        if (data.bundle) {
            data.bundle = bundleUtils.formatBundleForCart(data.bundle);
        }

        if (data.bundles && Array.isArray(data.bundles)) {
            data.bundles = data.bundles.map(bundle => bundleUtils.formatBundleForCart(bundle));
        }
        return originalJson.call(this, data);
    };
    next();
};

module.exports = {
    validateBundleExist,
    validateBundleItems,
    validateBundlePricing,
    checkBundleStock,
    validateBundleCompatibility,
    checkSeasonalRelevance,
    trackBundleViews,
    validateAdminBundleOperation,
    formatBundleResponse,

}