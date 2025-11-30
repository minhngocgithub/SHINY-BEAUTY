const Product = require('../models/product.models')
const { uploadImageCloudinary, deleteImageFromCloudinary } = require('../utils/upload.service')
const slugify = require('slugify')
const cloudinary = require('../config/cloudinary')
const Review = require('../models/review.models')
const SaleProgramUtils = require('../utils/saleProgram.utils');
const ProductSearchService = require('../services/productSearch.service');

// ✅ Helper: Populate category with nested parents (up to 3 levels)
const populateCategoryWithParents = () => ({
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
});

const createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      description,
      price,
      countInstock
    } = req.body;
    const validationErrors = [];

    if (!name) validationErrors.push("Name is required");
    if (!brand) validationErrors.push("Brand is required");
    if (!description) validationErrors.push("Description is required");
    if (!price) validationErrors.push("Price is required");
    if (!category) validationErrors.push("Category is required");
    if (!countInstock) validationErrors.push("CountInstock is required");
    if (validationErrors.length > 0) {
      return res.status(400).json({
        errors: validationErrors
      });
    }
    let cloudinaryRes = null;

    if (req.file) {
      cloudinaryRes = await uploadImageCloudinary(req.file);
    }
    else if (req.body.image && Array.isArray(req.body.image) && req.body.image.length > 0) {
      const imageData = req.body.image[0]; // Get first image from array
      if (imageData.url && imageData.public_id) {
        cloudinaryRes = {
          public_id: imageData.public_id,
          secure_url: imageData.url
        };
      }
    }
    // Handle image object case
    else if (req.body.image && typeof req.body.image === 'object' && !Array.isArray(req.body.image)) {
      if (req.body.image.url && req.body.image.public_id) {
        cloudinaryRes = {
          public_id: req.body.image.public_id,
          secure_url: req.body.image.url
        };
      }
    }

    else if (req.body.image && typeof req.body.image === 'string' && (req.body.image.startsWith("http://") || req.body.image.startsWith("https://"))) {
      cloudinaryRes = { secure_url: req.body.image, public_id: null };
    }
    else if (req.body.image && typeof req.body.image === 'string') {
      cloudinaryRes = await cloudinary.uploader.upload(req.body.image, {
        folder: "products",
        transformation: [{ width: 800, height: 600, crop: "limit" }]
      });
    } else {
      return res.status(400).json({
        error: "Image is required"
      });
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
      trim: true
    });

    const productData = {
      name,
      brand,
      category,
      description,
      price,
      countInstock,
      slug,
      image: [{
        public_id: cloudinaryRes.public_id,
        url: cloudinaryRes.secure_url,
        isMain: true,
        alt: name,
        order: 0
      }]
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: product
    });

  } catch (error) {
    console.error('Create Product Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    })
  }
}
const getProduct = async (req, res) => {
  try {
    const { id } = req.params
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      })
    }

    let product = await Product.findById(id)
      .populate({
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
      })
      .lean()

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    // Remove legacy 'images' field if exists
    if (product.images) {
      delete product.images;
    }

    return res.status(200).json({
      success: true,
      productData: product
    })
  } catch (error) {
    console.error('Get Product Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error retrieving product',
      error: error.message
    })
  }
}

const getNewProduct = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const products = await Product.find({ isNewProduct: true })
      .populate(populateCategoryWithParents())
      .limit(limit)
      .sort('-createdAt')
      .lean()

    return res.status(200).json({
      success: true,
      total: products.length,
      products
    })
  } catch (error) {
    console.error('Get New Products Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error retrieving new products',
      error: error.message
    })
  }
}
const getBestSeller = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const products = await Product.find({ isBestSeller: true })
      .populate(populateCategoryWithParents())
      .limit(limit)
      .sort('-sold')
      .lean()

    return res.status(200).json({
      success: true,
      total: products.length,
      products
    })
  } catch (error) {
    console.error('Get Best Sellers Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error retrieving best sellers',
      error: error.message
    })
  }
}

const getTrendingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    // Get trending products based on multiple criteria
    const products = await Product.find({
      $or: [
        { featuredType: 'trending', featured: true, featuredExpiry: { $gte: new Date() } },
        { trendingScore: { $gte: 60 } },
        { isNewProduct: true, sold: { $gte: 3 } }
      ],
      countInstock: { $gt: 0 }
    })
      .populate(populateCategoryWithParents())
      .sort({ trendingScore: -1, sold: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      total: products.length,
      products
    });
  } catch (error) {
    console.error('Get Trending Products Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving trending products',
      error: error.message
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      search,
      sort = '-createdAt',
      inStock,
      featured,
      isBestSeller,
      isOnSale,
      isNewProduct
    } = req.query

    const filter = {}
    const andConditions = []

    if (category) filter.category = category
    if (brand) filter.brand = new RegExp(brand, 'i')
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }
    if (minRating) filter['ratings.average'] = { $gte: Number(minRating) }

    // Boolean filters
    if (featured === 'true') {
      filter.featured = true
    } else if (featured === 'false') {
      filter.featured = false
    }

    if (isBestSeller === 'true') {
      filter.isBestSeller = true
    } else if (isBestSeller === 'false') {
      filter.isBestSeller = false
    }

    if (isOnSale === 'true') {
      filter.isOnSale = true
    } else if (isOnSale === 'false') {
      filter.isOnSale = false
    }

    if (isNewProduct === 'true') {
      filter.isNewProduct = true
      // Also check if still within new product period
      filter.newUntil = { $gte: new Date() }
    } else if (isNewProduct === 'false') {
      // Not new: either isNewProduct=false OR expired newUntil
      andConditions.push({
        $or: [
          { isNewProduct: false },
          { isNewProduct: true, newUntil: { $lt: new Date() } },
          { newUntil: { $exists: false } }
        ]
      })
    }

    // Search filter
    if (search) {
      andConditions.push({
        $or: [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { brand: new RegExp(search, 'i') }
        ]
      })
    }

    // Combine $and conditions if needed
    if (andConditions.length > 0) {
      filter.$and = andConditions
    }

    // Stock filter: support both in stock and out of stock
    if (inStock === 'true') {
      filter.countInstock = { $gt: 0 }
    } else if (inStock === 'false') {
      filter.countInstock = { $lte: 0 }
      // IMPORTANT: When out of stock, ignore sale/bestseller filters
      // because products with no stock can't be sold
      console.log('⚠️ Out of stock filter detected - products cannot be on sale or bestsellers')
    }

    // Validate filter conflicts
    if (inStock === 'false') {
      // Out of stock products shouldn't be filtered by sale status
      // They're not being sold, so sale status is irrelevant
      if (minRating) {
        console.log('⚠️ Warning: Filtering out-of-stock products by rating may return no results')
      }
    }

    // Price range validation
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {

      const temp = minPrice
      filter.price.$gte = Number(maxPrice)
      filter.price.$lte = Number(temp)
    }

    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const skip = (pageNum - 1) * limitNum


    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate(populateCategoryWithParents())
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter)
    ])

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalProducts: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    })
  } catch (error) {
    console.error('Get All Products Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error retrieving products',
      error: error.message
    })
  }
}
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      brand,
      category,
      description,
      price,
      countInstock,
      image,
      images,
      featured,
      isBestSeller,
      isOnSale,
      isNewProduct
    } = req.body

    const existingProduct = await Product.findById(id)

    if (!existingProduct) {
      return res.status(404).json({
        error: "Product not found",
      })
    }

    let cloudinaryRes = null

    // If a single file was uploaded in multipart/form-data
    if (req.file) {
      // If existing main image has public_id, attempt to delete it
      if (existingProduct.image && existingProduct.image.public_id) {
        try {
          await deleteImageFromCloudinary(existingProduct.image.public_id)
        } catch (e) {
          console.warn('Failed to delete existing image during update:', e.message)
        }
      }
      cloudinaryRes = await uploadImageCloudinary(req.file)
    } else {
      // Support images array (frontend sends `images`) or legacy `image`
      const sourceImages = Array.isArray(images) && images.length > 0 ? images : (Array.isArray(image) && image.length > 0 ? image : null)

      if (sourceImages) {
        // We'll map these into the expected `image` array structure later
        // No cloudinaryRes required since frontend already uploaded
      } else if (typeof image === 'object' && image && (image.url || image.secure_url) && (image.public_id || image.publicId)) {
        // single object form
        cloudinaryRes = {
          public_id: image.public_id || image.publicId,
          secure_url: image.url || image.secure_url
        }
      } else if (typeof image === 'string' && image.startsWith('data:image')) {
        if (existingProduct.image && existingProduct.image.public_id) {
          await deleteImageFromCloudinary(existingProduct.image.public_id)
        }
        cloudinaryRes = await cloudinary.uploader.upload(image, {
          folder: 'products',
          transformation: [{ width: 800, height: 600, crop: 'limit' }]
        })
      }
    }

    // Build updateData using explicit undefined checks to avoid falsy problems
    const updateData = {
      name: name !== undefined ? name : existingProduct.name,
      brand: brand !== undefined ? brand : existingProduct.brand,
      category: category !== undefined ? category : existingProduct.category,
      description: description !== undefined ? description : existingProduct.description,
      price: price !== undefined ? price : existingProduct.price,
      countInstock: countInstock !== undefined ? countInstock : existingProduct.countInstock,
      featured: featured !== undefined ? featured : existingProduct.featured,
      isBestSeller: isBestSeller !== undefined ? isBestSeller : existingProduct.isBestSeller,
      isOnSale: isOnSale !== undefined ? isOnSale : existingProduct.isOnSale,
      isNewProduct: isNewProduct !== undefined ? isNewProduct : existingProduct.isNewProduct
    }

    // If frontend provided an `images` array (already uploaded to Cloudinary), use it
    if (Array.isArray(images) && images.length > 0) {
      updateData.image = images.map((img, idx) => ({
        public_id: img.publicId || img.public_id || img.public_id || '',
        url: img.url || img.secure_url || img,
        isMain: !!img.isMain,
        alt: img.alt || (name || existingProduct.name) || '',
        order: typeof img.order === 'number' ? img.order : idx
      }))
    } else if (Array.isArray(image) && image.length > 0) {
      // Legacy `image` array
      updateData.image = image.map((img, idx) => ({
        public_id: img.publicId || img.public_id || '',
        url: img.url || img.secure_url || img,
        isMain: !!img.isMain,
        alt: img.alt || (name || existingProduct.name) || '',
        order: typeof img.order === 'number' ? img.order : idx
      }))
    } else if (cloudinaryRes) {
      // Single upload result or single image object
      updateData.image = [
        {
          public_id: cloudinaryRes.public_id,
          url: cloudinaryRes.secure_url || cloudinaryRes.url,
          isMain: true,
          alt: name || existingProduct.name || '',
          order: 0
        }
      ]
    }

    if (name) {
      updateData.slug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
      })
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    })
  } catch (error) {
    console.error('Update Product Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    })
  }
}
const deleteProduct = async (req, res) => {
  const { id } = req.params
  const product = await Product.findById(id)
  if (!product) {
    return res.status(404).json({ message: "Not founded product!" })
  }
  if (product.image && typeof product.image === 'string') {
    const publicId = product.image.split("/").pop().split(".")[0];
    try {
      await cloudinary.uploader.destroy(`products/${publicId}`);
      console.log("deleted image from cloudinary");
    } catch (error) {
      console.log('Cannot delete image', error);
    }
  }
  await Product.findByIdAndDelete(req.params.id)
  return res.status(200).json({
    success: deleteProduct ? true : false,
    deleteProduct: deleteProduct ? deleteProduct : 'Delete product unsuccessfully.'
  })
}
const searchProduct = async (req, res) => {
  try {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sortBy = 'relevance',
      page = 1,
      limit = 24
    } = req.query;

    // Use advanced search service
    const result = await ProductSearchService.search({
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sortBy,
      page,
      limit
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Search Products Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};

/**
 * Get autocomplete suggestions for search
 */
const getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        suggestions: []
      });
    }

    const suggestions = await ProductSearchService.getSearchSuggestions(q, parseInt(limit));

    return res.status(200).json({
      success: true,
      query: q,
      suggestions
    });
  } catch (error) {
    console.error('Get Search Suggestions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting suggestions',
      error: error.message
    });
  }
};

