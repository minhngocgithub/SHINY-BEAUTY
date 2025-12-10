<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-purple-50/30"
  >
    <div class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1
              class="text-4xl font-bold text-transparent bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text"
            >
              Shopping Cart
            </h1>
            <p v-if="!isEmpty" class="mt-2 text-sm text-gray-600">
              {{ cartCount }} {{ cartCount === 1 ? "item" : "items" }} in your
              cart
            </p>
          </div>
          <button
            @click="goToShop"
            class="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl hover:shadow-xl hover:from-rose-600 hover:to-purple-700"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Continue Shopping
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading && formattedItems.length === 0"
        class="flex justify-center py-16"
      >
        <div class="relative">
          <div
            class="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <svg
              class="w-8 h-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Empty Cart -->
      <div
        v-else-if="isEmpty"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <div
          class="flex items-center justify-center w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-rose-100 to-purple-100"
        >
          <svg
            class="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h3 class="mb-2 text-2xl font-bold text-gray-800">
          Your Cart is Empty
        </h3>
        <p class="mb-6 text-gray-500">
          Looks like you haven't added any items to your cart yet.
        </p>
        <button
          @click="goToShop"
          class="px-8 py-3 font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl hover:from-rose-600 hover:to-purple-700 hover:shadow-xl"
        >
          Start Shopping
        </button>
      </div>

      <!-- Cart Content -->
      <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Cart Items -->
        <div class="space-y-4 lg:col-span-2">
          <!-- Select All Header -->
          <div
            class="flex items-center justify-between p-4 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-xl"
          >
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer text-rose-600 focus:ring-2 focus:ring-rose-500"
              />
              <span class="font-semibold text-gray-700">
                Select All ({{ formattedItems.length }} items)
              </span>
            </label>
            <button
              v-if="selectedCount > 0"
              @click="confirmClearSelected"
              class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 transition-colors border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Remove Selected ({{ selectedCount }})
            </button>
          </div>

          <!-- Shipping Suggestion Banner -->
          <div
            v-if="shippingSuggestion"
            :class="[
              'p-4 rounded-xl border-2 transition-all',
              shippingSuggestion.type === 'success'
                ? 'bg-green-50 border-green-200'
                : shippingSuggestion.type === 'info'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200',
            ]"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ shippingSuggestion.icon }}</span>
              <div class="flex-1">
                <p
                  :class="[
                    'font-semibold',
                    shippingSuggestion.type === 'success'
                      ? 'text-green-700'
                      : shippingSuggestion.type === 'info'
                      ? 'text-blue-700'
                      : 'text-gray-700',
                  ]"
                >
                  {{ shippingSuggestion.message }}
                </p>
                <div v-if="shippingSuggestion.progress" class="mt-2">
                  <div class="h-2 overflow-hidden bg-gray-200 rounded-full">
                    <div
                      class="h-full transition-all duration-500 bg-gradient-to-r from-rose-500 to-purple-600"
                      :style="{ width: shippingSuggestion.progress + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cart Items List -->
          <TransitionGroup name="list" tag="div" class="space-y-3">
            <div
              v-for="item in formattedItems"
              :key="item._id"
              class="relative overflow-hidden transition-all border border-gray-100 shadow-lg group bg-white/90 backdrop-blur-xl rounded-xl hover:shadow-xl"
            >
              <div class="flex gap-4 p-4">
                <!-- Checkbox -->
                <div class="flex items-start pt-2">
                  <input
                    type="checkbox"
                    :checked="selectedItems.has(item._id)"
                    @change="toggleItemSelection(item._id)"
                    class="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer text-rose-600 focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <!-- Product Image -->
                <div class="relative flex-shrink-0">
                  <div
                    class="relative w-24 h-24 overflow-hidden border-2 border-gray-100 rounded-xl"
                  >
                    <img
                      :src="item.image"
                      :alt="item.name"
                      @error="handleImageError"
                      class="object-cover w-full h-full transition-transform group-hover:scale-110"
                    />
                    <div
                      v-if="item.hasDiscount"
                      class="absolute top-0 right-0 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-bl-lg"
                    >
                      SALE
                    </div>
                  </div>
                  <div
                    v-if="item.itemType === 'bundle'"
                    class="absolute px-2 py-1 text-xs font-bold text-white rounded-lg shadow-lg -bottom-2 -left-2 bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    BUNDLE
                  </div>
                </div>

                <!-- Product Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <h3
                        class="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-rose-600"
                      >
                        {{ item.name }}
                      </h3>
                      <p v-if="item.brand" class="mt-1 text-sm text-gray-500">
                        {{ item.brand }}
                      </p>
                    </div>
                    <button
                      @click="confirmRemoveItem(item._id)"
                      :disabled="removeLoading"
                      class="p-2 text-gray-400 transition-colors rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <!-- Price & Quantity -->
                  <div class="flex items-end justify-between mt-4">
                    <div>
                      <div class="flex items-baseline gap-2">
                        <span class="text-xl font-bold text-rose-600">
                          {{ formatCurrency(item.displayPrice) }}
                        </span>
                        <span
                          v-if="item.hasDiscount"
                          class="text-sm text-gray-400 line-through"
                        >
                          {{ formatCurrency(item.originalPrice) }}
                        </span>
                      </div>
                      <p
                        v-if="item.savings > 0"
                        class="mt-1 text-xs font-semibold text-green-600"
                      >
                        Save {{ formatCurrency(item.savings * item.quantity) }}
                      </p>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="flex items-center gap-3">
                      <button
                        @click="decreaseQuantity(item)"
                        :disabled="updateLoading || item.quantity <= 1"
                        class="flex items-center justify-center w-8 h-8 text-white transition-all bg-gray-400 rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span
                        class="w-12 text-lg font-bold text-center text-gray-900"
                      >
                        {{ item.quantity }}
                      </span>
                      <button
                        @click="increaseQuantity(item)"
                        :disabled="updateLoading || item.quantity >= item.stock"
                        class="flex items-center justify-center w-8 h-8 text-white transition-all rounded-lg bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Stock Warning -->
                  <p
                    v-if="item.quantity >= item.stock"
                    class="mt-2 text-xs font-semibold text-orange-600"
                  >
                    ⚠️ Maximum stock reached
                  </p>
                </div>
              </div>

              <!-- Selection Highlight -->
              <div
                v-if="selectedItems.has(item._id)"
                class="absolute inset-0 pointer-events-none bg-gradient-to-r from-rose-500/5 to-purple-500/5"
              ></div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-1">
          <div
            class="sticky border border-gray-100 shadow-xl top-8 bg-white/90 backdrop-blur-xl rounded-xl"
          >
            <div class="p-6 border-b border-gray-100">
              <h2
                class="text-2xl font-bold text-transparent bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text"
              >
                Order Summary
              </h2>
            </div>

            <div class="p-6 space-y-4">
              <!-- No Selection Warning -->
              <div
                v-if="selectedCount === 0"
                class="p-4 text-center rounded-lg bg-orange-50"
              >
                <p class="text-sm font-semibold text-orange-600">
                  ⚠️ Please select items to checkout
                </p>
              </div>

              <!-- Pricing Details -->
              <div v-else class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600"
                    >Subtotal ({{ selectedCount }} items)</span
                  >
                  <span class="font-semibold text-gray-900">{{
                    formatCurrency(calculateSelectedSubtotal())
                  }}</span>
                </div>

                <div
                  v-if="calculateSelectedDiscount() > 0"
                  class="flex justify-between text-sm"
                >
                  <span class="text-gray-600">Discount</span>
                  <span class="font-semibold text-green-600"
                    >-{{ formatCurrency(calculateSelectedDiscount()) }}</span
                  >
                </div>

                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Shipping</span>
                  <span
                    :class="[
                      'font-semibold',
                      shippingFee === 0 ? 'text-green-600' : 'text-gray-900',
                    ]"
                  >
                    {{
                      shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)
                    }}
                  </span>
                </div>

                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Tax (estimated)</span>
                  <span class="font-semibold text-gray-900">{{
                    formatCurrency(calculateTax())
                  }}</span>
                </div>

                <div class="pt-4 border-t-2 border-gray-200">
                  <div class="flex items-baseline justify-between mb-2">
                    <span class="text-lg font-bold text-gray-900">Total</span>
                    <div class="text-right">
                      <p
                        class="text-3xl font-bold text-transparent bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text"
                      >
                        {{ formatCurrency(calculateTotal()) }}
                      </p>
                      <p class="text-xs text-gray-500 mt-0.5">
                        {{ shippingReasonText }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Savings Display -->
                <div
                  v-if="calculateSelectedDiscount() > 0"
                  class="p-3 text-center rounded-lg bg-gradient-to-r from-green-50 to-emerald-50"
                >
                  <p class="text-sm font-semibold text-green-700">
                    🎉 You're saving
                    {{ formatCurrency(calculateSelectedDiscount()) }}!
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="p-6 space-y-3 border-t border-gray-100">
              <button
                @click="goToCheckout"
                :disabled="loading || selectedCount === 0"
                class="w-full px-6 py-4 font-bold text-white transition-all shadow-lg bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl hover:from-rose-600 hover:to-purple-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{
                  selectedCount === 0
                    ? "Select Items to Checkout"
                    : `Proceed to Checkout (${selectedCount})`
                }}
              </button>
              <button
                @click="goToShop"
                class="w-full px-6 py-3 font-semibold text-gray-700 transition-colors border-2 border-gray-300 rounded-xl hover:bg-gray-100"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <Transition name="modal">
        <div
          v-if="showRemoveModal"
          class="fixed inset-0 z-50 flex items-center justify-center px-4"
          @click="showRemoveModal = false"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div
            @click.stop
            class="relative w-full max-w-sm p-8 bg-white shadow-2xl rounded-2xl"
          >
            <div class="text-center">
              <div
                class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full"
              >
                <svg
                  class="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 class="mb-2 text-xl font-bold text-gray-900">
                {{
                  confirmAction === "clear"
                    ? "Remove Selected Items?"
                    : "Remove Item?"
                }}
              </h3>
              <p class="mb-6 text-gray-600">
                {{
                  confirmAction === "clear"
                    ? `Are you sure you want to remove ${selectedCount} selected items?`
                    : "Are you sure you want to remove this item from your cart?"
                }}
              </p>
            </div>
            <div class="flex gap-3">
              <button
                @click="showRemoveModal = false"
                :disabled="removeLoading"
                class="flex-1 py-3 font-semibold text-gray-800 transition-colors bg-gray-200 rounded-xl hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                @click="executeRemoval"
                :disabled="removeLoading"
                class="flex-1 py-3 font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50"
              >
                {{ removeLoading ? "Removing..." : "Remove" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../../store/cart.store";
import { storeToRefs } from "pinia";
import {
  calculateOrderPricing,
  formatShippingReason,
} from "../../service/payment.service";

const router = useRouter();
const cartStore = useCartStore();
const { cartItems, cartSummary, loading, isEmpty } = storeToRefs(cartStore);

const updateLoading = ref(false);
const removeLoading = ref(false);
const showRemoveModal = ref(false);
const itemToRemove = ref(null);
const confirmAction = ref(null);
const selectedItems = ref(new Set());
const selectAll = ref(true);

// Formatted items with proper data structure
const formattedItems = computed(() => {
  return cartItems.value
    .map((item) => {
      const isProduct = item.itemType === "product" || item.product;
      const data = isProduct ? item.product : item.bundle;

      if (!data) {
        console.warn("Missing product/bundle data:", item);
        return null;
      }

      return {
        _id: item._id,
        name: data.name || "Unknown Item",
        brand: data.brand || "",
        image:
          data.image && Array.isArray(data.image) && data.image.length > 0
            ? data.image[0].url
            : "/placeholder.jpg",
        displayPrice: item.finalPrice || data.salePrice || data.price || 0,
        originalPrice: item.originalPrice || data.price || 0,
        quantity: item.quantity || 1,
        stock: data.countInstock || data.stock || 999,
        savings: item.savings || 0,
        hasDiscount:
          (item.originalPrice || data.price || 0) >
          (item.finalPrice || data.salePrice || data.price || 0),
        itemType: item.itemType,
      };
    })
    .filter((item) => item !== null);
});

const selectedItemsData = computed(() => {
  return formattedItems.value.filter((item) =>
    selectedItems.value.has(item._id)
  );
});

const selectedCount = computed(() => selectedItems.value.size);

const allSelected = computed(() => {
  return (
    formattedItems.value.length > 0 &&
    selectedItems.value.size === formattedItems.value.length
  );
});

const cartCount = computed(() => {
  return formattedItems.value.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
});

// Selection methods
const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedItems.value.clear();
    selectAll.value = false;
  } else {
    selectedItems.value = new Set(formattedItems.value.map((item) => item._id));
    selectAll.value = true;
  }
};

