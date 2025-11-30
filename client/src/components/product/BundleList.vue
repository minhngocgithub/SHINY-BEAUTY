<template>
  <div class="bundle-list">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-900">
        Product Bundles & Special Offers
      </h3>
      <span
        class="px-3 py-1 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full"
      >
        Save More
      </span>
    </div>

    <div v-if="loading" class="py-12 text-center">
      <div
        class="inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"
      ></div>
      <p class="mt-2 text-gray-500">Loading bundles...</p>
    </div>

    <div v-else-if="bundles.length === 0" class="py-12 text-center">
      <svg
        class="w-16 h-16 mx-auto mb-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      <p class="text-gray-500">No bundle offers available</p>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="bundle in bundles"
        :key="bundle._id"
        class="relative p-6 overflow-hidden transition-all duration-300 border-2 border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 hover:border-purple-400 hover:shadow-xl"
      >
        <!-- Background Pattern -->
        <div class="absolute top-0 right-0 opacity-10">
          <svg
            class="w-32 h-32 text-purple-600"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>

        <!-- Bundle Header -->
        <div class="relative flex items-start justify-between mb-6">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span
                class="px-3 py-1 text-xs font-bold text-purple-700 bg-purple-200 rounded-full"
              >
                BUNDLE DEAL
              </span>
              <span
                v-if="bundle.stockQuantity <= 5"
                class="px-3 py-1 text-xs font-bold text-red-700 bg-red-200 rounded-full animate-pulse"
              >
                Limited Stock
              </span>
            </div>

            <h4 class="mb-2 text-xl font-bold text-gray-900">
              {{ bundle.name }}
            </h4>
            <p class="text-sm text-gray-600">{{ bundle.description }}</p>
          </div>

          <!-- Price Box -->
          <div class="text-right">
            <div class="text-3xl font-bold text-purple-600">
              ${{ bundle.price }}
            </div>
            <div class="text-sm text-gray-500 line-through">
              ${{ bundle.originalPrice }}
            </div>
            <div class="text-sm font-semibold text-green-600">
              Save ${{ bundle.savings }}
            </div>
          </div>
        </div>

        <!-- Bundle Products -->
        <div class="mb-6">
          <h5 class="mb-3 text-sm font-semibold text-gray-700">Includes:</h5>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div
              v-for="item in bundle.items"
              :key="item._id"
              class="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
            >
              <img
                :src="
                  item.product?.image ||
                  item.product?.imageUrl ||
                  '/placeholder-product.jpg'
                "
                :alt="item.product?.name"
                class="w-12 h-12 object-cover rounded"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ item.product?.name }}
                </p>
                <p class="text-xs text-gray-500">
                  Qty: {{ item.quantity }} × ${{ item.product?.price }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bundle Actions -->
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            <span v-if="bundle.stockQuantity > 0">
              {{ bundle.stockQuantity }} available
            </span>
            <span v-else class="text-red-600"> Out of stock </span>
          </div>

          <div class="flex gap-2">
            <button
              @click="handleViewBundle(bundle)"
              class="px-4 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-lg hover:bg-purple-50"
            >
              View Details
            </button>
            <button
              @click="handleAddBundleToCart(bundle)"
              :disabled="bundle.stockQuantity === 0 || cartStore.loading"
              class="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ cartStore.loading ? "Adding..." : "Add Bundle" }}
            </button>
          </div>
        </div>

        <!-- Bundle Benefits -->
        <div
          v-if="bundle.benefits?.length"
          class="mt-4 pt-4 border-t border-purple-200"
        >
          <h6 class="mb-2 text-sm font-semibold text-gray-700">
            Bundle Benefits:
          </h6>
          <ul class="space-y-1">
            <li
              v-for="benefit in bundle.benefits"
              :key="benefit"
              class="flex items-center text-sm text-gray-600"
            >
              <svg
                class="w-4 h-4 mr-2 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ benefit }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCartStore } from "../../store/cart.store";
import { useSaleProgramStore } from "../../store/saleProgram.store";

const props = defineProps({
  productId: {
    type: String,
    default: null,
  },
  categoryId: {
    type: String,
    default: null,
  },
  limit: {
    type: Number,
    default: 5,
  },
});

const emit = defineEmits(["bundle-selected", "bundle-added-to-cart"]);

// Stores
const cartStore = useCartStore();
const saleProgramStore = useSaleProgramStore();

// State
const bundles = ref([]);
const loading = ref(false);

// Methods
const fetchBundles = async () => {
  try {
    loading.value = true;

    // Fetch bundle deals from sale programs
    await saleProgramStore.fetchActivePrograms();

    // Filter bundle programs
    const bundlePrograms = saleProgramStore.bundleDeals;

    // For now, create mock bundles based on programs
    // In a real app, you'd fetch actual bundle data from API
    bundles.value = bundlePrograms.slice(0, props.limit).map((program) => ({
      _id: program._id,
      name: program.name,
      description: program.description,
      price: 99.99, // Mock price
      originalPrice: 149.99, // Mock original price
      savings: 50.0, // Mock savings
      stockQuantity: 10, // Mock stock
      items: [
        {
          _id: "1",
          product: {
            _id: "1",
            name: "Sample Product 1",
            price: 49.99,
            image: "/placeholder-product.jpg",
          },
          quantity: 1,
        },
        {
          _id: "2",
          product: {
            _id: "2",
            name: "Sample Product 2",
            price: 49.99,
            image: "/placeholder-product.jpg",
          },
          quantity: 1,
        },
      ],
      benefits: ["Free shipping", "Extended warranty", "Exclusive packaging"],
    }));
  } catch (error) {
    console.error("Error fetching bundles:", error);
  } finally {
    loading.value = false;
  }
};

const handleViewBundle = (bundle) => {
  emit("bundle-selected", bundle);
  // Navigate to bundle details page
  // router.push(`/bundles/${bundle._id}`)
};

const handleAddBundleToCart = async (bundle) => {
  try {
    const result = await cartStore.addToCart({
      bundle: bundle,
      quantity: 1,
    });

    if (result.success) {
      emit("bundle-added-to-cart", {
        bundle,
        success: true,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Error adding bundle to cart:", error);
    emit("bundle-added-to-cart", {
      bundle,
      success: false,
      error: error.message,
    });
  }
};

// Lifecycle
onMounted(() => {
  fetchBundles();
});
</script>