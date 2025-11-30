<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="closeModal"
      >
        <div
          class="relative w-full max-w-4xl overflow-hidden bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Close Button -->
          <button
            @click="closeModal"
            class="absolute z-10 p-2 text-gray-600 transition-colors bg-white rounded-full shadow-lg top-4 right-4 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>

          <!-- Bundle Content -->
          <div class="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
            <!-- Left: Image Gallery -->
            <div class="space-y-4">
              <div class="overflow-hidden bg-gray-100 rounded-xl">
                <img
                  :src="currentImage"
                  :alt="bundle.name"
                  class="object-cover w-full h-[400px]"
                />
              </div>

              <!-- Discount Badge -->
              <div
                v-if="bundle.discountPercentage > 0"
                class="flex items-center justify-center gap-2 p-3 rounded-lg bg-red-50"
              >
                <svg
                  class="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"
                  ></path>
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span class="font-semibold text-red-600">
                  Save {{ bundle.discountPercentage }}% on this bundle!
                </span>
              </div>
            </div>

            <!-- Right: Bundle Info -->
            <div class="flex flex-col">
              <!-- Bundle Name -->
              <h2 class="mb-2 text-3xl font-bold text-gray-900">
                {{ bundle.name }}
              </h2>

              <!-- Average Rating (Calculated from items) -->
              <div class="flex items-center gap-3 mb-4">
                <div class="flex items-center gap-1">
                  <svg
                    v-for="star in 5"
                    :key="star"
                    :class="[
                      'w-5 h-5',
                      star <= averageRating
                        ? 'text-yellow-400'
                        : 'text-gray-300',
                    ]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    ></path>
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-700">
                  {{ averageRating.toFixed(1) }} / 5.0
                </span>
                <span class="text-sm text-gray-500">
                  ({{ totalReviews }} reviews)
                </span>
              </div>

              <!-- Description -->
              <p class="mb-6 leading-relaxed text-gray-600">
                {{ bundle.description }}
              </p>

              <!-- Price Section -->
              <div class="p-4 mb-6 rounded-lg bg-gray-50">
                <div class="flex items-baseline justify-between mb-2">
                  <span class="text-sm text-gray-600">Original Price:</span>
                  <span class="text-lg text-gray-400 line-through">
                    ${{ originalPrice }}
                  </span>
                </div>
                <div class="flex items-baseline justify-between mb-2">
                  <span class="text-sm font-medium text-gray-900"
                    >Bundle Price:</span
                  >
                  <span class="text-3xl font-bold text-rose-600">
                    ${{ bundlePrice }}
                  </span>
                </div>
                <div class="pt-2 border-t border-gray-200">
                  <span class="text-lg font-semibold text-green-600">
                    You save ${{ savings }} {{ bundle.discountPercentage }}
                  </span>
                </div>
              </div>

              <!-- Included Items -->
              <div class="mb-6">
                <h3 class="mb-3 text-lg font-semibold text-gray-900">
                  What's Included ({{ itemsCount }} items)
                </h3>
                <div class="space-y-3 overflow-y-auto max-h-48">
                  <div
                    v-for="(item, index) in bundle.items"
                    :key="index"
                    class="flex items-start gap-3 p-3 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div
                      class="flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-100 rounded-lg"
                    >
                      <img
                        v-if="getProductImage(item.product)"
                        :src="getProductImage(item.product)"
                        :alt="item.product?.name"
                        class="object-cover w-full h-full"
                      />
                      <div
                        v-else
                        class="flex items-center justify-center w-full h-full bg-gray-200"
                      >
                        <svg
                          class="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-900 truncate">
                        {{ item.product?.name || "Product" }}
                      </p>
                      <p class="text-sm text-gray-500">
                        Qty: {{ item.quantity }} • Brand:
                        {{ item.product?.brand || "N/A" }}
                      </p>
                      <div
                        v-if="item.product?.rating"
                        class="flex items-center gap-1 mt-1"
                      >
                        <svg
                          class="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          ></path>
                        </svg>
                        <span class="text-xs text-gray-600">
                          {{ item.product.rating.toFixed(1) }} ({{
                            item.product.numReviews || 0
                          }})
                        </span>
                      </div>
                    </div>
                    <div class="text-sm font-medium text-gray-700">
                      ${{ getProductPrice(item.product) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stock Status -->
              <div class="mb-4">
                <div
                  v-if="isInStock"
                  class="flex items-center gap-2 text-green-600"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <span class="font-medium">In Stock</span>
                </div>
                <div v-else class="flex items-center gap-2 text-red-600">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <span class="font-medium">Out of Stock</span>
                </div>
              </div>

              <!-- Quantity Selector -->
              <div class="mb-4">
                <label class="block mb-2 text-sm font-medium text-gray-700"
                  >Quantity</label
                >
                <div
                  class="flex items-center w-32 border border-gray-300 rounded-lg"
                >
                  <button
                    @click="decreaseQuantity"
                    :disabled="quantity <= 1"
                    class="flex-shrink-0 p-2 transition-colors bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-4 text-rose-600"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                      />
                    </svg>
                  </button>
                  <span class="flex-1 py-2 text-sm font-medium text-center">{{
                    quantity
                  }}</span>
                  <button
                    @click="increaseQuantity"
                    :disabled="!isInStock"
                    class="flex-shrink-0 p-2 transition-colors bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-4 text-rose-600"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <!-- Add to Cart Button -->
                <button
                  @click="handleAddToCart"
                  :disabled="!isInStock || isProcessing"
                  class="flex items-center justify-center w-full gap-2 py-3 text-base font-semibold text-white transition-all duration-300 bg-gray-900 rounded-lg hover:bg-gray-800 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <svg
                    v-if="isProcessing"
                    class="w-5 h-5 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <svg
                    v-else
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                  <span>{{
                    isProcessing ? "Adding to Cart..." : "Add to Basket"
                  }}</span>
                </button>

                <!-- Add to Wishlist Button -->
                <button
                  @click="handleAddToWishlist"
                  :disabled="isAddingToWishlist"
                  :class="[
                    'flex items-center justify-center w-full gap-2 py-3 font-semibold transition-colors border rounded-lg',
                    isInWishlist
                      ? 'border-red-600 bg-red-50 text-red-700 hover:bg-red-100'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  ]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    :fill="isInWishlist ? 'currentColor' : 'none'"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                  {{
                    isAddingToWishlist
                      ? "Processing..."
                      : isInWishlist
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useWishlistStore } from "../../store/wishlist.store";
import { useAuthStore } from "../../store/auth.store";
import { useCartStore } from "../../store/cart.store";
import { showWarningAlert } from "../../../utils/sweetAlert";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  bundle: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "add-to-cart"]);