const toggleItemSelection = (itemId) => {
  if (selectedItems.value.has(itemId)) {
    selectedItems.value.delete(itemId);
  } else {
    selectedItems.value.add(itemId);
  }
  selectAll.value = allSelected.value;
};

// Pricing calculations
const calculateSelectedSubtotal = () => {
  return selectedItemsData.value.reduce((sum, item) => {
    return sum + item.displayPrice * item.quantity;
  }, 0);
};

const calculateSelectedDiscount = () => {
  return selectedItemsData.value.reduce((sum, item) => {
    if (item.hasDiscount) {
      return sum + (item.originalPrice - item.displayPrice) * item.quantity;
    }
    return sum;
  }, 0);
};

const pricingDetails = computed(() => {
  if (selectedCount.value === 0) {
    return {
      subtotal: 0,
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice: 0,
      isFreeShipping: false,
      shippingReason: "NONE",
    };
  }

  const checkoutItems = selectedItemsData.value.map((item) => ({
    product:
      item.itemType === "product"
        ? {
            _id: item._id,
            finalPrice: item.displayPrice,
            salePrice: item.displayPrice,
            price: item.originalPrice,
            freeShipping: false,
          }
        : null,
    quantity: item.quantity,
  }));

  return calculateOrderPricing(
    checkoutItems,
    0,
    0,
    cartSummary.value?.cartBenefits || {},
    {
      userLoyaltyTier: null,
      paymentMethod: "COD",
    }
  );
});

