const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema({
	name: {
		type: String,
		required: [true, 'Category name is required'],
		trim: true,
		unique: true,
		index: true
	},
	slug: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		index: true
	},
	description: {
		type: String,
		default: ''
	},
	parent: {
		type: mongoose.Schema.ObjectId,
		ref: 'Category',
		default: null,
		index: true
	},
	level: {
		type: Number,
		default: 0,
		min: 0
	},
	path: {
		type: String,
		index: true,
		default: ''
	},
	displayOrder: {
		type: Number,
		default: 0
	},
	isActive: {
		type: Boolean,
		default: true,
		index: true
	},
	showInMenu: {
		type: Boolean,
		default: true
	},
	icon: {
		type: String,
		default: null
	},
	image: {
		public_id: String,
		url: String
	},
	featuredProduct: {
		title: {
			type: String,
			default: null
		},
		subtitle: {
			type: String,
			default: null
		},
		image: {
			type: String,
			default: null
		},
		link: {
			type: String,
			default: null
		}
	},
	seoTitle: {
		type: String,
		default: ''
	},
	seoDescription: {
		type: String,
		default: ''
	},
	seoKeywords: {
		type: String,
		default: ''
	},
	productCount: {
		type: Number,
		default: 0
	}
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
})

categorySchema.virtual('children', {
	ref: 'Category',
	localField: '_id',
	foreignField: 'parent'
})

categorySchema.index({ parent: 1, displayOrder: 1 })
categorySchema.index({ slug: 1 }, { unique: true })
categorySchema.index({ path: 1 })
categorySchema.index({ level: 1 })
categorySchema.index({ isActive: 1, showInMenu: 1 })

categorySchema.pre('save', async function (next) {
	try {
		if (this.isModified('name') && !this.slug) {
			const slugify = require('slugify')
			this.slug = slugify(this.name, {
				lower: true,
				strict: true,
				remove: /[*+~.()'"!:@]/g
			})
		}
		if (this.isModified('parent') || this.isNew) {
			if (this.parent) {
				const parent = await this.constructor.findById(this.parent)
				if (parent) {
					this.level = (typeof parent.level === 'number' ? parent.level : 0) + 1
					this.path = parent.path ? `${parent.path}/${this._id}` : `${parent._id}/${this._id}`
				}
			} else {
				this.level = 0
				this.path = this._id ? this._id.toString() : this.path
			}
		}
		if (!this.seoTitle && this.name) {
			this.seoTitle = this.name
		}
		if (!this.seoDescription && this.description) {
			this.seoDescription = this.description.substring(0, 160)
		}
		next()
	} catch (err) {
		next(err)
	}
})

categorySchema.methods.getAncestors = async function () {
	if (!this.parent) return []
	const ancestors = []
	let current = await this.constructor.findById(this.parent)
	while (current) {
		ancestors.unshift(current)
		current = current.parent ? await this.constructor.findById(current.parent) : null
	}
	return ancestors
}

categorySchema.methods.getDescendants = async function () {
	if (!this.path) return []
	const regex = new RegExp(`^${this.path}/`)
	return await this.constructor.find({ path: regex })
}

categorySchema.methods.hasChildren = async function () {
	const count = await this.constructor.countDocuments({ parent: this._id })
	return count > 0
}

categorySchema.methods.getBreadcrumb = async function () {
	const ancestors = await this.getAncestors()
	return [...ancestors, this].map(cat => ({
		_id: cat._id,
		name: cat.name,
		slug: cat.slug
	}))
}

categorySchema.statics.getRootCategories = function () {
	return this.find({
		parent: null,
		isActive: true,
		showInMenu: true
	}).sort('displayOrder')
}

categorySchema.statics.getCategoryTree = async function () {
	const categories = await this.find({ isActive: true }).sort('displayOrder').lean()
	const buildTree = (parentId = null) => {
		return categories
			.filter(cat => String(cat.parent || null) === String(parentId))
			.map(cat => ({
				...cat,
				children: buildTree(cat._id)
			}))
	}
	return buildTree(null)
}

categorySchema.statics.getRootCategoriesWithChildren = async function (maxDepth = 2) {
	const rootCategories = await this.find({
		parent: null,
		isActive: true,
		showInMenu: true
	}).sort('displayOrder').lean()
	const populateChildren = async (categories, currentDepth = 0) => {
		if (currentDepth >= maxDepth) return categories
		for (let cat of categories) {
			cat.children = await this.find({
				parent: cat._id,
				isActive: true
			}).sort('displayOrder').lean()
			if (cat.children.length > 0 && currentDepth + 1 < maxDepth) {
				await populateChildren(cat.children, currentDepth + 1)
			}
		}
		return categories
	}
	return await populateChildren(rootCategories)
}

categorySchema.statics.searchCategories = function (query) {
	const regex = new RegExp(query, 'i')
	return this.find({
		$or: [
			{ name: regex },
			{ slug: regex },
			{ description: regex }
		],
		isActive: true
	}).sort('displayOrder').limit(20)
}

categorySchema.statics.updateProductCount = async function (categoryId) {
	const category = await this.findById(categoryId)
	if (!category) return
	const Product = mongoose.model('Product')
	const count = await Product.countDocuments({
		category: categoryId,
		isActive: true
	})
	category.productCount = count
	await category.save()
	return count
}

categorySchema.post('findOneAndDelete', async function (doc) {
	if (doc && doc._id) {
		const descendants = await doc.getDescendants()
		if (descendants.length > 0) {
			await mongoose.model('Category').deleteMany({
				_id: { $in: descendants.map(d => d._id) }
			})
		}
		const Product = mongoose.model('Product')
		await Product.updateMany(
			{ category: doc._id },
			{ $pull: { category: doc._id } }
		)
	}
})

module.exports = mongoose.model('Category', categorySchema)