const wishlistStore = useWishlistStore();
const authStore = useAuthStore();
const cartStore = useCartStore();

// State
const isProcessing = ref(false);
const isAddingToWishlist = ref(false);
const quantity = ref(1);

// Computed
const currentImage = computed(() => {
  if (props.bundle.image && props.bundle.image.length > 0) {
    return props.bundle.image[0].url || "https://via.placeholder.com/600";
  }
  return "https://via.placeholder.com/600";
});

const itemsCount = computed(() => {
  return props.bundle.items?.length || 0;
});

const originalPrice = computed(() => {
  return (props.bundle.originalPrice || 0).toFixed(2);
});

const bundlePrice = computed(() => {
  return (props.bundle.bundlePrice || 0).toFixed(2);
});

const savings = computed(() => {
  return (props.bundle.originalPrice - props.bundle.bundlePrice).toFixed(2);
});

// Calculate average rating from bundle items
const averageRating = computed(() => {
  const items = props.bundle.items || [];
  if (items.length === 0) return 0;

  const totalRating = items.reduce((sum, item) => {
    return sum + (item.product?.rating || 0);
  }, 0);

  return totalRating / items.length;
});

const totalReviews = computed(() => {
  const items = props.bundle.items || [];
  return items.reduce((sum, item) => {
    return sum + (item.product?.numReviews || 0);
  }, 0);
});

// Check if bundle is in stock (all products have stock)
const isInStock = computed(() => {
  if (!props.bundle.isActive) return false;

  const items = props.bundle.items || [];
  if (items.length === 0) return false;

  return items.every((item) => {
    const product = item.product;
    if (!product) return false;
    return (product.countInstock || 0) >= (item.quantity || 1);
  });
});

// Check if bundle is in wishlist by bundle id
const isInWishlist = computed(() => {
  if (!props.bundle || !props.bundle._id) return false;
  return wishlistStore.isInWishlist(props.bundle._id);
});

// Helper methods
const getProductImage = (product) => {
  if (!product) return null;

  // Try image array first (standard field)
  if (
    product.image &&
    Array.isArray(product.image) &&
    product.image.length > 0
  ) {
    return product.image[0].url || product.image[0];
  }

  // Try images array (alternative field)
  if (
    product.images &&
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    return product.images[0].url || product.images[0];
  }

  return null;
};

const getProductPrice = (product) => {
  if (!product) return "0.00";
  return (product.currentPrice || product.price || 0).toFixed(2);
};

// Methods
const closeModal = () => {
  quantity.value = 1;
  emit("close");
};

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const handleAddToCart = async () => {
  if (isProcessing.value || !isInStock.value) return;

  try {
    isProcessing.value = true;

    // Use cart store to add a bundle (cartStore.addToCart accepts { product, bundle, quantity })
    await cartStore.addToCart({
      bundle: props.bundle,
      quantity: quantity.value,
    });

    // Close modal after successful add
    closeModal();
  } catch (error) {
    console.error("Error adding bundle to cart:", error);
  } finally {
    isProcessing.value = false;
  }
};

const handleAddToWishlist = async () => {
  try {
    isAddingToWishlist.value = true;

    if (!authStore.state.isLoggedIn) {
      showWarningAlert("You need to be logged in to manage your wishlist.");
      return;
    }

    try {
      if (!props.bundle || !props.bundle._id) {
        showWarningAlert("Bundle not found");
        return;
      }

      if (isInWishlist.value) {
        await wishlistStore.removeFromWishlist(props.bundle._id);
      } else {
        await wishlistStore.addBundleToWishlist(props.bundle);
      }
    } catch (err) {
      console.error("Bundle wishlist error:", err);
      throw err;
    }
  } catch (error) {
    console.error("Error updating wishlist:", error);
  } finally {
    isAddingToWishlist.value = false;
  }
};

// Lock body scroll when modal is open
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      quantity.value = 1;
    } else {
      document.body.style.overflow = "";
    }
  }
);
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
