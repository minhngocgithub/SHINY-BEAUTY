const Category = require('../models/category.models')
const slugify = require('slugify')

const generateSeoFields = (name, description, parent) => {
	const seoTitle = `${name} - ${parent ? parent.name : 'Shop'} | Shiny Beauty`
	const seoDescription = description || `Explore our collection of ${name.toLowerCase()} products. Premium quality, great prices.`
	const seoKeywords = [
		name.toLowerCase(),
		parent ? parent.name.toLowerCase() : '',
		'beauty',
		'cosmetics',
		'makeup',
		'skincare'
	].filter(Boolean).join(', ')
	return { seoTitle, seoDescription, seoKeywords }
}

const addSubCategory = async (req, res) => {
	try {
		const {
			name,
			category,
			description,
			displayOrder,
			isActive = true,
			showInMenu = true,
			seoTitle,
			seoDescription,
			seoKeywords,
			featuredProduct
		} = req.body

		if (!name || !category) {
			return res.status(400).json({ success: false, message: 'Provide name and category (parentId)' })
		}

		const parent = await Category.findById(category)
		if (!parent) {
			return res.status(404).json({ success: false, message: 'Parent category not found' })
		}

		const slug = slugify(name, { lower: true, strict: true })
		const exists = await Category.findOne({ slug })
		if (exists) {
			return res.status(409).json({ success: false, message: `SubCategory with slug '${slug}' already exists` })
		}

		const duplicateName = await Category.findOne({ name })
		if (duplicateName) {
			return res.status(409).json({ success: false, message: `Category name '${name}' already exists. Names must be unique.` })
		}

		const seo = generateSeoFields(name, description, parent)
		const subCategoryData = {
			name,
			slug,
			parent: category,
			level: (parent.level || 0) + 1,
			description,
			displayOrder,
			isActive,
			showInMenu,
			seoTitle: seoTitle || seo.seoTitle,
			seoDescription: seoDescription || seo.seoDescription,
			seoKeywords: seoKeywords || seo.seoKeywords
		}

		if (featuredProduct && featuredProduct.title) {
			subCategoryData.featuredProduct = {
				title: featuredProduct.title,
				subtitle: featuredProduct.subtitle || '',
				image: featuredProduct.image || '',
				link: featuredProduct.link || `/category/${slug}`
			}
		}

		const sub = await Category.create(subCategoryData)
		await Category.findByIdAndUpdate(category, { $addToSet: { children: sub._id } })

		return res.status(201).json({ success: true, message: 'Sub Category Created', data: sub })
	} catch (error) {
		console.error('Error creating subcategory:', error)
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const getSubCategory = async (req, res) => {
	try {
		const { categoryId } = req.query
		const filter = categoryId ? { parent: categoryId } : { level: { $gte: 1 } }
		const data = await Category.find(filter).populate('parent', 'name slug level').sort('displayOrder').lean()
		return res.status(200).json({ success: true, message: 'SubCategory data', count: data.length, data })
	} catch (error) {
		console.error('Error fetching subcategories:', error)
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const updateSubCategory = async (req, res) => {
	try {
		const {
			id,
			name,
			category,
			description,
			displayOrder,
			isActive,
			showInMenu,
			seoTitle,
			seoDescription,
			seoKeywords,
			featuredProduct
		} = req.body

		const sub = await Category.findById(id)
		if (!sub) return res.status(404).json({ success: false, message: 'Subcategory not found' })
		if (sub.level === 0) return res.status(400).json({ success: false, message: 'This is a root category, not a subcategory. Use /category endpoint instead.' })

		const update = {}

		if (name && name !== sub.name) {
			const duplicateName = await Category.findOne({ name, _id: { $ne: id } })
			if (duplicateName) {
				return res.status(409).json({ success: false, message: `Category name '${name}' already exists. Names must be unique.` })
			}

			update.name = name
			const newSlug = slugify(name, { lower: true, strict: true })
			const slugExists = await Category.findOne({ slug: newSlug, _id: { $ne: id } })
			if (slugExists) {
				return res.status(409).json({ success: false, message: `Slug '${newSlug}' already exists` })
			}
			update.slug = newSlug
		}

		if (category && category !== sub.parent?.toString()) {
			const newParent = await Category.findById(category)
			if (!newParent) {
				return res.status(404).json({ success: false, message: 'New parent category not found' })
			}

			if (sub.parent) await Category.findByIdAndUpdate(sub.parent, { $pull: { children: id } })
			await Category.findByIdAndUpdate(category, { $addToSet: { children: id } })
			update.parent = category
			update.level = (newParent.level || 0) + 1
		}

		if (description !== undefined) update.description = description
		if (displayOrder !== undefined) update.displayOrder = displayOrder
		if (isActive !== undefined) update.isActive = isActive
		if (showInMenu !== undefined) update.showInMenu = showInMenu
		if (seoTitle !== undefined) update.seoTitle = seoTitle
		if (seoDescription !== undefined) update.seoDescription = seoDescription
		if (seoKeywords !== undefined) update.seoKeywords = seoKeywords

		if (featuredProduct !== undefined) {
			if (featuredProduct === null) update.featuredProduct = undefined
			else if (featuredProduct.title) {
				update.featuredProduct = {
					title: featuredProduct.title,
					subtitle: featuredProduct.subtitle || '',
					image: featuredProduct.image || '',
					link: featuredProduct.link || `/category/${update.slug || sub.slug}`
				}
			}
		}

		const updated = await Category.findByIdAndUpdate(id, update, { new: true, runValidators: true }).populate('parent', 'name slug level')
		return res.status(200).json({ success: true, message: 'Updated Successfully', data: updated })
	} catch (error) {
		console.error('Error updating subcategory:', error)
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const deleteSubCategory = async (req, res) => {
	try {
		const { id, force = false } = req.body
		const sub = await Category.findById(id)
		if (!sub) return res.status(404).json({ success: false, message: 'Subcategory not found' })
		if (sub.level === 0) return res.status(400).json({ success: false, message: 'This is a root category, not a subcategory. Use /category endpoint instead.' })

		const hasChildren = await Category.countDocuments({ parent: id })
		if (hasChildren > 0 && !force) {
			return res.status(400).json({ success: false, message: `Cannot delete subcategory with ${hasChildren} children. Use force=true to cascade delete.` })
		}

		const Product = require('../models/product.models')
		const productsCount = await Product.countDocuments({ category: id })
		if (productsCount > 0) {
			return res.status(400).json({ success: false, message: `Cannot delete subcategory with ${productsCount} products. Please reassign products first.` })
		}

		if (force && hasChildren > 0) {
			const descendants = await sub.getDescendants()
			const descendantIds = descendants.map(d => d._id)
			const descendantProductsCount = await Product.countDocuments({ category: { $in: descendantIds } })
			if (descendantProductsCount > 0) {
				return res.status(400).json({ success: false, message: `Cannot cascade delete: ${descendantProductsCount} products found in child categories. Please reassign products first.` })
			}
			await Category.deleteMany({ _id: { $in: descendantIds } })
			await Category.updateMany({ children: { $in: descendantIds } }, { $pull: { children: { $in: descendantIds } } })
		}

		if (sub.parent) await Category.findByIdAndUpdate(sub.parent, { $pull: { children: id } })
		await Category.deleteOne({ _id: id })

		return res.status(200).json({
			success: true,
			message: force && hasChildren > 0
				? 'Subcategory and children deleted successfully'
				: 'Subcategory deleted successfully'
		})
	} catch (error) {
		console.error('Error deleting subcategory:', error)
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const searchSubCategories = async (req, res) => {
	try {
		const { q } = req.query
		if (!q || q.trim().length < 2) {
			return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' })
		}
		const searchRegex = new RegExp(q, 'i')
		const results = await Category.find({
			level: { $gte: 1 },
			$or: [
				{ name: searchRegex },
				{ slug: searchRegex },
				{ description: searchRegex },
				{ seoTitle: searchRegex },
				{ seoDescription: searchRegex }
			]
		}).populate('parent', 'name slug level').sort('-productCount').limit(20).lean()

		return res.status(200).json({ success: true, message: 'Search results', count: results.length, query: q, data: results })
	} catch (error) {
		console.error('Error searching subcategories:', error)
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const getSubCategoriesByLevel = async (req, res) => {
	try {
		const { level } = req.params
		if (level === '0') {
			return res.status(400).json({ success: false, message: 'Use /category endpoint for root categories' })
		}
		const data = await Category.find({ level: parseInt(level) }).populate('parent', 'name slug level').sort('displayOrder').lean()
		return res.status(200).json({ success: true, message: `Level ${level} subcategories`, count: data.length, data })
	} catch (error) {
		console.error('Error fetching subcategories by level:', error)
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

const updateSubCategoryProductCount = async (req, res) => {
	try {
		const { id } = req.params
		const sub = await Category.findById(id)
		if (!sub) return res.status(404).json({ success: false, message: 'Subcategory not found' })
		if (sub.level === 0) return res.status(400).json({ success: false, message: 'This is a root category. Use /category endpoint.' })

		const Product = require('../models/product.models')
		const count = await Product.countDocuments({ category: id })
		sub.productCount = count
		await sub.save()
		return res.status(200).json({ success: true, message: 'Product count updated', data: { categoryId: id, name: sub.name, productCount: count } })
	} catch (error) {
		console.error('Error updating product count:', error)
		return res.status(500).json({ success: false, message: error.message || error })
	}
}

module.exports = {
	addSubCategory,
	getSubCategory,
	updateSubCategory,
	deleteSubCategory,
	searchSubCategories,
	getSubCategoriesByLevel,
	updateSubCategoryProductCount
}
