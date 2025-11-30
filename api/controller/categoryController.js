const Category = require('../models/category.models')
const Product = require('../models/product.models')
const slugify = require('slugify')

const createCategory = async (req, res) => {
	try {
		const {
			name,
			parent = null,
			displayOrder = 0,
			icon,
			image,
			isActive = true,
			showInMenu = true,
			description,
			seoTitle,
			seoDescription,
			seoKeywords,
			featuredProduct
		} = req.body

		if (!name) {
			return res.status(400).json({ success: false, message: 'Name is required' })
		}

		const slug = slugify(name, { lower: true, strict: true })
		const existing = await Category.findOne({ slug })
		if (existing) {
			return res.status(409).json({ success: false, message: 'Category with same slug already exists' })
		}

		const categoryData = {
			name,
			slug,
			parent,
			displayOrder,
			icon,
			image,
			isActive,
			showInMenu,
			description,
			seoTitle,
			seoDescription,
			seoKeywords
		}

		if (featuredProduct) {
			categoryData.featuredProduct = {
				title: featuredProduct.title || null,
				subtitle: featuredProduct.subtitle || null,
				image: featuredProduct.image || null,
				link: featuredProduct.link || null
			}
		}

		const category = await Category.create(categoryData)
		return res.status(201).json({ success: true, message: 'Category created successfully', data: category })
	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).json({ success: false, message: 'Category name already exists' })
		}
		return res.status(500).json({ success: false, message: error.message })
	}
}

