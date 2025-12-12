const SaleProgram = require('../models/saleProgram.models');
const Product = require('../models/product.models');
const ProductBundle = require('../models/productBundle.models');
const SaleProgramUtils = require('../utils/saleProgram.utils');
const SaleProgramTrackingService = require('../services/saleProgramTracking.service');
const { fixSaleProgramStringFields } = require('../migrations/fixSaleProgramFields');
const { uploadImageCloudinary, deleteImageFromCloudinary } = require('../utils/upload.service');
const slugify = require('slugify');

// Helper function to check if products are already in other active sale programs
const checkProductConflicts = async (productIds, currentProgramId = null) => {
    if (!productIds || productIds.length === 0) {
        return { hasConflict: false };
    }

    const now = new Date();

    // Find active sale programs that contain any of these products
    const query = {
        isActive: true,
        startDate: { $lte: now },
        $or: [
            { endDate: { $gte: now } },
            { endDate: null }
        ],
        'conditions.applicableProducts': { $in: productIds }
    };

    // Exclude current program if updating
    if (currentProgramId) {
        query._id = { $ne: currentProgramId };
    }

    const activeProgramsWithProducts = await SaleProgram.find(query)
        .populate('conditions.applicableProducts', 'name slug')
        .select('title slug conditions.applicableProducts');

    if (activeProgramsWithProducts.length > 0) {
        const conflictingProducts = new Map();
        const conflictDetails = [];

        activeProgramsWithProducts.forEach(program => {
            const conflicts = [];

            program.conditions.applicableProducts.forEach(product => {
                const productIdStr = product._id.toString();
                if (productIds.some(id => id.toString() === productIdStr)) {
                    conflicts.push({
                        id: product._id,
                        name: product.name,
                        slug: product.slug
                    });

                    if (!conflictingProducts.has(productIdStr)) {
                        conflictingProducts.set(productIdStr, {
                            id: product._id,
                            name: product.name,
                            programs: []
                        });
                    }

                    conflictingProducts.get(productIdStr).programs.push({
                        id: program._id,
                        title: program.title,
                        slug: program.slug
                    });
                }
            });

            if (conflicts.length > 0) {
                conflictDetails.push({
                    programId: program._id,
                    programTitle: program.title,
                    programSlug: program.slug,
                    conflictingProducts: conflicts
                });
            }
        });

        return {
            hasConflict: true,
            conflictingProducts: Array.from(conflictingProducts.values()),
            conflictDetails,
            count: conflictingProducts.size
        };
    }

    return { hasConflict: false };
};

