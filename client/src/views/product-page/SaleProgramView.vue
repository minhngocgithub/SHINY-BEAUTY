<template>
  <section
    class="w-full min-h-screen bg-gradient-to-b from-white via-rose-50/30 to-white"
  >
    <Header />

    <!-- Hero Section - Soft and Clean -->
    <div
      class="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white"
    >
      <div class="absolute inset-0 opacity-40">
        <div
          class="absolute rounded-full w-96 h-96 bg-rose-200 -top-20 -left-20 blur-3xl"
        ></div>
        <div
          class="absolute bg-pink-200 rounded-full w-96 h-96 -bottom-20 -right-20 blur-3xl"
        ></div>
      </div>
      <div class="relative px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <!-- Breadcrumb -->
        <div class="mb-6">
          <Breadcrumb :items="breadcrumbItems" />
        </div>

        <div class="text-center">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-semibold rounded-full bg-rose-100 text-rose-600"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
            Limited Time Offers
          </div>
          <h1
            class="mb-4 text-4xl font-black text-gray-900 md:text-5xl lg:text-6xl"
          >
            Active Sale Programs
          </h1>
          <p class="max-w-2xl mx-auto text-lg text-gray-600 md:text-xl">
            Discover our exclusive promotions and save big on your favorite
            products
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-20 space-y-4"
      >
        <Loading />
        <p class="text-sm text-gray-500">Loading amazing deals...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-12">
        <div
          class="max-w-md p-8 mx-auto text-center bg-white border border-red-100 shadow-lg rounded-2xl"
        >
          <div
            class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-50"
          >
            <svg
              class="w-8 h-8 text-red-500"
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
          <h3 class="mb-2 text-lg font-semibold text-gray-900">
            Oops! Something went wrong
          </h3>
          <p class="mb-6 text-sm text-gray-600">{{ error }}</p>
          <button
            @click="fetchSalePrograms"
            class="px-6 py-2.5 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 hover:shadow-lg active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>

      <!-- Programs Grid -->
      <div
        v-else-if="salePrograms.length > 0"
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="program in salePrograms"
          :key="program.id || program._id"
          class="flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-sm cursor-pointer rounded-2xl hover:shadow-2xl hover:-translate-y-2 group"
          @click="navigateToProgram(program)"
        >
          <!-- Banner Image -->
          <div
            class="relative h-48 overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100"
          >
            <img
              v-if="program.bannerImage"
              :src="program.bannerImage"
              :alt="program.title"
              class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
            <div v-else class="flex items-center justify-center h-full">
              <svg
                class="w-16 h-16 text-rose-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>

            <!-- Status Badge -->
            <div class="absolute top-4 right-4">
              <span
                v-if="program.isCurrentlyActive"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-green-500 rounded-full shadow-lg animate-pulse"
              >
                <span class="w-2 h-2 bg-white rounded-full"></span>
                Active Now
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full"
              >
                Inactive
              </span>
            </div>

            <!-- Discount Badge -->
            <div
              class="absolute bottom-0 left-0 px-4 py-2 text-white rounded-tr-2xl rounded-bl-2xl bg-gradient-to-r from-red-500 to-pink-500"
            >
              <p class="text-2xl font-black">
                <span v-if="program.benefits?.discountPercentage"
                  >{{ program.benefits.discountPercentage }}%</span
                >
                <span v-else-if="program.benefits?.discountAmount"
                  >${{ program.benefits.discountAmount }}</span
                >
                <span v-else>Special</span>
              </p>
              <p class="text-xs font-semibold">OFF</p>
            </div>
          </div>

          <!-- Content -->
          <div class="flex flex-col p-6 h-[400px]">
            <!-- Fixed height header section -->
            <div class="mb-4">
              <div class="flex items-start justify-between gap-3 mb-2">
                <h3
                  class="text-xl font-bold text-gray-900 transition-colors group-hover:text-rose-600 line-clamp-2 min-h-[56px]"
                >
                  {{ program.title }}
                </h3>
              </div>
              <span
                class="inline-block px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-600"
              >
                {{ program.type || "Flash Sale" }}
              </span>
            </div>

            <!-- Fixed height description -->
            <p
              class="mb-4 text-sm leading-relaxed text-gray-600 line-clamp-3 min-h-[63px]"
            >
              {{ program.description || program.shortDescription }}
            </p>

            <!-- Benefits section with flex-grow to push button down -->
            <div class="flex-grow pb-4 mb-4 space-y-2 border-b border-gray-100">
              <div
                v-if="program.benefits?.freeShipping"
                class="flex items-center gap-2 text-sm text-gray-700"
              >
                <svg
                  class="flex-shrink-0 w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                  />
                  <path
                    d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"
                  />
                </svg>
                <span class="font-medium">Free Shipping</span>
              </div>

              <div
                v-if="program.conditions?.maxUsagePerUser"
                class="flex items-center gap-2 text-sm text-gray-700"
              >
                <svg
                  class="flex-shrink-0 w-4 h-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  />
                </svg>
                <span
                  >Limit {{ program.conditions.maxUsagePerUser }} per
                  customer</span
                >
              </div>
            </div>

            <!-- Time Period -->
            <div class="flex items-center gap-2 mb-4 text-xs text-gray-500">
              <svg
                class="flex-shrink-0 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="font-medium">
                {{ formatDate(program.startDate) }} -
                {{ formatDate(program.endDate) }}
              </span>
            </div>

            <!-- CTA Button - Always at bottom -->
            <button
              class="flex items-center justify-center w-full gap-2 px-6 py-3 mt-auto text-sm font-bold text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 hover:shadow-xl active:scale-95 group/btn"
            >
              <span>View Products</span>
              <svg
                class="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
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

      <!-- Empty State -->
      <div v-else class="py-20">
        <div class="max-w-md mx-auto text-center">
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
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <h3 class="mb-2 text-2xl font-bold text-gray-900">
            No Active Promotions
          </h3>
          <p class="mb-6 text-gray-600">
            Check back soon for amazing deals and exclusive offers!
          </p>
          <button
            @click="$router.push('/')"
            class="px-6 py-3 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 hover:shadow-lg active:scale-95"
          >
            Browse Products
          </button>
        </div>
      </div>
    </div>

    <!-- Newsletter Section -->
    <div
      v-if="!loading && salePrograms.length > 0"
      class="py-16 bg-gradient-to-br from-rose-50 to-pink-50"
    >
      <div class="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">
            Never Miss a Deal
          </h2>
          <p class="mb-8 text-gray-600">
            Subscribe to get notified about exclusive sales and special offers
          </p>
          <div class="flex max-w-md gap-3 mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              class="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
            <button
              class="px-6 py-3 text-sm font-semibold text-white transition-all duration-200 rounded-lg whitespace-nowrap bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 hover:shadow-lg active:scale-95"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Header from "../../components/Header.vue";
import Breadcrumb from "../../components/commons/BreadCrumb.vue";
import Loading from "../../components/Loading.vue";
import { getActiveSaleProgramsApi } from "../../service/saleProgram.service";

const router = useRouter();

const salePrograms = ref([]);
const loading = ref(true);
const error = ref(null);

const breadcrumbItems = computed(() => [
  { label: "Home", to: "/" },
  { label: "Sale Programs", to: "/sale-programs" },
]);

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const fetchSalePrograms = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await getActiveSaleProgramsApi();
    if (response.data.success) {
      salePrograms.value = response.data.salePrograms || [];
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to load sale programs";
    console.error("Fetch sale programs error:", err);
  } finally {
    loading.value = false;
  }
};

const navigateToProgram = (program) => {
  const programId = program.id || program._id;
  if (!programId) {
    console.error("❌ No valid program ID found:", program);
    return;
  }

  router.push({
    name: "SaleProgramProducts",
    params: { id: programId },
  });
};

onMounted(() => {
  fetchSalePrograms();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>