const getCategories = async (req, res) => {
	try {
		const { active, inMenu, level, search } = req.query
		const filter = {}

		if (active !== undefined) filter.isActive = active === 'true'
		if (inMenu !== undefined) filter.showInMenu = inMenu === 'true'
		if (level !== undefined) filter.level = parseInt(level)

		if (search) {
			const regex = new RegExp(search, 'i')
			filter.$or = [
				{ name: regex },
				{ slug: regex },
				{ description: regex },
				{ seoTitle: regex }
			]
		}

		const data = await Category.find(filter).sort('displayOrder').select('-__v').lean()
		return res.status(200).json({ success: true, count: data.length, data })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

const getCategoryBySlug = async (req, res) => {
	try {
		const { slug } = req.params
		const category = await Category.findOne({ slug, isActive: true }).select('-__v').lean()

		if (!category) return res.status(404).json({ success: false, message: 'Category not found' })

		const children = await Category.find({ parent: category._id, isActive: true })
			.sort('displayOrder')
			.select('name slug icon productCount')
			.lean()

		category.children = children

		return res.status(200).json({ success: true, data: category })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

const getCategoryTree = async (req, res) => {
	try {
		const tree = await Category.getCategoryTree()
		return res.status(200).json({ success: true, data: tree })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

const getRootCategories = async (req, res) => {
	try {
		const { depth = 2 } = req.query
		const maxDepth = parseInt(depth)

		const roots = await Category.find({ parent: null, isActive: true, showInMenu: true })
			.sort('displayOrder')
			.select('-__v')
			.lean()

		const populateChildren = async (categoryId, currentDepth = 0, parentPath = '') => {
			if (currentDepth >= maxDepth) return []

			const children = await Category.find({ parent: categoryId, isActive: true })
				.sort('displayOrder')
				.select('-__v')
				.lean()

			for (const child of children) {
				// Build full path for routing
				child.fullPath = parentPath ? `${parentPath}/${child.slug}` : child.slug
				child.children = await populateChildren(child._id, currentDepth + 1, child.fullPath)
			}

			return children
		}

		for (const root of roots) {
			root.fullPath = root.slug
			root.children = await populateChildren(root._id, 0, root.slug)
		} return res.status(200).json({ success: true, data: roots })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

const getCategoryWithBreadcrumb = async (req, res) => {
	try {
		const { slug } = req.params
		const category = await Category.findOne({ slug, isActive: true })

		if (!category) return res.status(404).json({ success: false, message: 'Category not found' })

		const breadcrumb = await category.getBreadcrumb()
		const children = await Category.find({ parent: category._id, isActive: true })
			.sort('displayOrder')
			.select('name slug icon productCount')
			.lean()

		return res.status(200).json({
			success: true,
			category: category.toObject(),
			breadcrumb,
			children
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

const searchCategories = async (req, res) => {
	try {
		const { q } = req.query
		if (!q || q.trim().length < 2) {
			return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' })
		}

		const results = await Category.searchCategories(q)
		return res.status(200).json({ success: true, count: results.length, data: results })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

const updateCategory = async (req, res) => {
	try {
		const {
			id,
			name,
			isActive,
			showInMenu,
			displayOrder,
			icon,
			image,
			description,
			seoTitle,
			seoDescription,
			seoKeywords,
			featuredProduct
		} = req.body

		if (!id) return res.status(400).json({ success: false, message: 'id is required' })

		const update = {}

		if (name) {
			update.name = name
			update.slug = slugify(name, { lower: true, strict: true })
		}
		if (isActive !== undefined) update.isActive = isActive
		if (showInMenu !== undefined) update.showInMenu = showInMenu
		if (displayOrder !== undefined) update.displayOrder = displayOrder
		if (icon !== undefined) update.icon = icon
		if (image !== undefined) update.image = image
		if (description !== undefined) update.description = description
		if (seoTitle !== undefined) update.seoTitle = seoTitle
		if (seoDescription !== undefined) update.seoDescription = seoDescription
		if (seoKeywords !== undefined) update.seoKeywords = seoKeywords

		if (featuredProduct !== undefined) {
			update.featuredProduct = {
				title: featuredProduct.title || null,
				subtitle: featuredProduct.subtitle || null,
				image: featuredProduct.image || null,
				link: featuredProduct.link || null
			}
		}

		const updated = await Category.findByIdAndUpdate(id, update, { new: true, runValidators: true })
		if (!updated) return res.status(404).json({ success: false, message: 'Category not found' })

		return res.status(200).json({ success: true, message: 'Category updated successfully', data: updated })
	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).json({ success: false, message: 'Category name already exists' })
		}
		return res.status(500).json({ success: false, message: error.message })
	}
}

const updateCategoryHierarchy = async (req, res) => {
	try {
		const { id, parentId, displayOrder } = req.body
		if (!id) return res.status(400).json({ success: false, message: 'id is required' })

		const category = await Category.findById(id)
		if (!category) return res.status(404).json({ success: false, message: 'Category not found' })

		if (parentId) {
			const parent = await Category.findById(parentId)
			if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' })

			const descendants = await category.getDescendants()
			if (descendants.some(d => String(d._id) === String(parentId))) {
				return res.status(400).json({ success: false, message: 'Cannot set descendant as parent' })
			}
		}

		category.parent = parentId || null
		if (displayOrder !== undefined) category.displayOrder = displayOrder

		await category.save()
		return res.status(200).json({ success: true, message: 'Hierarchy updated', data: category })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

const updateProductCount = async (req, res) => {
	try {
		const { id } = req.params
		const count = await Category.updateProductCount(id)
		return res.status(200).json({ success: true, message: 'Product count updated', productCount: count })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

const bulkUpdateProductCounts = async (req, res) => {
	try {
		const categories = await Category.find({})
		for (const category of categories) {
			await Category.updateProductCount(category._id)
		}
		return res.status(200).json({ success: true, message: 'All product counts updated' })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

const deleteCategory = async (req, res) => {
	try {
		const { id } = req.params || req.body
		if (!id) return res.status(400).json({ success: false, message: 'id is required' })

		const category = await Category.findById(id)
		if (!category) return res.status(404).json({ success: false, message: 'Category not found' })

		if (await category.hasChildren()) {
			return res.status(400).json({ success: false, message: 'Delete child categories first' })
		}

		const productCount = await Product.countDocuments({ category: { $in: [id] } })
		if (productCount > 0) {
			return res.status(400).json({ success: false, message: `Category has ${productCount} products` })
		}

		await Category.findByIdAndDelete(id)
		return res.status(200).json({ success: true, message: 'Category deleted successfully' })
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

const forceDeleteCategory = async (req, res) => {
	try {
		const { id } = req.params
		if (!id) return res.status(400).json({ success: false, message: 'id is required' })

		const category = await Category.findById(id)
		if (!category) return res.status(404).json({ success: false, message: 'Category not found' })

		const descendants = await category.getDescendants()
		const allIds = [category._id, ...descendants.map(d => d._id)]

		await Category.deleteMany({ _id: { $in: allIds } })
		await Product.updateMany({ category: { $in: allIds } }, { $pull: { category: { $in: allIds } } })

		return res.status(200).json({
			success: true,
			message: `Deleted ${allIds.length} categories and updated related products`
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

// Get category with full hierarchy (parent chain + children + siblings)
const getCategoryHierarchy = async (req, res) => {
	try {
		const { slug } = req.params

		const category = await Category.findOne({ slug, isActive: true })
			.populate('parent', 'name slug level')
			.lean()

		if (!category) {
			return res.status(404).json({ success: false, message: 'Category not found' })
		}

		// Build parent chain (breadcrumb)
		const parentChain = []
		let current = category

		while (current.parent) {
			const parent = await Category.findById(current.parent._id || current.parent)
				.select('name slug level parent')
				.lean()

			if (parent) {
				parentChain.unshift(parent)
				current = parent
			} else {
				break
			}
		}

		// Get root category
		const rootCategory = parentChain.length > 0 ? parentChain[0] : category

		// Get siblings (categories at same level with same parent)
		const siblings = await Category.find({
			level: category.level,
			parent: category.parent,
			isActive: true,
			_id: { $ne: category._id }
		})
			.select('name slug level displayOrder')
			.sort({ displayOrder: 1, name: 1 })
			.lean()

		// Get children (next level down)
		const children = await Category.find({
			parent: category._id,
			isActive: true
		})
			.select('name slug level displayOrder icon')
			.sort({ displayOrder: 1, name: 1 })
			.lean()

		// Get product count for this category and all descendants
		const allDescendantIds = await getAllDescendantIds(category._id)
		const productCount = await Product.countDocuments({
			$or: [
				{ category: { $in: [category._id, ...allDescendantIds] } },
				{ category: { $in: [category._id.toString(), ...allDescendantIds.map(id => id.toString())] } }
			],
			isActive: true
		})

		return res.status(200).json({
			success: true,
			data: {
				current: {
					_id: category._id,
					name: category.name,
					slug: category.slug,
					level: category.level,
					description: category.description,
					icon: category.icon,
					seoTitle: category.seoTitle,
					seoDescription: category.seoDescription
				},
				breadcrumb: [
					...parentChain.map(p => ({ _id: p._id, name: p.name, slug: p.slug, level: p.level })),
					{ _id: category._id, name: category.name, slug: category.slug, level: category.level }
				],
				root: {
					_id: rootCategory._id,
					name: rootCategory.name,
					slug: rootCategory.slug,
					level: rootCategory.level
				},
				parent: category.parent ? {
					_id: category.parent._id || category.parent,
					name: category.parent.name,
					slug: category.parent.slug,
					level: category.parent.level
				} : null,
				siblings: siblings,
				children: children.filter(child => !child.name.startsWith('All ')),
				productCount
			}
		})
	} catch (error) {
		console.error('Error in getCategoryHierarchy:', error)
		return res.status(500).json({ success: false, message: error.message })
	}
}

// Helper function to get all descendant category IDs
async function getAllDescendantIds(categoryId) {
	const descendants = []
	const queue = [categoryId]

	while (queue.length > 0) {
		const currentId = queue.shift()
		const children = await Category.find({ parent: currentId }).select('_id').lean()

		for (const child of children) {
			descendants.push(child._id)
			queue.push(child._id)
		}
	}

	return descendants
}

module.exports = {
	createCategory,
	getCategories,
	getCategoryBySlug,
	getCategoryTree,
	getRootCategories,
	getRootCategories,
	getCategoryWithBreadcrumb,
	getCategoryHierarchy,
	searchCategories,
	updateCategory,
	updateCategoryHierarchy,
	updateProductCount,
	bulkUpdateProductCounts,
	deleteCategory,
	forceDeleteCategory
}