const createSaleProgram = async (req, res) => {
    try {
        const {
            title,
            description,
            shortDescription,
            type,
            conditions,
            benefits,
            startDate,
            endDate,
            maxUsage,
            targetType,
            targetUsers,
            displaySettings,
            stacking,
            exclusiveWith,
            autoPopulateProducts = true,
            autoPopulateBundles = false
        } = req.body;

        if (!title || !type || !startDate) {
            return res.status(400).json({
                success: false,
                message: 'Title, type, and start date are required'
            });
        }
        const slug = slugify(title, { lower: true, strict: true });

        const existingProgram = await SaleProgram.findOne({ slug });
        if (existingProgram) {
            return res.status(400).json({
                success: false,
                message: 'A program with this title already exists'
            });
        }
        if (endDate && new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: 'Start date must be before end date'
            });
        }
        const parsedConditions = typeof conditions === 'string'
            ? JSON.parse(conditions)
            : (conditions || {});

        // Validate categories/brands conflicts BEFORE auto-populating
        if (autoPopulateProducts && (parsedConditions.categories?.length > 0 || parsedConditions.brands?.length > 0)) {
            const now = new Date();

            // Find active sale programs with overlapping categories/brands
            const overlapQuery = {
                isActive: true,
                startDate: { $lte: now },
                $or: [
                    { endDate: { $gte: now } },
                    { endDate: null }
                ]
            };

            const orConditions = [];
            if (parsedConditions.categories?.length > 0) {
                orConditions.push({ 'conditions.categories': { $in: parsedConditions.categories } });
            }
            if (parsedConditions.brands?.length > 0) {
                orConditions.push({ 'conditions.brands': { $in: parsedConditions.brands } });
            }

            if (orConditions.length > 0) {
                overlapQuery.$or = [...overlapQuery.$or, ...orConditions];
            }

            const overlappingPrograms = await SaleProgram.find(overlapQuery)
                .select('title slug conditions.categories conditions.brands');

            if (overlappingPrograms.length > 0) {
                const warnings = overlappingPrograms.map(prog => ({
                    programId: prog._id,
                    programTitle: prog.title,
                    overlappingCategories: parsedConditions.categories?.filter(cat =>
                        prog.conditions.categories?.some(c => c.toString() === cat.toString())
                    ) || [],
                    overlappingBrands: parsedConditions.brands?.filter(brand =>
                        prog.conditions.brands?.includes(brand)
                    ) || []
                })).filter(w => w.overlappingCategories.length > 0 || w.overlappingBrands.length > 0);

                if (warnings.length > 0) {
                    console.log('⚠️ Warning: Categories/Brands overlap with existing programs:', warnings);
                    // Continue but products will be filtered by isOnSale check below
                }
            }
        }

        if (autoPopulateProducts) {
            const productQuery = { countInstock: { $gt: 0 } };

            if (parsedConditions.categories?.length > 0) {
                productQuery.category = { $in: parsedConditions.categories };
            }

            if (parsedConditions.brands?.length > 0) {
                productQuery.brand = { $in: parsedConditions.brands };
            }

            if (parsedConditions.applicableProducts?.length > 0) {
                productQuery._id = { $in: parsedConditions.applicableProducts };
            }

            if (parsedConditions.excludeProducts?.length > 0) {
                productQuery._id = {
                    ...productQuery._id,
                    $nin: parsedConditions.excludeProducts
                };
            }

            // CRITICAL: Exclude products already in active sale programs
            const now = new Date();
            const activeSalePrograms = await SaleProgram.find({
                isActive: true,
                startDate: { $lte: now },
                $or: [
                    { endDate: { $gte: now } },
                    { endDate: null }
                ]
            }).select('conditions.applicableProducts');

            const productsInActiveSale = activeSalePrograms
                .flatMap(program => program.conditions.applicableProducts || [])
                .map(id => id.toString());

            if (productsInActiveSale.length > 0) {
                productQuery._id = productQuery._id
                    ? { ...productQuery._id, $nin: [...(productQuery._id.$nin || []), ...productsInActiveSale] }
                    : { $nin: productsInActiveSale };
            }

            const applicableProducts = await Product.find(productQuery).select('_id')
            parsedConditions.applicableProducts = applicableProducts.map(p => p._id)
        }

        // Check for product conflicts with other active sale programs
        if (parsedConditions.applicableProducts && parsedConditions.applicableProducts.length > 0) {
            const conflicts = await checkProductConflicts(parsedConditions.applicableProducts);

            if (conflicts.hasConflict) {
                return res.status(409).json({
                    success: false,
                    message: `${conflicts.count} product(s) are already in other active sale programs`,
                    conflicts: conflicts.conflictDetails,
                    conflictingProducts: conflicts.conflictingProducts
                });
            }
        }

        if (autoPopulateBundles) {
            const bundleQuery = { isActive: true };

            if (parsedConditions.categories?.length > 0) {
                bundleQuery.category = { $in: parsedConditions.categories };
            }

            if (parsedConditions.brands?.length > 0) {
                bundleQuery.brand = { $in: parsedConditions.brands };
            }

            const applicableBundles = await ProductBundle.find(bundleQuery).select('_id');
            parsedConditions.applicableBundles = applicableBundles.map(b => b._id);
        }
        let bannerImage = null;
        if (req.file) {
            const uploadResult = await uploadImageCloudinary(req.file, 'sale-programs');
            bannerImage = uploadResult.url;
        } else if (req.body.bannerImage) {
            bannerImage = req.body.bannerImage;
        }
        const saleProgram = await SaleProgram.create({
            title,
            slug,
            description,
            shortDescription,
            type,
            conditions: parsedConditions,
            benefits: typeof benefits === 'string' ? JSON.parse(benefits) : (benefits || {}),
            displaySettings: typeof displaySettings === 'string' ? JSON.parse(displaySettings) : (displaySettings || {}),
            startDate,
            endDate,
            maxUsage,
            targetType,
            targetUsers,
            stacking,
            exclusiveWith,
            bannerImage,
            createdBy: req.user._id
        })

        await saleProgram.populate([
            { path: 'conditions.applicableProducts', select: 'name price brand image' },
            { path: 'conditions.categories', select: 'name' },
            { path: 'conditions.applicableBundles', select: 'name bundlePrice' }
        ]);

        // Send notifications and emails to users (async, don't block response)
        (async () => {
            try {
                const User = require('../models/user.models');
                const NotificationService = require('../services/notification.service');
                const EmailService = require('../services/email.service');
                const io = req.app.get('io');

                // Get all active users with notification preferences
                const users = await User.find({
                    isActive: true,
                    'notificationPreferences.email.promotions': { $ne: false }
                }).select('_id email name notificationPreferences');

                const userIds = users.map(u => u._id.toString());

                // Send in-app notifications
                if (userIds.length > 0) {
                    await NotificationService.notifyNewSaleProgram(io, userIds, saleProgram);
                    console.log(`✅ Sent notifications to ${userIds.length} users for sale program: ${saleProgram.title}`);
                }

                // Send emails (queued for async processing)
                const emailTemplate = require('../templates/saleProgramAlert');
                const emailPromises = users
                    .filter(user => user.email && user.notificationPreferences?.email?.promotions !== false)
                    .map(async (user) => {
                        const discountText = saleProgram.benefits?.discountPercentage
                            ? `${saleProgram.benefits.discountPercentage}% OFF`
                            : saleProgram.benefits?.discountAmount
                                ? `$${saleProgram.benefits.discountAmount} OFF`
                                : 'Special Discount';

                        const emailHtml = emailTemplate({
                            saleProgram: saleProgram.toObject(),
                            user,
                            discountText
                        });

                        return EmailService.queueEmail({
                            to: user.email,
                            subject: `🎉 ${saleProgram.title} - ${discountText}`,
                            html: emailHtml,
                            type: 'SALE_PROGRAM',
                            saleProgramId: saleProgram._id.toString()
                        });
                    });

                await Promise.allSettled(emailPromises);
                console.log(`✅ Queued ${emailPromises.length} emails for sale program: ${saleProgram.title}`);

            } catch (notificationError) {
                console.error('❌ Error sending notifications/emails:', notificationError);
                // Don't throw - notifications are not critical for API response
            }
        })();

        res.status(201).json({
            success: true,
            message: 'Sale program created successfully',
            saleProgram,
            stats: {
                productsAdded: parsedConditions.applicableProducts?.length || 0,
                bundlesAdded: parsedConditions.applicableBundles?.length || 0
            }
        });

    } catch (error) {
        console.error('Create sale program error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const getAllSalePrograms = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            type,
            search,
            sort = 'createdAt',
            order = 'desc'
        } = req.query;

        const filter = {};
        const now = new Date();

        // Handle dynamic status filtering
        if (status && status !== 'all' && status !== '') {
            switch (status) {
                case 'active':
                    filter.isActive = true;
                    filter.startDate = { $lte: now };
                    filter.$or = [
                        { endDate: { $gte: now } },
                        { endDate: null }
                    ];
                    break;
                case 'scheduled':
                    filter.isActive = true;
                    filter.startDate = { $gt: now };
                    break;
                case 'expired':
                    filter.endDate = { $lt: now };
                    break;
                case 'paused':
                    filter.isActive = false;
                    break;
                case 'draft':
                    filter.isActive = { $ne: true };
                    break;
                default:
                    // For any other status values, use as-is
                    filter.status = status;
            }
        }

        if (type) {
            filter.type = type;
        }

        if (search && search.trim()) {
            filter.$or = [
                { title: new RegExp(search.trim(), 'i') },
                { description: new RegExp(search.trim(), 'i') },
                { shortDescription: new RegExp(search.trim(), 'i') }
            ];
        }

        const sortObj = {};
        sortObj[sort] = order === 'asc' ? 1 : -1;

        const currentPage = Math.max(1, parseInt(page));
        const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (currentPage - 1) * pageSize;

        const [rawPrograms, total] = await Promise.all([
            SaleProgram.find(filter)
                .populate('createdBy', 'name email')
                .populate('conditions.applicableProducts', 'name price')
                .populate('conditions.categories', 'name')
                .populate('conditions.applicableBundles', 'name bundlePrice')
                .sort(sortObj)
                .skip(skip)
                .limit(pageSize)
                .lean(), // Use lean() to get plain objects
            SaleProgram.countDocuments(filter)
        ]);

        // Parse stringified fields (fix legacy data)
        const salePrograms = rawPrograms.map(program => {
            if (typeof program.benefits === 'string') {
                try {
                    program.benefits = JSON.parse(program.benefits);
                } catch (e) {
                    console.warn(`Failed to parse benefits for ${program._id}:`, e.message);
                    program.benefits = {};
                }
            }
            if (typeof program.conditions === 'string') {
                try {
                    program.conditions = JSON.parse(program.conditions);
                } catch (e) {
                    console.warn(`Failed to parse conditions for ${program._id}:`, e.message);
                    program.conditions = {};
                }
            }
            if (typeof program.displaySettings === 'string') {
                try {
                    program.displaySettings = JSON.parse(program.displaySettings);
                } catch (e) {
                    console.warn(`Failed to parse displaySettings for ${program._id}:`, e.message);
                    program.displaySettings = {};
                }
            }
            return program;
        });

        res.status(200).json({
            success: true,
            data: {
                salePrograms,
                pagination: {
                    currentPage,
                    totalPages: Math.ceil(total / pageSize),
                    pageSize,
                    totalItems: total
                }
            }
        });
    } catch (error) {
        console.error('Get all sale programs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getActiveSalePrograms = async (req, res) => {
    try {
        const {
            type,
            category,
            brand,
            applyStacking,
            saleProgramId,
            productId
        } = req.query

        const user = req.user || null
        let salePrograms = await SaleProgramUtils.getActiveSalePrograms({ user })

        if (saleProgramId) {
            const specificProgram = salePrograms.find(
                p => p._id.toString() === saleProgramId || p.slug === saleProgramId
            )
            if (specificProgram) {
                salePrograms = [
                    specificProgram,
                    ...salePrograms.filter(p => p._id.toString() !== saleProgramId)
                ]
            }
        }

        if (productId) {
            const product = await require('../models/product.models').findById(productId)
            if (product) {
                salePrograms = salePrograms.filter(program =>
                    SaleProgramUtils.isProductEligible(program, product)
                )
            }
        }

        if (type) {
            salePrograms = salePrograms.filter(program => program.type === type)
        }

        if (category) {
            salePrograms = salePrograms.filter(program =>
                program.conditions.categories?.some(c => c._id.toString() === category)
            )
        }

        if (brand) {
            salePrograms = salePrograms.filter(program =>
                program.conditions.brands?.includes(brand)
            )
        }

        const filteredPrograms = applyStacking === 'true'
            ? SaleProgramUtils.filterByStackingRules(salePrograms)
            : salePrograms

        const formattedPrograms = filteredPrograms.map(program => ({
            _id: program._id,
            id: program._id,
            title: program.title,
            slug: program.slug,
            shortDescription: program.shortDescription,
            type: program.type,
            bannerImage: program.bannerImage,
            displaySettings: program.displaySettings,
            timeRemaining: program.timeRemaining,
            isCurrentlyActive: program.isCurrentlyActive,
            benefits: program.benefits,
            stacking: program.stacking,
            conditions: {
                applicableProducts: program.conditions.applicableProducts?.map(p =>
                    p._id ? p._id.toString() : p.toString()
                ) || [],
                categories: program.conditions.categories?.map(c =>
                    c._id ? c._id.toString() : c.toString()
                ) || [],
                brands: program.conditions.brands || [],
                minOrderValue: program.conditions.minOrderValue,
                maxOrderValue: program.conditions.maxOrderValue,
                membershipRequired: program.conditions.membershipRequired,
                newCustomersOnly: program.conditions.newCustomersOnly
            },
            startDate: program.startDate,
            endDate: program.endDate
        }))

        res.status(200).json({
            success: true,
            salePrograms: formattedPrograms
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

const getSaleProgramById = async (req, res) => {
    try {
        const { id } = req.params;

        const saleProgram = await SaleProgram.findById(id)
            .populate('conditions.applicableProducts', 'name price image brand')
            .populate('conditions.categories', 'name')
            .populate('conditions.applicableBundles', 'name bundlePrice image')
            .populate('createdBy', 'name email');

        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            })
        }

        saleProgram.stats.views += 1
        await saleProgram.save()

        res.status(200).json({
            success: true,
            saleProgram
        });

    } catch (error) {
        console.error('Get sale program error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const getProductsBySaleProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            page = 1,
            limit = 12,
            sortBy = 'discountPercentage',
            sortOrder = 'desc'
        } = req.query;

        const saleProgram = await SaleProgram.findById(id)
            .populate({
                path: 'conditions.applicableProducts',
                select: 'name price image brand category countInstock slug'
            })
            .populate('conditions.categories', 'name');

        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        if (!saleProgram.isCurrentlyActive) {
            return res.status(400).json({
                success: false,
                message: 'This sale program is not currently active'
            });
        }
        let products = saleProgram.conditions.applicableProducts || []
        const sortOrderValue = sortOrder === 'asc' ? 1 : -1
        products.sort((a, b) => {
            if (sortBy === 'price') {
                return (a.price - b.price) * sortOrderValue
            } else if (sortBy === 'name') {
                return a.name.localeCompare(b.name) * sortOrderValue
            }
            return 0
        })
        const currentPage = Math.max(1, parseInt(page))
        const pageSize = Math.min(50, Math.max(1, parseInt(limit)))
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize
        const paginatedProducts = products.slice(startIndex, endIndex)

        res.status(200).json({
            success: true,
            saleProgram: {
                id: saleProgram._id,
                title: saleProgram.title,
                description: saleProgram.description,
                shortDescription: saleProgram.shortDescription,
                discountPercentage: saleProgram.benefits.discountPercentage,
                discountAmount: saleProgram.benefits.discountAmount,
                timeRemaining: saleProgram.timeRemaining,
                bannerImage: saleProgram.bannerImage
            },
            products: paginatedProducts,
            pagination: {
                currentPage,
                totalPages: Math.ceil(products.length / pageSize),
                totalProducts: products.length,
                pageSize
            }
        })

    } catch (error) {
        console.error('Get products by sale program error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

const getBundlesBySaleProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const saleProgram = await SaleProgram.findById(id)
            .populate({
                path: 'conditions.applicableBundles',
                populate: {
                    path: 'items.product',
                    select: 'name price image'
                }
            });

        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        const bundles = saleProgram.conditions.applicableBundles || [];

        const currentPage = Math.max(1, parseInt(page))
        const pageSize = Math.min(50, Math.max(1, parseInt(limit)))
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedBundles = bundles.slice(startIndex, startIndex + pageSize)

        res.status(200).json({
            success: true,
            saleProgram: {
                id: saleProgram._id,
                title: saleProgram.title,
                type: saleProgram.type
            },
            bundles: paginatedBundles,
            pagination: {
                currentPage,
                totalPages: Math.ceil(bundles.length / pageSize),
                totalBundles: bundles.length
            }
        });

    } catch (error) {
        console.error('Get bundles by sale program error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

const updateSaleProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const saleProgram = await SaleProgram.findById(id);
        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        // Parse stringified fields from FormData
        if (typeof updateData.conditions === 'string') {
            try {
                updateData.conditions = JSON.parse(updateData.conditions);
            } catch (e) {
                console.error('Failed to parse conditions:', e);
            }
        }

        if (typeof updateData.benefits === 'string') {
            try {
                updateData.benefits = JSON.parse(updateData.benefits);
            } catch (e) {
                console.error('Failed to parse benefits:', e);
            }
        }

        if (typeof updateData.displaySettings === 'string') {
            try {
                updateData.displaySettings = JSON.parse(updateData.displaySettings);
            } catch (e) {
                console.error('Failed to parse displaySettings:', e);
            }
        }

        if (typeof updateData.targeting === 'string') {
            try {
                updateData.targeting = JSON.parse(updateData.targeting);
            } catch (e) {
                console.error('Failed to parse targeting:', e);
            }
        }

        if (updateData.title && updateData.title !== saleProgram.title) {
            updateData.slug = slugify(updateData.title, { lower: true, strict: true });
        }

        // Check for product conflicts if updating applicableProducts
        if (updateData.conditions && updateData.conditions.applicableProducts && updateData.conditions.applicableProducts.length > 0) {
            const conflicts = await checkProductConflicts(
                updateData.conditions.applicableProducts,
                id // Exclude current program
            );

            if (conflicts.hasConflict) {
                return res.status(409).json({
                    success: false,
                    message: `${conflicts.count} product(s) are already in other active sale programs`,
                    conflicts: conflicts.conflictDetails,
                    conflictingProducts: conflicts.conflictingProducts
                });
            }
        }

        if (req.file) {
            const uploadResult = await uploadImageCloudinary(req.file, 'sale-programs');
            updateData.bannerImage = uploadResult.url;
        } else if (req.body.image) {
            const imageData = typeof req.body.image === 'string'
                ? JSON.parse(req.body.image)
                : req.body.image;

            if (imageData && imageData.url) {
                updateData.bannerImage = imageData.url;
            }
        } else if (req.body.bannerImage && req.body.bannerImage !== saleProgram.bannerImage) {
            updateData.bannerImage = req.body.bannerImage;
        }

        delete updateData.image;

        const historyChanges = {};
        for (const key of Object.keys(updateData)) {
            if (key !== 'image' && saleProgram[key] !== updateData[key]) {
                historyChanges[key] = {
                    from: saleProgram[key],
                    to: updateData[key]
                };
            }
        }

        if (Object.keys(historyChanges).length > 0) {
            updateData.$push = {
                history: {
                    updatedBy: req.user._id,
                    changes: historyChanges
                }
            };
        }

        updateData.lastModifiedBy = req.user._id;

        const updatedProgram = await SaleProgram.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate([
            { path: 'conditions.applicableProducts', select: 'name price brand image' },
            { path: 'conditions.categories', select: 'name' },
            { path: 'conditions.applicableBundles', select: 'name bundlePrice' }
        ]);

        console.log('✅ Updated banner:', updatedProgram.bannerImage);

        res.status(200).json({
            success: true,
            message: 'Sale program updated successfully',
            saleProgram: updatedProgram
        });

    } catch (error) {
        console.error('Update sale program error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            errors: error.errors // Mongoose validation errors
        });

        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
            error: error.name === 'ValidationError' ? error.errors : error.message
        });
    }
}

const syncProductsToSaleProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            includeOutOfStock = false,
            forceRefresh = false
        } = req.body;

        const saleProgram = await SaleProgram.findById(id);
        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }
        const conditions = saleProgram.conditions;
        if (!forceRefresh && conditions.applicableProducts?.length > 0) {
            return res.status(200).json({
                success: true,
                message: 'Products already synced. Use forceRefresh=true to re-sync',
                productsCount: conditions.applicableProducts.length
            });
        }

        const productQuery = {};

        if (!includeOutOfStock) {
            productQuery.countInstock = { $gt: 0 };
        }

        if (conditions.categories?.length > 0) {
            productQuery.category = { $in: conditions.categories };
        }

        if (conditions.brands?.length > 0) {
            productQuery.brand = { $in: conditions.brands };
        }

        if (conditions.excludeProducts?.length > 0) {
            productQuery._id = { $nin: conditions.excludeProducts };
        }

        // CRITICAL: Exclude products already in OTHER active sale programs
        const now = new Date();
        const activeSalePrograms = await SaleProgram.find({
            _id: { $ne: id }, // Exclude current program
            isActive: true,
            startDate: { $lte: now },
            $or: [
                { endDate: { $gte: now } },
                { endDate: null }
            ]
        }).select('conditions.applicableProducts');

        const productsInOtherActiveSales = activeSalePrograms
            .flatMap(program => program.conditions.applicableProducts || [])
            .map(productId => productId.toString());

        if (productsInOtherActiveSales.length > 0) {
            productQuery._id = productQuery._id
                ? { ...productQuery._id, $nin: [...(productQuery._id.$nin || []), ...productsInOtherActiveSales] }
                : { $nin: productsInOtherActiveSales };
        }

        const products = await Product.find(productQuery).select('_id');
        const productIds = products.map(p => p._id);

        // Check for product conflicts with other active sale programs
        if (productIds.length > 0) {
            const conflicts = await checkProductConflicts(productIds, id);

            if (conflicts.hasConflict) {
                return res.status(409).json({
                    success: false,
                    message: `${conflicts.count} product(s) are already in other active sale programs`,
                    conflicts: conflicts.conflictDetails,
                    conflictingProducts: conflicts.conflictingProducts,
                    suggestion: 'Remove these products from other sale programs first, or exclude them from this sync'
                });
            }
        }

        saleProgram.conditions.applicableProducts = productIds;
        await saleProgram.save();

        res.status(200).json({
            success: true,
            message: `Synced ${productIds.length} products to sale program`,
            data: {
                productsCount: productIds.length,
                saleProgram: {
                    id: saleProgram._id,
                    title: saleProgram.title,
                    type: saleProgram.type
                }
            }
        });

    } catch (error) {
        console.error('Sync products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const syncBundlesToSaleProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { includeInactive = false } = req.body

        const saleProgram = await SaleProgram.findById(id)
        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        const conditions = saleProgram.conditions;
        const bundleQuery = {};

        if (!includeInactive) {
            bundleQuery.isActive = true;
        }

        if (conditions.categories?.length > 0) {
            bundleQuery.category = { $in: conditions.categories };
        }

        if (conditions.brands?.length > 0) {
            bundleQuery.brand = { $in: conditions.brands };
        }

        const bundles = await ProductBundle.find(bundleQuery).select('_id');
        const bundleIds = bundles.map(b => b._id);

        saleProgram.conditions.applicableBundles = bundleIds;
        await saleProgram.save();

        res.status(200).json({
            success: true,
            message: `Synced ${bundleIds.length} bundles to sale program`,
            data: {
                bundlesCount: bundleIds.length
            }
        });

    } catch (error) {
        console.error('Sync bundles error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const deleteSaleProgram = async (req, res) => {
    try {
        const { id } = req.params;

        const saleProgram = await SaleProgram.findById(id)
        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        // Actually delete from database (hard delete)
        await SaleProgram.findByIdAndDelete(id);

        console.log(`✅ Sale program deleted: ${saleProgram.title} (${id})`);

        res.status(200).json({
            success: true,
            message: 'Sale program deleted successfully'
        });

    } catch (error) {
        console.error('Delete sale program error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

const validateCouponCode = async (req, res) => {
    try {
        const { code } = req.body;
        const user = req.user;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code is required'
            });
        }

        const salePrograms = await SaleProgramUtils.getActiveSalePrograms({ user })
        const couponProgram = salePrograms.find(program =>
            program.conditions.requiredPromoCode?.toLowerCase() === code.toLowerCase()
        )
        if (!couponProgram) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired coupon code'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Coupon code is valid',
            coupon: {
                code: couponProgram.conditions.requiredPromoCode,
                discountPercentage: couponProgram.benefits.discountPercentage,
                discountAmount: couponProgram.benefits.discountAmount,
                type: couponProgram.type,
                title: couponProgram.title,
                programId: couponProgram._id
            }
        })
    } catch (error) {
        console.error('Validate coupon code error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const getSaleProgramAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        const analytics = await SaleProgramUtils.getProgramAnalytics(id)

        if (!analytics) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        res.status(200).json({
            success: true,
            analytics
        });

    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
const toggleSaleProgramStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const saleProgram = await SaleProgram.findById(id);
        if (!saleProgram) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        // Toggle isActive field
        saleProgram.isActive = !saleProgram.isActive;

        // When activating, set status to 'active'
        // When deactivating, set status to 'paused'
        if (saleProgram.isActive) {
            saleProgram.status = 'active';
        } else {
            saleProgram.status = 'paused';
        }

        await saleProgram.save();

        res.status(200).json({
            success: true,
            message: `Sale program ${saleProgram.isActive ? 'activated' : 'paused'} successfully`,
            data: {
                saleProgram,
                isActive: saleProgram.isActive
            }
        })

    } catch (error) {
        console.error('Toggle sale program status error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

// Recalculate stats for a specific program
const recalculateProgramStats = async (req, res) => {
    try {
        const { id } = req.params;

        const program = await SaleProgram.findById(id);
        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Sale program not found'
            });
        }

        const stats = await SaleProgramTrackingService.recalculateStats(id);

        res.status(200).json({
            success: true,
            message: 'Stats recalculated successfully',
            data: { stats }
        });

    } catch (error) {
        console.error('Recalculate stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to recalculate stats'
        });
    }
}