const calculateTax = () => pricingDetails.value.taxPrice;
const calculateTotal = () => pricingDetails.value.totalPrice;
const shippingFee = computed(() => pricingDetails.value.shippingPrice);
const shippingReasonText = computed(() =>
  formatShippingReason(pricingDetails.value.shippingReason)
);

const shippingSuggestion = computed(() => {
  const selected = selectedItemsData.value;
  if (selected.length === 0) return null;

  const subtotal = calculateSelectedSubtotal();
  const totalQty = selected.reduce((sum, item) => sum + item.quantity, 0);

  if (shippingFee.value === 0) {
    return {
      type: "success",
      message: "🎉 You have FREE shipping!",
      icon: "✅",
    };
  }

  if (subtotal >= 40 && subtotal < 50) {
    const remaining = 50 - subtotal;
    return {
      type: "info",
      message: `Add $${remaining.toFixed(2)} more for FREE shipping!`,
      icon: "📦",
      progress: (subtotal / 50) * 100,
    };
  }

  if (totalQty >= 3 && totalQty < 5) {
    const remaining = 5 - totalQty;
    return {
      type: "info",
      message: `Add ${remaining} more items for FREE shipping!`,
      icon: "🛍️",
      progress: (totalQty / 5) * 100,
    };
  }

  if (subtotal < 40 && totalQty < 3) {
    return {
      type: "neutral",
      message: "Buy $50+ or 5+ items for FREE shipping",
      icon: "🚚",
    };
  }

  return null;
});

