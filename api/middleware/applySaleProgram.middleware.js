const SaleProgramUtils = require('../utils/saleProgram.utils');
const applySaleProgramToProducts = async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async function (data) {
        try {
            const skipSaleProgram = req.query.skipSaleProgram === 'true';

            if (!skipSaleProgram) {
                // Get active sale programs once
                const salePrograms = await SaleProgramUtils.getActiveSalePrograms({
                    user: req.user
                });

                // Priority 1: Single product (data.product)
                if (data.product) {
                    data.product = await applyBestSale(data.product, salePrograms, req.user);
                }
                else if (data.products && Array.isArray(data.products)) {
                    data.products = await Promise.all(
                        data.products.map(p => applyBestSale(p, salePrograms, req.user))
                    );
                }
                else if (data.data?.products && Array.isArray(data.data.products)) {
                    data.data.products = await Promise.all(
                        data.data.products.map(p => applyBestSale(p, salePrograms, req.user))
                    );
                }
                else if (data.success && data.data?.product) {
                    data.data.product = await applyBestSale(data.data.product, salePrograms, req.user);
                }
            }
        } catch (error) {
            console.error('❌ Error in applySaleProgramToProducts middleware:', error);
        }

        return originalJson(data);
    };

    next();
};

/**
 * Apply the best sale (either product sale or sale program) to a product
 */
async function applyBestSale(product, salePrograms, user) {
    if (!product || !product._id) {
        return product;
    }
    const productObj = product.toObject ? product.toObject() : product;
    let bestSale = {
        displayPrice: productObj.price,
        originalPrice: productObj.price,
        discount: 0,
        discountPercentage: 0,
        savings: 0,
        type: 'regular',
        saleProgram: null
    };

    // If product has direct sale and it's active
    if (productObj.isSaleActive && productObj.salePrice) {
        const productSavings = (productObj.originalPrice || productObj.price) - productObj.salePrice;
        bestSale = {
            displayPrice: productObj.salePrice,
            originalPrice: productObj.originalPrice || productObj.price,
            discount: productSavings,
            discountPercentage: productObj.discountPercentage ||
                Math.round((productSavings / (productObj.originalPrice || productObj.price)) * 100),
            savings: productSavings,
            type: 'direct_sale',
            saleProgram: null
        };
    }

    const applicablePrograms = salePrograms.filter(program =>
        SaleProgramUtils.isProductEligible(program, productObj)
    );

    if (applicablePrograms.length > 0) {
        // Find the best program discount
        for (const program of applicablePrograms) {
            const programDiscount = await SaleProgramUtils.calculateProgramDiscount(program, productObj);

            // Use this program if its discount is better
            if (programDiscount.amount > bestSale.discount) {
                const basePrice = productObj.originalPrice || productObj.price;
                bestSale = {
                    displayPrice: programDiscount.finalPrice,
                    originalPrice: basePrice,
                    discount: programDiscount.amount,
                    discountPercentage: program.benefits?.discountPercentage ||
                        Math.round((programDiscount.amount / basePrice) * 100),
                    savings: programDiscount.amount,
                    type: 'sale_program',
                    saleProgram: {
                        id: program._id,
                        title: program.title,
                        type: program.type,
                        badge: program.displaySettings?.badge
                    }
                };
            }
        }
    }

    const result = {
        ...productObj,
        price: productObj.price,
        originalPrice: bestSale.originalPrice,
        currentPrice: bestSale.displayPrice,
        salePrice: bestSale.type !== 'regular' ? bestSale.displayPrice : null,
        finalPrice: bestSale.displayPrice,

        // Discount info
        discount: bestSale.discount,
        discountPercentage: bestSale.discountPercentage,
        savings: bestSale.savings,

        // Sale status
        hasSale: bestSale.type !== 'regular',
        isOnSale: bestSale.type !== 'regular',
        saleType: bestSale.type,
        activeSaleProgram: bestSale.saleProgram,
        _productSalePrice: productObj.salePrice,
        _productSaleActive: productObj.isSaleActive
    };
    if (productObj.name && Math.random() < 0.1) { 
  
    }

    return result;
}

module.exports = { applySaleProgramToProducts };