// Recalculate stats for all programs
const recalculateAllProgramStats = async (req, res) => {
    try {
        await SaleProgramTrackingService.recalculateAllStats();

        res.status(200).json({
            success: true,
            message: 'All program stats recalculated successfully'
        });

    } catch (error) {
        console.error('Recalculate all stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to recalculate all stats'
        });
    }
}

// Fix legacy data with stringified fields
const fixLegacyDataFields = async (req, res) => {
    try {
        const result = await fixSaleProgramStringFields();

        res.status(200).json({
            success: true,
            message: 'Legacy data fixed successfully',
            data: result
        });

    } catch (error) {
        console.error('Fix legacy data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fix legacy data',
            error: error.message
        });
    }
}

const uploadSaleProgramBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image"
            });
        }

        if (!req.file.mimetype.startsWith('image')) {
            return res.status(400).json({
                success: false,
                message: "Please upload only image files"
            });
        }

        const uploadResult = await uploadImageCloudinary(req.file, "sale-programs");

        return res.status(200).json({
            success: true,
            message: "Banner uploaded successfully",
            image: {
                public_id: uploadResult.public_id,
                url: uploadResult.url
            }
        });

    } catch (error) {
        console.error("Upload banner error:", error);
        return res.status(500).json({
            success: false,
            message: "Upload failed",
            error: error.message
        });
    }
};

module.exports = {
    createSaleProgram,
    getAllSalePrograms,
    getActiveSalePrograms,
    getSaleProgramById,
    getProductsBySaleProgram,
    getBundlesBySaleProgram,
    updateSaleProgram,
    syncProductsToSaleProgram,
    syncBundlesToSaleProgram,
    deleteSaleProgram,
    validateCouponCode,
    getSaleProgramAnalytics,
    toggleSaleProgramStatus,
    uploadSaleProgramBanner,
    recalculateProgramStats,
    recalculateAllProgramStats,
    fixLegacyDataFields
};