/**
 * Get popular/trending searches
 */
const getPopularSearches = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [popular, trending] = await Promise.all([
      ProductSearchService.getPopularSearches(parseInt(limit)),
      ProductSearchService.getTrendingSearches(parseInt(limit))
    ]);

    return res.status(200).json({
      success: true,
      popular,
      trending
    });
  } catch (error) {
    console.error('Get Popular Searches Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting popular searches',
      error: error.message
    });
  }
};
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image" });
    }
    const uploadResult = await uploadImageCloudinary(req.file, "products");

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      image: uploadResult,
    });
  } catch (error) {
    console.error("Upload product image error:", error);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
}

// New endpoint for uploading multiple images without productId
const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image"
      });
    }
    // Upload all images to Cloudinary with detailed logging
    const uploadPromises = req.files.map(async (file, index) => {
      try {
        const result = await uploadImageCloudinary(file, "products");

        const imageData = {
          url: result.secure_url || result.url,
          publicId: result.public_id,
          width: result.width,
          height: result.height
        };
        return imageData;
      } catch (error) {
        console.error(`  ❌ Failed [${index + 1}]: ${error.message}`);
        throw new Error(`Upload failed for ${file.originalname}: ${error.message}`);
      }
    });

    const uploadedImages = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages
    });
  } catch (error) {
    console.error("❌ Upload product images error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
      error: error.message
    });
  }
}

