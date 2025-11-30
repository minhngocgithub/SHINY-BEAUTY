<template>
  <section
    class="px-4 py-16 bg-gradient-to-b from-white via-rose-50/20 to-white"
  >
    <div class="w-full max-w-[1600px] mx-auto">
      <div class="mb-12 text-center" data-aos="fade-up">
        <div
          class="absolute w-32 h-32 rounded-full bottom-10 left-10 bg-rose-200 blur-3xl"
        ></div>
        <div
          class="absolute w-40 h-40 rounded-full bottom-10 right-10 bg-amber-200 blur-3xl"
        ></div>
        <div
          class="inline-flex items-center w-full gap-2 px-4 py-2 mb-4 text-sm font-semibold rounded-full text-rose-600 bottom-10 left-10 bg-rose-300 blur-3xl"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
          <span>SPECIAL OFFERS</span>
        </div>

        <h2 class="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
          Value Sets & Bundles
        </h2>
        <p class="max-w-2xl mx-auto text-lg text-gray-600">
          Curated collections for maximum value—save more when you bundle
        </p>
      </div>
      <div
        class="absolute w-32 h-32 rounded-full bottom-10 left-10 bg-rose-300 blur-3xl"
      ></div>
      <div
        class="absolute w-40 h-40 rounded-full bottom-10 right-10 bg-amber-200 blur-3xl"
      ></div>
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <Loading />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-20 text-center">
        <div class="max-w-md px-6 mx-auto">
          <div
            class="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-rose-100"
          >
            <svg
              class="w-8 h-8 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="mb-2 text-xl font-semibold text-gray-900">
            Unable to Load Bundles
          </h3>
          <p class="mb-6 text-sm text-gray-600">{{ error }}</p>
          <button
            @click="fetchBundles"
            class="px-8 py-3 text-sm font-semibold text-white transition-all duration-300 bg-gray-900 rounded-full hover:bg-gray-800 hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="bundles.length === 0" class="py-20 text-center">
        <div class="max-w-md px-6 mx-auto">
          <div
            class="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200"
          >
            <svg
              class="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 class="mb-2 text-2xl font-bold text-gray-900">
            No Bundles Available
          </h3>
          <p class="text-base text-gray-600">
            Check back soon for amazing bundle offers and exclusive deals!
          </p>
        </div>
      </div>

      <!-- Bundles Grid -->
      <div v-else>
        <div
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        >
          <div
            v-for="(bundle, index) in bundles"
            :key="bundle._id"
            :data-aos="getAosEffect(index)"
            :data-aos-delay="getAosDelay(index)"
            class="group"
          >
            <BundleCard
              :bundle="bundle"
              @add-to-cart="handleAddToCart"
              @view-details="handleViewDetails"
            />
          </div>
        </div>

        <!-- View All Button -->
        <div v-if="hasMore" class="mt-16 text-center" data-aos="fade-up">
          <button
            @click="goToBundlesPage"
            class="inline-flex items-center gap-2 px-10 py-4 text-base font-semibold text-gray-900 transition-all duration-300 bg-white border-2 border-gray-900 rounded-full hover:bg-gray-900 hover:text-white hover:shadow-xl group"
          >
            <span>Explore All Bundles</span>
            <svg
              class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick look handled inside each BundleCard -->
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAllBundlesApi } from "../service/bundle.service";
import BundleCard from "./product/BundleCard.vue";
import { showSuccessAlert, showErrorAlert } from "../../utils/sweetAlert";
import AOS from "aos";
import Loading from "./Loading.vue";
const router = useRouter();

// State
const bundles = ref([]);
const loading = ref(false);
const error = ref(null);
const hasMore = ref(false);
// quick look handled by `BundleCard` internally

// Fetch bundles
const fetchBundles = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await getAllBundlesApi({
      limit: 8,
      isActive: true,
      featured: true,
      sort: "-createdAt",
    });

    if (response.data.success) {
      bundles.value = response.data.bundles || [];
      hasMore.value = response.data.total > 8;
    }
  } catch (err) {
    console.error("Failed to fetch bundles:", err);
    error.value = err.response?.data?.message || "Failed to load bundles";
  } finally {
    loading.value = false;
  }
};

// BundleCard provides UI helpers (image, pricing, quick-look) internally

// Handlers
const handleAddToCart = async (bundle) => {
  try {
    showSuccessAlert(
      "Added to Cart!",
      `${bundle.name} has been added to your cart`
    );
  } catch (err) {
    showErrorAlert("Error", "Failed to add bundle to cart");
  }
};

const handleViewDetails = (bundle) => {
  router.push(`/bundle/${bundle._id}`);
};

const goToBundlesPage = () => {
  router.push("/bundles");
};

// AOS animations
const getAosEffect = (index) => {
  return "fade-up";
};

const getAosDelay = (index) => {
  return (index % 5) * 50;
};

// Lifecycle
onMounted(async () => {
  await fetchBundles();
  AOS.refresh();
});
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>