// Utility methods
const handleImageError = (e) => {
  e.target.src = "/placeholder.jpg";
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
};

// Quantity methods
const increaseQuantity = async (item) => {
  if (item.quantity >= item.stock) {
    console.warn("⚠️ Cannot increase - max stock reached");
    return;
  }

  try {
    updateLoading.value = true;
    await cartStore.updateQuantity(item._id, item.quantity + 1);
  } catch (error) {
    console.error("Failed to update quantity:", error);
  } finally {
    updateLoading.value = false;
  }
};

const decreaseQuantity = async (item) => {
  if (item.quantity <= 1) {
    console.warn("Cannot decrease - minimum quantity is 1");
    return;
  }

  try {
    updateLoading.value = true;
    await cartStore.updateQuantity(item._id, item.quantity - 1);
  } catch (error) {
    console.error("Failed to update quantity:", error);
  } finally {
    updateLoading.value = false;
  }
};

// Remove methods
const confirmRemoveItem = (itemId) => {
  itemToRemove.value = itemId;
  confirmAction.value = "remove";
  showRemoveModal.value = true;
};

const confirmClearSelected = () => {
  confirmAction.value = "clear";
  showRemoveModal.value = true;
};

const executeRemoval = async () => {
  try {
    removeLoading.value = true;

    if (confirmAction.value === "clear") {
      // Remove all selected items
      const itemsToRemove = Array.from(selectedItems.value);
      for (const itemId of itemsToRemove) {
        await cartStore.removeItem(itemId);
      }
      selectedItems.value.clear();
    } else if (confirmAction.value === "remove") {
      await cartStore.removeItem(itemToRemove.value);
      selectedItems.value.delete(itemToRemove.value);
    }

    showRemoveModal.value = false;
    itemToRemove.value = null;
    confirmAction.value = null;
  } catch (error) {
    console.error("Failed to remove:", error);
  } finally {
    removeLoading.value = false;
  }
};

// Navigation methods
const goToCheckout = () => {
  if (selectedCount.value === 0) return;
  router.push("/checkout");
};

const goToShop = () => {
  router.push("/shop");
};

onMounted(async () => {
  await cartStore.fetchCart();
  // Select all items by default
  selectedItems.value = new Set(formattedItems.value.map((item) => item._id));
  selectAll.value = true;
});
</script>

<style scoped>
/* Gradient Background */
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

/* Backdrop Blur */
.backdrop-blur-xl {
  backdrop-filter: blur(16px);
}

/* Smooth Transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #fb7185, #a78bfa);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #f43f5e, #8b5cf6);
}

/* List Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
}

.list-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.9) translateY(20px);
}

/* Hover Effects */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* Loading Animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Pulse Animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
