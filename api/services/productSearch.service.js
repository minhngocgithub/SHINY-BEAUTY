const Product = require('../models/product.models');
const Category = require('../models/category.models');

/**
 * Advanced Product Search Service
 * Provides comprehensive search functionality with filters, autocomplete, and suggestions
 */
class ProductSearchService {

    /**
     * Main search function with advanced filtering and sorting
     * @param {Object} params - Search parameters
     * @returns {Object} Search results with products and metadata
     */
    async search(params) {
        const {
            keyword = '',
            category = null,
            brand = null,
            minPrice = null,
            maxPrice = null,
            minRating = null,
            inStock = null,
            sortBy = 'relevance', // relevance, price-asc, price-desc, newest, popular, rating
            page = 1,
            limit = 24
        } = params;

        // Build search query
        const query = this.buildSearchQuery({
            keyword,
            category,
            brand,
            minPrice,
            maxPrice,
            minRating,
            inStock
        });

        // Calculate pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Determine sort order
        const sort = this.getSortOption(sortBy, keyword);

        // Execute search
        const [products, total, filters] = await Promise.all([
            Product.find(query)
                .populate(this.populateCategoryWithParents())
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Product.countDocuments(query),
            this.getAvailableFilters(query)
        ]);

        // Calculate relevance scores if searching by keyword
        let scoredProducts = products;
        if (keyword) {
            scoredProducts = this.calculateRelevanceScores(products, keyword);
        }

        return {
            success: true,
            query: {
                keyword,
                category,
                brand,
                minPrice,
                maxPrice,
                minRating,
                inStock,
                sortBy
            },
            products: scoredProducts,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasNextPage: pageNum < Math.ceil(total / limitNum),
                hasPrevPage: pageNum > 1
            },
            filters, // Available filters based on current search
            suggestions: keyword ? await this.getSearchSuggestions(keyword) : []
        };
    }

    /**
     * Build MongoDB query from search parameters
     */
    buildSearchQuery(params) {
        const { keyword, category, brand, minPrice, maxPrice, minRating, inStock } = params;
        const query = {};

        // Text search across multiple fields
        if (keyword && keyword.trim()) {
            const searchRegex = new RegExp(keyword.trim(), 'i');
            query.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { brand: searchRegex },
                { 'tags': searchRegex }
            ];
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Brand filter
        if (brand) {
            query.brand = new RegExp(`^${brand}$`, 'i');
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Rating filter
        if (minRating) {
            query['ratings.average'] = { $gte: Number(minRating) };
        }

        // Stock filter
        if (inStock === 'true' || inStock === true) {
            query.countInstock = { $gt: 0 };
        }

        return query;
    }

    /**
     * Get sort options based on sortBy parameter
     */
    getSortOption(sortBy, keyword) {
        const sortOptions = {
            'relevance': keyword ? { score: -1, 'ratings.average': -1, sold: -1 } : { sold: -1, 'ratings.average': -1 },
            'price-asc': { price: 1 },
            'price-desc': { price: -1 },
            'newest': { createdAt: -1 },
            'popular': { sold: -1, 'ratings.count': -1 },
            'rating': { 'ratings.average': -1, 'ratings.count': -1 },
            'name-asc': { name: 1 },
            'name-desc': { name: -1 }
        };

        return sortOptions[sortBy] || sortOptions.relevance;
    }

    /**
     * Calculate relevance scores for search results
     */
    calculateRelevanceScores(products, keyword) {
        const keywordLower = keyword.toLowerCase().trim();
        const keywords = keywordLower.split(' ').filter(k => k.length > 0);

        return products.map(product => {
            let score = 0;
            const nameLower = (product.name || '').toLowerCase();
            const descLower = (product.description || '').toLowerCase();
            const brandLower = (product.brand || '').toLowerCase();

            // Exact match in name (highest priority)
            if (nameLower === keywordLower) {
                score += 100;
            } else if (nameLower.includes(keywordLower)) {
                score += 50;
            }

            // Keyword appears at start of name
            if (nameLower.startsWith(keywordLower)) {
                score += 30;
            }

            // Individual keyword matches in name
            keywords.forEach(kw => {
                if (nameLower.includes(kw)) score += 10;
            });

            // Brand match
            if (brandLower === keywordLower) {
                score += 40;
            } else if (brandLower.includes(keywordLower)) {
                score += 20;
            }

            // Description match
            keywords.forEach(kw => {
                if (descLower.includes(kw)) score += 5;
            });

            // Boost for popular products
            score += Math.min(product.sold || 0, 50) * 0.1;
            score += (product.ratings?.average || 0) * 5;
            score += Math.min(product.ratings?.count || 0, 100) * 0.1;

            return {
                ...product,
                _searchScore: score
            };
        }).sort((a, b) => b._searchScore - a._searchScore);
    }

    /**
     * Get available filters based on current search results
     */
    async getAvailableFilters(baseQuery) {
        try {
            // Get unique brands
            const brands = await Product.distinct('brand', baseQuery);

            // Get price range
            const priceStats = await Product.aggregate([
                { $match: baseQuery },
                {
                    $group: {
                        _id: null,
                        minPrice: { $min: '$price' },
                        maxPrice: { $max: '$price' },
                        avgPrice: { $avg: '$price' }
                    }
                }
            ]);

            // Get categories
            const categoryIds = await Product.distinct('category', baseQuery);
            const categories = await Category.find({
                _id: { $in: categoryIds }
            })
                .select('name slug level')
                .lean();

            // Get rating distribution
            const ratingDistribution = await Product.aggregate([
                { $match: baseQuery },
                {
                    $bucket: {
                        groupBy: '$ratings.average',
                        boundaries: [0, 1, 2, 3, 4, 5],
                        default: 0,
                        output: {
                            count: { $sum: 1 }
                        }
                    }
                }
            ]);

            return {
                brands: brands.filter(b => b).sort(),
                priceRange: priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
                categories: categories.sort((a, b) => a.name.localeCompare(b.name)),
                ratings: ratingDistribution,
                totalProducts: await Product.countDocuments(baseQuery)
            };
        } catch (error) {
            console.error('Get Available Filters Error:', error);
            return {
                brands: [],
                priceRange: { minPrice: 0, maxPrice: 0, avgPrice: 0 },
                categories: [],
                ratings: [],
                totalProducts: 0
            };
        }
    }

    /**
     * Get autocomplete suggestions for search
     */
    async getSearchSuggestions(keyword, limit = 10) {
        if (!keyword || keyword.trim().length < 2) return [];

        try {
            const searchRegex = new RegExp(`^${keyword.trim()}`, 'i');

            // Get product name suggestions
            const productSuggestions = await Product.find({
                name: searchRegex
            })
                .select('name brand')
                .limit(limit)
                .lean();

            // Get brand suggestions
            const brands = await Product.distinct('brand', {
                brand: searchRegex
            });

            const suggestions = [
                ...productSuggestions.map(p => ({
                    type: 'product',
                    text: p.name,
                    brand: p.brand
                })),
                ...brands.slice(0, 3).map(b => ({
                    type: 'brand',
                    text: b
                }))
            ];

            return suggestions.slice(0, limit);
        } catch (error) {
            console.error('Get Search Suggestions Error:', error);
            return [];
        }
    }

    /**
     * Get popular search keywords (from actual searches)
     */
    async getPopularSearches(limit = 10) {
        try {
            // This would typically come from a search history/analytics collection
            // For now, return most popular product names/brands
            const popular = await Product.aggregate([
                {
                    $group: {
                        _id: '$brand',
                        count: { $sum: '$sold' }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: limit }
            ]);

            return popular.map(p => p._id).filter(Boolean);
        } catch (error) {
            console.error('Get Popular Searches Error:', error);
            return [];
        }
    }

    /**
     * Get trending searches
     */
    async getTrendingSearches(limit = 10) {
        try {
            // Get recently popular products
            const trending = await Product.find({
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
            })
                .sort({ sold: -1, 'ratings.average': -1 })
                .limit(limit)
                .select('name brand')
                .lean();

            return trending.map(p => ({
                keyword: p.name,
                type: 'trending'
            }));
        } catch (error) {
            console.error('Get Trending Searches Error:', error);
            return [];
        }
    }

    /**
     * Helper: Populate category with nested parents
     */
    populateCategoryWithParents() {
        return {
            path: 'category',
            select: 'name slug parent level',
            populate: {
                path: 'parent',
                select: 'name slug parent level',
                populate: {
                    path: 'parent',
                    select: 'name slug parent level'
                }
            }
        };
    }
}

module.exports = new ProductSearchService();