const uploadMultipleProductImages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image"
      });
    }

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Upload all images to Cloudinary with error handling
    const uploadPromises = req.files.map(async (file, index) => {
      try {
        const result = await uploadImageCloudinary(file, "products");
        return result;
      } catch (error) {
        console.error(`Upload failed ${index + 1}:`, error.message);
        throw new Error(`Failed to upload ${file.originalname}: ${error.message}`);
      }
    });

    let uploadResults;
    try {
      uploadResults = await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Cloudinary batch upload failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload images to Cloudinary',
        error: error.message
      });
    }

    // Prepare image objects with proper URL extraction
    const newImages = uploadResults.map((result, index) => {
      const imageUrl = result.secure_url || result.url;
      const publicId = result.public_id;

      if (!imageUrl || !publicId) {
        console.error('Invalid Cloudinary response:', result);
        throw new Error(`Invalid Cloudinary response for image ${index + 1}`);
      }

      return {
        url: imageUrl,
        publicId: publicId,
        width: result.width,
        height: result.height
      };
    });

    // Add new images to product
    product.image.push(...newImages);
    await product.save();

    return res.status(200).json({
      success: true,
      message: `${uploadResults.length} image(s) uploaded successfully`,
      images: newImages,
      totalImages: product.image.length
    });
  } catch (error) {
    console.error("Upload multiple product images error:", error);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message
    });
  }
}

const setMainProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageIndex } = req.body;

    if (imageIndex === undefined || imageIndex < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid imageIndex is required"
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (!product.image || product.image.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product has no images"
      });
    }

    if (imageIndex >= product.image.length) {
      return res.status(400).json({
        success: false,
        message: `Image index out of range. Product has ${product.image.length} images`
      });
    }
    product.image.forEach(img => img.isMain = false);

    product.image[imageIndex].isMain = true;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Main image updated successfully",
      mainImage: product.image[imageIndex]
    });
  } catch (error) {
    console.error("Set main product image error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set main image",
      error: error.message
    });
  }
}

const deleteProductImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const imageIndex = product.image.findIndex(
      img => img._id.toString() === imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    const imageToDelete = product.image[imageIndex];

    if (imageToDelete.public_id) {
      try {
        await deleteImageFromCloudinary(imageToDelete.public_id);
      } catch (cloudinaryError) {
        console.warn("Cloudinary delete warning:", cloudinaryError);
      }
    }

    product.image.splice(imageIndex, 1);
    if (imageToDelete.isMain && product.image.length > 0) {
      product.image[0].isMain = true;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      remainingImages: product.image.length
    });
  } catch (error) {
    console.error("Delete product image error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message
    });
  }
}
const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params
    const limit = parseInt(req.query.limit) || 8
    const currentProduct = await Product.findById(id).lean()

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    const relatedProducts = await Product.find({
      _id: { $ne: id },
      $or: [
        { category: { $in: currentProduct.category }, brand: currentProduct.brand },
        { category: { $in: currentProduct.category } },
        { brand: currentProduct.brand }
      ],
      countInstock: { $gt: 0 }
    })
      .populate(populateCategoryWithParents())
      .limit(limit)
      .sort({ sold: -1, 'ratings.average': -1, createdAt: -1 })
      .select('name brand category description price image countInstock sold ratings featured')
      .lean()

    if (relatedProducts.length < limit) {
      const additionalProducts = await Product.find({
        _id: { $ne: id, $nin: relatedProducts.map(p => p._id) },
        countInstock: { $gt: 0 }
      })
        .populate(populateCategoryWithParents())
        .limit(limit - relatedProducts.length)
        .sort({ sold: -1, 'ratings.average': -1 })
        .select('name brand category description price image countInstock sold ratings featured')
        .lean()

      relatedProducts.push(...additionalProducts)
    }

    return res.status(200).json({
      success: true,
      total: relatedProducts.length,
      currentProduct: {
        id: currentProduct._id,
        name: currentProduct.name,
        category: currentProduct.category,
        brand: currentProduct.brand
      },
      products: relatedProducts
    })
  } catch (error) {
    console.error('Get Related Products Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error getting related products',
      error: error.message
    })
  }
}
const getProductWithReviews = async (req, res) => {
  try {
    const { id } = req.params;

    // Get product
    const product = await Product.findById(id)
      .populate(populateCategoryWithParents())
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get review statistics
    const reviewStats = await Review.getProductStats(id);

    // Get featured reviews
    const featuredReviews = await Review.getFeaturedReviews(id, 3);

    // Count questions and feedbacks
    const questionCount = await Review.countDocuments({
      product: id,
      reviewType: 'question',
      status: 'published'
    });

    const feedbackCount = await Review.countDocuments({
      product: id,
      reviewType: 'feedback',
      status: 'published'
    });

    return res.status(200).json({
      success: true,
      productData: {
        ...product,
        reviewSummary: {
          ...reviewStats,
          questionCount,
          feedbackCount,
          featuredReviews
        }
      }
    });
  } catch (error) {
    console.error('Get Product With Reviews Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting product',
      error: error.message
    });
  }
};

