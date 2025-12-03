<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <Header />

    <!-- Loading State -->
    <div v-if="loading" class="px-4 py-8 mx-auto max-w-7xl">
      <Loading />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="px-4 py-12 mx-auto max-w-7xl">
      <div class="p-6 text-center bg-red-50 rounded-xl">
        <p class="mb-4 text-red-800">{{ error }}</p>
        <button
          @click="fetchWishlistData"
          class="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- SUCCESS STATE -->
    <div v-else class="px-4 py-6 mx-auto max-w-7xl">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <BreadCrumb :items="breadcrumbItems" />
      </div>

      <h1 class="mb-6 text-3xl font-bold">❤️ My Wishlist</h1>

      <!-- Filter & Sort -->
      <div class="p-4 mb-6 bg-white shadow-sm rounded-xl">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-sm">
            <span class="w-2 h-2 bg-red-500 rounded-full"></span>
            <span class="font-semibold text-gray-800">
              {{ wishlistStore.wishlistCount }} Items in Wishlist
            </span>
          </div>

          <!-- Sort -->
          <select
            v-model="sortBy"
            @change="applySorting"
            class="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <!-- PRODUCTS GRID -->
      <div
        v-if="sortedWishlistItems.length > 0"
        class="grid grid-cols-2 gap-6 mb-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        <div
          v-for="item in paginatedWishlistItems"
          :key="item._id"
          class="relative"
        >
          <!-- Remove from Wishlist Button -->
          <button
            @click.stop="
              removeFromWishlist(item.product?._id || item.bundle?._id)
            "
            class="absolute z-40 flex items-center justify-center w-8 h-8 text-white transition-all bg-red-600 rounded-full shadow-lg top-2 right-2 hover:bg-red-700 hover:scale-110"
            title="Remove from Wishlist"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Product Card -->
          <CardProduct
            v-if="item.product"
            :product="item.product"
            width="w-full"
            @view-details="goToProductDetail(item.product)"
          />

          <!-- Bundle Card -->
          <BundleCard
            v-else-if="item.bundle"
            :bundle="item.bundle"
            @view-details="goToBundleDetail(item.bundle)"
          />
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-else class="py-16 text-center">
        <svg
          class="w-20 h-20 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h3 class="mb-2 text-xl font-semibold text-gray-700">
          Wishlist is Empty
        </h3>
        <p class="mb-4 text-gray-500">Start adding items to your wishlist!</p>
        <router-link
          to="/"
          class="inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </router-link>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-center gap-2 mt-8"
      >
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>

        <button
          v-for="page in displayPages"
          :key="page"
          @click="currentPage = page"
          :class="
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          "
          class="px-4 py-2 text-sm font-medium rounded-lg"
        >
          {{ page }}
        </button>

        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useWishlistStore } from "../../store/wishlist.store";
import { useSaleProgramStore } from "../../store/saleProgram.store";
import Header from "../../components/Header.vue";
import Footer from "../../components/Footer.vue";
import Loading from "../../components/Loading.vue";
import CardProduct from "../../components/product/CardProduct.vue";
import BundleCard from "../../components/product/BundleCard.vue";
import BreadCrumb from "../../components/commons/BreadCrumb.vue";
const router = useRouter();
const wishlistStore = useWishlistStore();
const saleProgramStore = useSaleProgramStore();

// State
const loading = ref(true);
const error = ref(null);
const sortBy = ref("newest");
const currentPage = ref(1);
const itemsPerPage = 12;

// Fetch wishlist data on mount
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;

    // Fetch wishlist
    await wishlistStore.fetchWishlist();

    // ✅ CRITICAL: Ensure sale programs are loaded (same as BestSeller.vue)
    if (saleProgramStore.activePrograms.length === 0) {
      await saleProgramStore.fetchActivePrograms();
    }

    console.log(
      "✅ Wishlist loaded with",
      wishlistStore.wishlistCount,
      "items"
    );
    console.log(
      "✅ Active sale programs:",
      saleProgramStore.activePrograms.length
    );
  } catch (err) {
    error.value = err.message || "Failed to load wishlist";
  } finally {
    loading.value = false;
  }
});

// Computed
const sortedWishlistItems = computed(() => {
  let items = [...wishlistStore.formattedWishlistItems];

  switch (sortBy.value) {
    case "newest":
      items.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
      break;
    case "oldest":
      items.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
      break;
    case "price_asc":
      items.sort((a, b) => {
        const priceA =
          a.product?.finalPrice ||
          a.product?.currentPrice ||
          a.product?.price ||
          a.bundle?.bundlePrice ||
          0;
        const priceB =
          b.product?.finalPrice ||
          b.product?.currentPrice ||
          b.product?.price ||
          b.bundle?.bundlePrice ||
          0;
        return priceA - priceB;
      });
      break;
    case "price_desc":
      items.sort((a, b) => {
        const priceA =
          a.product?.finalPrice ||
          a.product?.currentPrice ||
          a.product?.price ||
          a.bundle?.bundlePrice ||
          0;
        const priceB =
          b.product?.finalPrice ||
          b.product?.currentPrice ||
          b.product?.price ||
          b.bundle?.bundlePrice ||
          0;
        return priceB - priceA;
      });
      break;
    case "rating":
      items.sort((a, b) => {
        const ratingA = a.product?.ratings?.average || 0;
        const ratingB = b.product?.ratings?.average || 0;
        return ratingB - ratingA;
      });
      break;
  }

  return items;
});

const totalPages = computed(() => {
  return Math.ceil(sortedWishlistItems.value.length / itemsPerPage);
});

const paginatedWishlistItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedWishlistItems.value.slice(start, end);
});

const displayPages = computed(() => {
  const pages = [];
  const maxDisplay = 5;
  const total = totalPages.value;
  let start = Math.max(1, currentPage.value - Math.floor(maxDisplay / 2));
  let end = Math.min(total, start + maxDisplay - 1);

  if (end - start < maxDisplay - 1) {
    start = Math.max(1, end - maxDisplay + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const breadcrumbItems = computed(() => {
  return [
    { label: "Home", to: "/" },
    { label: "Account", to: "/account/profile?tab=wishlist" },
    { label: "Wishlist", to: "/wishlist" },
  ];
});

// Methods
const applySorting = () => {
  currentPage.value = 1;
};

const goToProductDetail = (product) => {
  if (!product) return;
  router.push(`/product/${product._id}`);
};

const goToBundleDetail = (bundle) => {
  if (!bundle) return;
  router.push(`/bundles/${bundle._id}`);
};

const removeFromWishlist = async (itemId) => {
  if (!itemId) return;

  try {
    await wishlistStore.removeFromWishlist(itemId);
  } catch (err) {
    error.value = err.message || "Failed to remove item";
  }
};

const fetchWishlistData = async () => {
  try {
    loading.value = true;
    error.value = null;
    await wishlistStore.fetchWishlist();
  } catch (err) {
    error.value = err.message || "Failed to load wishlist";
  } finally {
    loading.value = false;
  }
};
</script>