import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useFilterStore = defineStore('filter', () => {
  // Filter state
  const priceRange = ref({ min: 0, max: 1000 });
  const selectedBrands = ref([]);
  const minRating = ref(0);
  const inStock = ref(false);
  const sortBy = ref('featured');
  const searchQuery = ref('');

  // Pagination
  const currentPage = ref(1);
  const pageSize = ref(24);

  // Available options (populated from API)
  const availableBrands = ref([]);
  const priceRangeLimits = ref({ min: 0, max: 1000 });

  // Active filters count
  const activeFilterCount = computed(() => {
    let count = 0;
    // Check if price range is different from default limits
    if (priceRange.value.min > priceRangeLimits.value.min ||
      priceRange.value.max < priceRangeLimits.value.max) {
      count++;
    }
    // Count selected brands
    if (selectedBrands.value.length > 0) {
      count += selectedBrands.value.length;
    }
    // Check rating filter
    if (minRating.value > 0) {
      count++;
    }
    // Check stock filter
    if (inStock.value) {
      count++;
    }
    return count;
  });

  // Build filter object for API
  const getFilterParams = computed(() => {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sort: sortBy.value,
    };

    // Only add price filters if they differ from default limits
    if (priceRange.value.min > priceRangeLimits.value.min) {
      params.priceMin = priceRange.value.min;
    }
    if (priceRange.value.max < priceRangeLimits.value.max) {
      params.priceMax = priceRange.value.max;
    }

    // Add brand filter
    if (selectedBrands.value.length > 0) {
      params.brand = selectedBrands.value.join(',');
    }

    // Add rating filter
    if (minRating.value > 0) {
      params.rating = minRating.value;
    }

    // Add stock filter
    if (inStock.value) {
      params.inStock = 'true';
    }

    // Add search query
    if (searchQuery.value && searchQuery.value.trim()) {
      params.search = searchQuery.value.trim();
    }

    return params;
  });

  // Reset all filters to default state
  const resetFilters = () => {
    priceRange.value = {
      min: priceRangeLimits.value.min,
      max: priceRangeLimits.value.max
    };
    selectedBrands.value = [];
    minRating.value = 0;
    inStock.value = false;
    sortBy.value = 'featured';
    searchQuery.value = '';
    currentPage.value = 1;
  }

  const resetPagination = () => {
    currentPage.value = 1;
  };

  const toggleBrand = (brand) => {
    const index = selectedBrands.value.indexOf(brand);
    if (index > -1) {
      selectedBrands.value.splice(index, 1);
    } else {
      selectedBrands.value.push(brand);
    }
    resetPagination();
  }

  const setPriceRange = (min, max) => {
    const validMin = Math.max(priceRangeLimits.value.min, Math.min(min, priceRangeLimits.value.max));
    const validMax = Math.max(priceRangeLimits.value.min, Math.min(max, priceRangeLimits.value.max));

    priceRange.value = {
      min: validMin,
      max: Math.max(validMin, validMax)
    };
    resetPagination();
  };

  const setMinRating = (rating) => {
    // Validate rating (0-5)
    minRating.value = Math.max(0, Math.min(5, rating));
    resetPagination();
  };

  const setInStock = (value) => {
    inStock.value = Boolean(value);
    resetPagination();
  };

  const setSortBy = (sort) => {
    const validSorts = ['featured', 'best-selling', 'price-asc', 'price-desc', 'newest', 'rating-desc', 'name-asc'];
    if (validSorts.includes(sort)) {
      sortBy.value = sort;
      resetPagination();
    }
  };

  // Set page number
  const setPage = (page) => {
    currentPage.value = Math.max(1, page);
  };

  // Initialize from URL query params
  const initFromQuery = (query) => {
    if (query.priceMin) {
      const min = Number(query.priceMin);
      if (!isNaN(min)) priceRange.value.min = min;
    }
    if (query.priceMax) {
      const max = Number(query.priceMax);
      if (!isNaN(max)) priceRange.value.max = max;
    }
    if (query.brand) {
      selectedBrands.value = query.brand.split(',').filter(b => b.trim());
    }
    if (query.rating) {
      const rating = Number(query.rating);
      if (!isNaN(rating)) minRating.value = Math.max(0, Math.min(5, rating));
    }
    if (query.inStock) {
      inStock.value = query.inStock === 'true';
    }
    if (query.sort) {
      setSortBy(query.sort);
    }
    if (query.page) {
      const page = Number(query.page);
      if (!isNaN(page)) currentPage.value = Math.max(1, page);
    }
    if (query.search) {
      searchQuery.value = query.search.trim();
    }
  };

  const setAvailableBrands = (brands) => {
    if (Array.isArray(brands)) {
      availableBrands.value = brands.filter(b => typeof b === 'string' && b.trim());
    }
  };

  const setPriceRangeLimits = (min, max) => {
    const validMin = Math.max(0, min);
    const validMax = Math.max(validMin, max);

    priceRangeLimits.value = { min: validMin, max: validMax };

    if (priceRange.value.min === 0 && priceRange.value.max === 1000) {
      priceRange.value = { min: validMin, max: validMax };
    }
  };

  return {
    // State
    priceRange,
    selectedBrands,
    minRating,
    inStock,
    sortBy,
    searchQuery,
    currentPage,
    pageSize,
    availableBrands,
    priceRangeLimits,

    // Computed
    activeFilterCount,
    getFilterParams,

    // Actions
    resetFilters,
    resetPagination,
    toggleBrand,
    setPriceRange,
    setMinRating,
    setInStock,
    setSortBy,
    setPage,
    initFromQuery,
    setAvailableBrands,
    setPriceRangeLimits,
  }
})