const getProductsWithReviewData = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      sort = '-createdAt'
    } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) {
      filter['ratings.average'] = { $gte: Number(minRating) };
    }

    // Get products
    const products = await Product.find(filter)
      .populate(populateCategoryWithParents())
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments(filter);

    // Add review count for each product
    const productsWithReviews = await Promise.all(
      products.map(async (product) => {
        const reviewCount = await Review.countDocuments({
          product: product._id,
          reviewType: 'rating',
          status: 'published'
        });

        return {
          ...product,
          reviewCount
        };
      })
    );

    return res.status(200).json({
      success: true,
      products: productsWithReviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get Products With Review Data Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    // Support both :categorySlug and wildcard /* routes
    const categorySlug = req.params.categorySlug || req.params[0];

    const {
      brand,
      priceMin,
      priceMax,
      rating,
      inStock,
      onSale,
      discount,
      sort = 'featured',
      page = 1,
      limit = 24
    } = req.query;

    const Category = require('../models/category.models');

    // Handle multi-level paths: makeup/face-makeup/foundation
    const slugParts = categorySlug.split('/');
    let category = null;

    if (slugParts.length === 1) {
      // Single level: just find by slug
      category = await Category.findOne({ slug: slugParts[0] })
        .populate('parent')
        .lean();
    } else {
      // Multi-level: validate the path
      // Start from the first (root) category
      let currentCategory = await Category.findOne({
        slug: slugParts[0],
        parent: null  // Ensure it's a root category
      }).lean();

      if (!currentCategory) {
        return res.status(404).json({
          success: false,
          message: `Root category "${slugParts[0]}" not found`
        });
      }

      // Traverse down the hierarchy
      for (let i = 1; i < slugParts.length; i++) {
        const childCategory = await Category.findOne({
          slug: slugParts[i],
          parent: currentCategory._id
        }).lean();

        if (!childCategory) {
          return res.status(404).json({
            success: false,
            message: `Category "${slugParts[i]}" not found under "${currentCategory.name}"`
          });
        }

        currentCategory = childCategory;
      }

      category = currentCategory;

      // Populate parent for breadcrumb
      if (category.parent) {
        category.parent = await Category.findById(category.parent).lean();
      }
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Collect all category IDs (current + all descendants)
    const categoryIds = [category._id];

    const collectChildIds = async (parentId) => {
      const children = await Category.find({ parent: parentId });
      for (const child of children) {
        categoryIds.push(child._id);
        await collectChildIds(child._id);
      }
    };

    await collectChildIds(category._id);

    // Build query
    const query = { category: { $in: categoryIds } };

    // Apply filters
    if (brand) {
      const brands = brand.split(',').map(b => b.trim());
      query.brand = { $in: brands };
    }

    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    if (rating) {
      query['ratings.average'] = { $gte: Number(rating) };
    }

    if (inStock === 'true') {
      query.countInstock = { $gt: 0 };
    }

    if (onSale === 'true') {
      query.salePrice = { $exists: true, $ne: null };
    }

    if (discount) {
      // Calculate products with discount >= specified percentage
      query.$expr = {
        $gte: [
          {
            $multiply: [
              {
                $divide: [
                  { $subtract: ['$price', { $ifNull: ['$salePrice', '$price'] }] },
                  '$price'
                ]
              },
              100
            ]
          },
          Number(discount)
        ]
      };
    }

    // Sorting options
    const sortOptions = {
      'featured': { isFeatured: -1, createdAt: -1 },
      'best-selling': { soldCount: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'newest': { createdAt: -1 },
      'rating-desc': { rating: -1 },
      'name-asc': { name: 1 }
    };

    const sortBy = sortOptions[sort] || sortOptions['featured'];

    // Execute query
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortBy)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate(populateCategoryWithParents())
      .populate('brand')
      .lean();

    // Build breadcrumb
    const breadcrumb = [];
    let currentCategory = category;
    while (currentCategory) {
      breadcrumb.unshift({
        _id: currentCategory._id,
        name: currentCategory.name,
        slug: currentCategory.slug
      });
      if (currentCategory.parent && currentCategory.parent._id) {
        currentCategory = await Category.findById(currentCategory.parent._id).populate('parent');
      } else {
        currentCategory = null;
      }
    }

    // Get children categories for navigation
    const children = await Category.find({
      parent: category._id,
      isActive: true
    })
      .select('name slug level displayOrder')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      products,
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        level: category.level,
        seoTitle: category.seoTitle,
        seoDescription: category.seoDescription,
        seoKeywords: category.seoKeywords,
        breadcrumb,
        children: children || []
      },
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      },
      appliedFilters: {
        brand: brand ? brand.split(',') : [],
        priceMin: priceMin ? Number(priceMin) : null,
        priceMax: priceMax ? Number(priceMax) : null,
        rating: rating ? Number(rating) : null,
        inStock: inStock === 'true',
        onSale: onSale === 'true',
        discount: discount ? Number(discount) : null,
        sort
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const getCategoryFilters = async (req, res) => {
  try {
    // Support both :categorySlug and wildcard /* routes
    const categorySlug = req.params.categorySlug || req.params[0];

    const Category = require('../models/category.models');

    // Handle multi-level paths same as getProductsByCategory
    const slugParts = categorySlug.split('/');
    let category = null;

    if (slugParts.length === 1) {
      category = await Category.findOne({ slug: slugParts[0] }).lean();
    } else {
      // Multi-level: validate the path
      let currentCategory = await Category.findOne({
        slug: slugParts[0],
        parent: null
      }).lean();

      if (!currentCategory) {
        return res.status(404).json({
          success: false,
          message: `Root category "${slugParts[0]}" not found`
        });
      }

      for (let i = 1; i < slugParts.length; i++) {
        const childCategory = await Category.findOne({
          slug: slugParts[i],
          parent: currentCategory._id
        }).lean();

        if (!childCategory) {
          return res.status(404).json({
            success: false,
            message: `Category "${slugParts[i]}" not found under "${currentCategory.name}"`
          });
        }

        currentCategory = childCategory;
      }

      category = currentCategory;
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    const categoryIds = [category._id];

    const collectChildIds = async (parentId) => {
      const children = await Category.find({ parent: parentId });
      for (const child of children) {
        categoryIds.push(child._id);
        await collectChildIds(child._id);
      }
    };

    await collectChildIds(category._id);

    // Get all products in this category and descendants
    const products = await Product.find({
      category: { $in: categoryIds }
    }).populate('brand');

    // Extract unique brands
    const brandsSet = new Set();
    products.forEach(product => {
      if (product.brand && product.brand.name) {
        brandsSet.add(JSON.stringify({
          _id: product.brand._id,
          name: product.brand.name
        }));
      }
    });
    const brands = Array.from(brandsSet).map(b => JSON.parse(b));

    // Calculate price range
    const prices = products.map(p => p.price).filter(p => p > 0);
    const priceRange = {
      min: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
      max: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0
    };

    // Check availability of special filters
    const hasInStock = products.some(p => p.countInstock > 0);
    const hasOnSale = products.some(p => p.salePrice && p.salePrice > 0);

    // Rating distribution
    const ratingDistribution = {
      5: products.filter(p => p.rating >= 4.5).length,
      4: products.filter(p => p.rating >= 4 && p.rating < 4.5).length,
      3: products.filter(p => p.rating >= 3 && p.rating < 4).length,
      2: products.filter(p => p.rating >= 2 && p.rating < 3).length,
      1: products.filter(p => p.rating >= 1 && p.rating < 2).length
    };

    res.status(200).json({
      success: true,
      filters: {
        brands: brands.sort((a, b) => a.name.localeCompare(b.name)),
        priceRange,
        ratings: [
          { value: 4, label: '4★ & up', count: ratingDistribution[5] + ratingDistribution[4] },
          { value: 3, label: '3★ & up', count: ratingDistribution[5] + ratingDistribution[4] + ratingDistribution[3] },
          { value: 2, label: '2★ & up', count: products.filter(p => p.rating >= 2).length },
          { value: 1, label: '1★ & up', count: products.filter(p => p.rating >= 1).length }
        ],
        availability: {
          inStock: hasInStock,
          onSale: hasOnSale
        },
        discounts: [
          { value: 10, label: '10% off or more' },
          { value: 20, label: '20% off or more' },
          { value: 30, label: '30% off or more' },
          { value: 50, label: '50% off or more' }
        ]
      },
      totalProducts: products.length
    });
  } catch (error) {
    console.error('Get category filters error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle product availability
const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    product.isAvailable = !product.isAvailable;
    await product.save();
    return res.status(200).json({
      success: true,
      message: `Product availability toggled to ${product.isAvailable}`,
      isAvailable: product.isAvailable,
      productId: product._id
    });
  } catch (error) {
    console.error('Toggle Availability Error:', error);
    return res.status(500).json({ success: false, message: 'Error toggling availability', error: error.message });
  }
};

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  getNewProduct,
  getBestSeller,
  getTrendingProducts,
  updateProduct,
  deleteProduct,
  searchProduct,
  getSearchSuggestions,
  getPopularSearches,
  uploadProductImage,
  uploadProductImages,
  uploadMultipleProductImages,
  setMainProductImage,
  deleteProductImage,
  getRelatedProducts,
  getProductWithReviews,
  getProductsWithReviewData,
  getProductsByCategory,
  getCategoryFilters,
  toggleAvailability
}
