import { defineStore } from 'pinia'
import {
  getCategoryTreeApi,
  getRootCategoriesWithChildrenApi,
  getCategoryHierarchyApi
} from '../service/category.service'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    // Category tree (full hierarchy)
    categoryTree: [],

    // Root categories with immediate children
    rootCategories: [],

    // Current category hierarchy context
    currentCategory: null,
    breadcrumb: [],
    siblings: [],
    children: [],

    // Cache for category hierarchies by slug
    hierarchyCache: {},

    // Loading states
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * Get all root categories (level 0)
     */
    getRootCategories: (state) => {
      return state.rootCategories
    },

    /**
     * Find category by slug in tree
     */
    getCategoryBySlug: (state) => (slug) => {
      const findInTree = (categories, targetSlug) => {
        for (const cat of categories) {
          if (cat.slug === targetSlug) return cat
          if (cat.children?.length > 0) {
            const found = findInTree(cat.children, targetSlug)
            if (found) return found
          }
        }
        return null
      }
      return findInTree(state.categoryTree, slug)
    },

    /**
     * Get current category level (0, 1, or 2)
     */
    getCurrentLevel: (state) => {
      return state.currentCategory?.level ?? null
    },

    /**
     * Check if current category has children
     */
    hasChildren: (state) => {
      return state.children && state.children.length > 0
    },

    /**
     * Get breadcrumb as URL-friendly slugs
     */
    getBreadcrumbSlugs: (state) => {
      return state.breadcrumb.map(cat => cat.slug)
    },

    /**
     * Build full category URL from breadcrumb
     */
    getCategoryUrl: (state) => {
      if (!state.breadcrumb || state.breadcrumb.length === 0) return '/shop'
      const slugs = state.breadcrumb.map(cat => cat.slug).join('/')
      return `/shop/${slugs}`
    }
  },

  actions: {
    /**
     * Fetch full category tree (all levels)
     */
    async fetchCategoryTree() {
      if (this.categoryTree.length > 0) return // Already loaded

      try {
        this.loading = true
        this.error = null

        const { data } = await getCategoryTreeApi()
        if (data.success) {
          this.categoryTree = data.data
        }
      } catch (err) {
        console.error('Failed to fetch category tree:', err)
        this.error = err.response?.data?.message || 'Failed to load categories'
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch root categories with their immediate children
     */
    async fetchRootCategories() {
      if (this.rootCategories.length > 0) return // Already loaded

      try {
        this.loading = true
        this.error = null

        const { data } = await getRootCategoriesWithChildrenApi()
        if (data.success) {
          this.rootCategories = data.data
        }
      } catch (err) {
        console.error('Failed to fetch root categories:', err)
        this.error = err.response?.data?.message || 'Failed to load root categories'
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch category hierarchy by slug (with caching)
     * Returns: current, breadcrumb, parent, siblings, children, productCount
     */
    async fetchCategoryHierarchy(slug) {
      // Check cache first
      if (this.hierarchyCache[slug]) {
        this.setHierarchyContext(this.hierarchyCache[slug])
        return this.hierarchyCache[slug]
      }

      try {
        this.loading = true
        this.error = null

        const { data } = await getCategoryHierarchyApi(slug)
        if (data.success) {
          const hierarchy = data.data

          // Cache the result
          this.hierarchyCache[slug] = hierarchy

          // Update state
          this.setHierarchyContext(hierarchy)

          return hierarchy
        }
      } catch (err) {
        console.error('Failed to fetch category hierarchy:', err)
        this.error = err.response?.data?.message || 'Failed to load category'
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Set current hierarchy context
     */
    setHierarchyContext(hierarchy) {
      this.currentCategory = hierarchy.current
      this.breadcrumb = hierarchy.breadcrumb || []
      this.siblings = hierarchy.siblings || []
      this.children = hierarchy.children || []
    },

    /**
     * Clear current hierarchy context
     */
    clearHierarchyContext() {
      this.currentCategory = null
      this.breadcrumb = []
      this.siblings = []
      this.children = []
    },

    /**
     * Clear hierarchy cache (useful after category updates)
     */
    clearCache() {
      this.hierarchyCache = {}
    },

    /**
     * Build category URL from breadcrumb array
     */
    buildCategoryUrl(breadcrumbArray) {
      if (!breadcrumbArray || breadcrumbArray.length === 0) return '/shop'
      const slugs = breadcrumbArray.map(cat => cat.slug).join('/')
      return `/shop/${slugs}`
    },

    /**
     * Navigate to category by adding child to current breadcrumb
     */
    getChildCategoryUrl(childSlug) {
      const slugs = [...this.breadcrumb.map(cat => cat.slug), childSlug]
      return `/shop/${slugs.join('/')}`
    }
  },
})
