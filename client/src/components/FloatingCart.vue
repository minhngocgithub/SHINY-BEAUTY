<template>
  <div>
    <Transition name="cart-fade" appear>
      <div
        v-if="authStore.isLoggedIn"
        class="fixed z-50 flex items-center justify-center w-16 h-16 transition-all duration-300 transform rounded-full shadow-2xl cursor-pointer bottom-8 right-8 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 hover:shadow-rose-500/50 hover:scale-110 hover:rotate-12 active:scale-95 group"
        @click="toggleCart"
      >
        <div class="relative">
          <svg
            class="text-white transition-transform duration-300 w-7 h-7 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>

          <Transition name="badge-bounce">
            <div
              v-if="cartStore.cartCount > 0"
              class="absolute flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full shadow-lg bg-gradient-to-br from-orange-500 to-red-600 -top-2 -right-2 animate-pulse"
            >
              {{ cartStore.cartCount > 99 ? "99+" : cartStore.cartCount }}
            </div>
          </Transition>
        </div>

        <div
          class="absolute px-4 py-2 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-xl opacity-0 pointer-events-none -top-14 whitespace-nowrap group-hover:opacity-100 bg-gradient-to-r from-gray-800 to-gray-900"
        >
          View Cart ({{ cartStore.cartCount }}
          {{ cartStore.cartCount === 1 ? "item" : "items" }})
          <div
            class="absolute w-3 h-3 transform rotate-45 -translate-x-1/2 left-1/2 -bottom-1.5 bg-gray-900"
          ></div>
        </div>
      </div>
    </Transition>

    <!-- Cart Drawer -->
    <Transition name="drawer">
      <div
        v-if="isCartOpen"
        class="fixed inset-0 z-50 overflow-hidden"
        @click="closeCart"
      >
        <div
          class="absolute inset-0 transition-opacity bg-black/60 backdrop-blur-sm"
        ></div>

        <div class="absolute inset-y-0 right-0 flex max-w-full" @click.stop>
          <div class="w-screen max-w-md">
            <div class="flex flex-col h-full bg-white shadow-2xl">
              <!-- Header -->
              <div class="px-6 py-5 bg-[#1F2937]">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div>
                      <h2
                        class="flex items-center gap-2 text-xl font-bold text-white"
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
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Shopping Cart
                      </h2>
                      <p class="mt-1 text-sm text-white/80">
                        {{ cartStore.cartCount }}
                        {{ cartStore.cartCount === 1 ? "item" : "items" }}
                        <span
                          v-if="
                            selectedCount > 0 &&
                            selectedCount < cartStore.cartCount
                          "
                        >
                          • {{ selectedCount }} selected
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    @click="closeCart"
                    class="p-2 transition rounded-l text-[#fff] bg-[#1F2937] hover:text-white hover:scale-110"
                  >
                    <svg
                      class="w-6 h-6 bg"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Cart Items -->
              <div class="flex-1 px-6 py-4 overflow-y-auto bg-gray-50">
                <!-- Loading State -->
                <div
                  v-if="cartStore.loading"
                  class="flex items-center justify-center h-full"
                >
                  <div class="text-center">
                    <div
                      class="inline-block w-12 h-12 border-4 border-gray-200 rounded-full border-t-rose-500 animate-spin"
                    ></div>
                    <p class="mt-4 text-sm text-gray-500">
                      Loading your cart...
                    </p>
                  </div>
                </div>

                <!-- Empty State -->
                <div
                  v-else-if="cartStore.isEmpty"
                  class="flex flex-col items-center justify-center h-full text-center"
                >
                  <div
                    class="flex items-center justify-center w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-rose-100 to-purple-100"
                  >
                    <svg
                      class="w-16 h-16 text-rose-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 class="mb-2 text-xl font-bold text-gray-800">
                    Your cart is empty
                  </h3>
                  <p class="mb-6 text-gray-500">
                    Discover amazing products and add them to your cart!
                  </p>
                  <button
                    @click="closeCart"
                    class="px-8 py-3 font-semibold text-white transition-all shadow-lg rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 hover:shadow-xl"
                  >
                    Start Shopping
                  </button>
                </div>

                <!-- Cart Items List -->
                <div v-else class="space-y-3">
                  <!-- ✅ Shipping Suggestion Banner -->
                  <div
                    v-if="shippingSuggestion && selectedCount > 0"
                    class="p-3 rounded-lg border-2 transition-all"
                    :class="{
                      'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700':
                        shippingSuggestion.type === 'success',
                      'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700':
                        shippingSuggestion.type === 'info',
                      'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600':
                        shippingSuggestion.type === 'neutral',
                    }"
                  >
                    <div class="flex items-start gap-2">
                      <span class="text-xl flex-shrink-0">{{
                        shippingSuggestion.icon
                      }}</span>
                      <div class="flex-1">
                        <p
                          class="text-sm font-semibold"
                          :class="{
                            'text-green-700 dark:text-green-300':
                              shippingSuggestion.type === 'success',
                            'text-blue-700 dark:text-blue-300':
                              shippingSuggestion.type === 'info',
                            'text-gray-700 dark:text-gray-300':
                              shippingSuggestion.type === 'neutral',
                          }"
                        >
                          {{ shippingSuggestion.message }}
                        </p>
                        <!-- Progress bar for "almost there" states -->
                        <div
                          v-if="shippingSuggestion.progress"
                          class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700"
                        >
                          <div
                            class="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                            :style="{
                              width: `${shippingSuggestion.progress}%`,
                            }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <TransitionGroup name="list">
                    <label
                      v-if="!cartStore.isEmpty"
                      class="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        :checked="allSelected"
                        @change="toggleSelectAll"
                        class="w-5 h-5 text-white border-2 border-none rounded cursor-pointer focus:ring-2 focus:ring-white/50 focus:ring-offset-0"
                      />
                      <span class="text-sm font-semibold text-[#1F2937]"
                        >Choosen All</span
                      >
                    </label>
                    <div
                      v-for="item in formattedItems"
                      :key="item._id"
                      class="flex gap-3 p-4 transition-all duration-200 bg-white border border-gray-200 rounded-xl hover:shadow-md group"
                      :class="{
                        'ring-2 ring-rose-500': selectedItems.has(item._id),
                      }"
                    >
                      <div class="flex items-start pt-1">
                        <input
                          type="checkbox"
                          :checked="selectedItems.has(item._id)"
                          @change="toggleItemSelection(item._id)"
                          class="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer text-rose-500 focus:ring-2 focus:ring-rose-500 focus:ring-offset-0"
                        />
                      </div>
                      <div class="relative flex-shrink-0">
                        <img
                          :src="item.image"
                          :alt="item.name"
                          class="object-cover w-24 h-24 rounded-lg"
                          @error="handleImageError"
                        />
                        <div
                          v-if="item.hasDiscount"
                          class="absolute top-1 left-1 px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full"
                        >
                          -{{
                            Math.round(
                              ((item.originalPrice - item.displayPrice) /
                                item.originalPrice) *
                                100
                            )
                          }}%
                        </div>
                      </div>

                      <div class="flex-1 min-w-0">
                        <h3
                          class="mb-1 text-sm font-semibold text-gray-800 truncate transition-colors group-hover:text-rose-600"
                        >
                          {{ item.name }}
                        </h3>
                        <p v-if="item.brand" class="mb-2 text-xs text-gray-500">
                          {{ item.brand }}
                        </p>

                        <!-- Price -->
                        <div class="flex items-center gap-2 mb-3">
                          <span class="text-base font-bold text-gray-900">
                            {{ formatCurrency(item.displayPrice) }}
                          </span>
                          <span
                            v-if="item.hasDiscount"
                            class="text-xs text-gray-400 line-through"
                          >
                            {{ formatCurrency(item.originalPrice) }}
                          </span>
                        </div>

                        <!-- Quantity Controls -->
                        <div class="flex items-center justify-between">
                          <div
                            class="flex items-center overflow-hidden border-2 border-gray-200 rounded-lg"
                          >
                            <button
                              @click="decreaseQuantity(item)"
                              :disabled="updateLoading || item.quantity <= 1"
                              class="flex-shrink-0 p-2 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-3 text-rose-600"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                                />
                              </svg>
                            </button>
                            <span
                              class="w-12 text-sm font-bold text-center text-gray-800"
                              >{{ item.quantity }}</span
                            >
                            <button
                              @click="increaseQuantity(item)"
                              :disabled="
                                updateLoading ||
                                item.quantity >= (item.stock || 999)
                              "
                              class="flex-shrink-0 p-2 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-3 text-rose-600"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                                />
                              </svg>
                            </button>
                          </div>

                          <button
                            @click="confirmRemoveItem(item._id)"
                            :disabled="removeLoading"
                            class="flex-shrink-0 p-2 text-gray-400 transition bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 hover:text-rose-500"
                            title="Remove item"
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
                      </div>
                    </div>
                  </TransitionGroup>

                  <!-- Clear Cart Button -->
                  <button
                    v-if="cartStore.cartCount > 1"
                    @click="confirmClearCart"
                    :disabled="clearLoading"
                    class="w-1/3 py-3 text-sm font-semibold text-red-600 transition-colors border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                  >
                    {{ clearLoading ? "Clearing..." : "Clear All Items" }}
                  </button>
                </div>
              </div>

              <!-- Footer -->
              <div
                v-if="!cartStore.isEmpty"
                class="px-6 py-5 bg-white border-t-2 border-gray-200"
              >
                <div v-if="selectedCount === 0" class="mb-4 text-center">
                  <p
                    class="px-4 py-3 text-sm font-semibold text-orange-600 rounded-lg bg-orange-50"
                  >
                    ⚠️ Please select at least one item to checkout
                  </p>
                </div>
                <div v-else class="mb-4 space-y-2">
                  <div
                    v-if="selectedCount < formattedItems.length"
                    class="flex justify-between pb-2 mb-2 text-sm border-b border-gray-200"
                  >
                    <span class="text-gray-600">Selected Items</span>
                    <span class="font-semibold text-rose-600"
                      >{{ selectedCount }} of {{ formattedItems.length }}</span
                    >
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-semibold text-gray-900">{{
                      formatCurrency(calculateSelectedSubtotal())
                    }}</span>
                  </div>
                  <div
                    v-if="calculateSelectedDiscount() > 0"
                    class="flex justify-between text-sm"
                  >
                    <span class="text-gray-600">Discount</span>
                    <span class="font-semibold text-red-600"
                      >-{{ formatCurrency(calculateSelectedDiscount()) }}</span
                    >
                  </div>

                  <!-- ✅ Total WITHOUT shipping/tax (calculated at checkout) -->
                  <div
                    class="flex justify-between pt-3 text-lg font-bold border-t-2 border-gray-200"
                  >
                    <span class="text-gray-900">Tạm tính</span>
                    <span
                      class="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-purple-600"
                    >
                      {{
                        formatCurrency(
                          calculateSelectedSubtotal() -
                            calculateSelectedDiscount()
                        )
                      }}
                    </span>
                  </div>

                  <!-- Info note about shipping calculation -->
                  <p class="text-xs text-gray-500 text-center pt-2">
                    💡 Phí ship & thuế sẽ được tính khi thanh toán
                  </p>

                  <!-- Savings display -->
                  <div
                    v-if="calculateSelectedDiscount() > 0"
                    class="pt-2 text-center"
                  >
                    <p
                      class="inline-block px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full"
                    >
                      💰 Tiết kiệm được
                      {{ formatCurrency(calculateSelectedDiscount()) }}!
                    </p>
                  </div>
                </div>

                <button
                  @click="goToCheckout"
                  :disabled="cartStore.loading || selectedCount === 0"
                  class="w-full px-6 py-4 mb-3 font-bold text-white transition-all shadow-lg rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="selectedCount === 0"
                    >Select Items to Checkout</span
                  >
                  <span v-else
                    >Proceed to Checkout ({{ selectedCount }}
                    {{ selectedCount === 1 ? "item" : "items" }}) →</span
                  >
                </button>

                <button
                  @click="closeCart"
                  class="w-full px-6 py-3 font-semibold text-gray-700 transition-colors border-2 border-gray-300 rounded-xl hover:bg-gray-100"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Confirmation Modal -->
    <Transition name="modal">
      <div
        v-if="showConfirmModal"
        class="fixed inset-0 z-[60] flex items-center justify-center px-4"
        @click="showConfirmModal = false"
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
              {{ confirmAction === "clear" ? "Clear Cart?" : "Remove Item?" }}
            </h3>
            <p class="mb-6 text-gray-600">
              {{
                confirmAction === "clear"
                  ? "Are you sure you want to remove all items from your cart?"
                  : "Are you sure you want to remove this item from your cart?"
              }}
            </p>
          </div>
          <div class="flex gap-3">
            <button
              @click="showConfirmModal = false"
              :disabled="removeLoading || clearLoading"
              class="flex-1 py-3 font-semibold text-gray-800 transition-colors bg-gray-200 rounded-xl hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="executeRemoval"
              :disabled="removeLoading || clearLoading"
              class="flex-1 py-3 font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50"
            >
              {{ removeLoading || clearLoading ? "Removing..." : "Remove" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../store/auth.store";
import { useCartStore } from "../store/cart.store";
import { useRouter } from "vue-router";
import {
  calculateOrderPricing,
  formatShippingReason,
} from "../service/payment.service";

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const isCartOpen = ref(false);
const updateLoading = ref(false);
const removeLoading = ref(false);
const clearLoading = ref(false);
const showConfirmModal = ref(false);
const confirmAction = ref(null);
const itemToRemove = ref(null);
const selectedItems = ref(new Set());
const selectAll = ref(true);

const formattedItems = computed(() => {
  return cartStore.cartItems
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
        image: data.images?.[0]?.url || data.image?.url || "/placeholder.jpg",
        displayPrice: item.finalPrice || data.salePrice || data.price || 0,
        originalPrice: item.originalPrice || data.price || 0,
        quantity: item.quantity || 1,
        stock: data.stock || 999,
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

const toggleCart = async () => {
  if (!isCartOpen.value) {
    await cartStore.fetchCart();
    // Select all items by default when opening cart
    selectedItems.value = new Set(formattedItems.value.map((item) => item._id));
    selectAll.value = true;
  }
  isCartOpen.value = !isCartOpen.value;
};

const closeCart = () => {
  isCartOpen.value = false;
};

const handleImageError = (e) => {
  e.target.src = "/placeholder.jpg";
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
};

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

// ✅ Use centralized pricing calculation
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

  // Convert selected items to checkout format
  const checkoutItems = selectedItemsData.value.map((item) => ({
    product:
      item.itemType === "product"
        ? {
            _id: item._id,
            finalPrice: item.displayPrice,
            salePrice: item.displayPrice,
            price: item.originalPrice,
            freeShipping: false, // Would come from product data if available
          }
        : null,
    quantity: item.quantity,
  }));

  return calculateOrderPricing(
    checkoutItems,
    0, // loyaltyPoints
    0, // couponDiscount
    cartStore.cartSummary?.cartBenefits || {},
    {
      userLoyaltyTier: null,
      paymentMethod: "COD", // Default for cart preview
    }
  );
});

const calculateTax = () => pricingDetails.value.taxPrice;
const calculateTotal = () => pricingDetails.value.totalPrice;
const shippingFee = computed(() => pricingDetails.value.shippingPrice);
const shippingReasonText = computed(() =>
  formatShippingReason(pricingDetails.value.shippingReason)
);

// ✅ Shipping suggestion logic (like Shopee/Lazada)
const shippingSuggestion = computed(() => {
  const selected = selectedItemsData.value;
  if (selected.length === 0) return null;

  const subtotal = calculateSelectedSubtotal();
  const totalQty = selected.reduce((sum, item) => sum + item.quantity, 0);

  // Already has free shipping
  if (shippingFee.value === 0) {
    return {
      type: "success",
      message: "🎉 Bạn được miễn phí ship!",
      icon: "✅",
    };
  }

  // Close to subtotal threshold ($50)
  if (subtotal >= 40 && subtotal < 50) {
    const remaining = 50 - subtotal;
    return {
      type: "info",
      message: `Mua thêm $${remaining.toFixed(2)} để được FREESHIP!`,
      icon: "📦",
      progress: (subtotal / 50) * 100,
    };
  }

  // Close to quantity threshold (5 items)
  if (totalQty >= 3 && totalQty < 5) {
    const remaining = 5 - totalQty;
    return {
      type: "info",
      message: `Chọn thêm ${remaining} sản phẩm để được FREESHIP!`,
      icon: "🛍️",
      progress: (totalQty / 5) * 100,
    };
  }

  // Has shipping fee but far from free shipping
  if (subtotal < 40 && totalQty < 3) {
    return {
      type: "neutral",
      message: "Mua từ $50 hoặc 5 sản phẩm để FREESHIP",
      icon: "🚚",
    };
  }

  return null;
});

const increaseQuantity = async (item) => {
  if (item.quantity >= item.stock) {
    console.warn("⚠️ Cannot increase - max stock reached");
    return;
  }

  try {
    updateLoading.value = true;
    await cartStore.updateQuantity(item._id, item.quantity + 1);
  } catch (error) {
    console.warn(
      `Failed to update quantity: ${error.message || "Unknown error"}`
    );
  } finally {
    updateLoading.value = false;
  }
};

const decreaseQuantity = async (item) => {
  console.log("🔽 Decrease quantity:", item._id, "current:", item.quantity);

  if (item.quantity <= 1) {
    console.warn("⚠️ Cannot decrease - minimum quantity is 1");
    return;
  }

  try {
    updateLoading.value = true;
    await cartStore.updateQuantity(item._id, item.quantity - 1);
  } catch (error) {
    alert(`Failed to update quantity: ${error.message || "Unknown error"}`);
  } finally {
    updateLoading.value = false;
  }
};

const confirmRemoveItem = (itemId) => {
  itemToRemove.value = itemId;
  confirmAction.value = "remove";
  showConfirmModal.value = true;
};

const confirmClearCart = () => {
  confirmAction.value = "clear";
  showConfirmModal.value = true;
};

const executeRemoval = async () => {
  console.log(
    "🗑️ Execute removal:",
    confirmAction.value,
    "itemId:",
    itemToRemove.value
  );

  try {
    if (confirmAction.value === "clear") {
      clearLoading.value = true;
      await cartStore.clearCart();
    } else if (confirmAction.value === "remove") {
      removeLoading.value = true;
      await cartStore.removeItem(itemToRemove.value);
    }
    showConfirmModal.value = false;
    itemToRemove.value = null;
    confirmAction.value = null;
  } catch (error) {
    console.error("❌ Failed to remove:", error);
    alert(`Failed to remove: ${error.message || "Unknown error"}`);
  } finally {
    removeLoading.value = false;
    clearLoading.value = false;
  }
};

const goToCheckout = () => {
  closeCart();
  router.push("/checkout");
};

onMounted(() => {
  if (authStore.isLoggedIn) {
    cartStore.fetchCart().then(() => {
      // Select all items by default on mount
      selectedItems.value = new Set(
        formattedItems.value.map((item) => item._id)
      );
      selectAll.value = true;
    });
  }
});
</script>

<style scoped>
.cart-fade-enter-active,
.cart-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.cart-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9) rotate(-10deg);
}
.cart-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9) rotate(10deg);
}

.badge-bounce-enter-active {
  animation: bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
@keyframes bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
  }
}

.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease-in-out;
}
.drawer-enter-from .absolute.inset-0,
.drawer-leave-to .absolute.inset-0 {
  opacity: 0;
}
.drawer-enter-from .absolute.inset-y-0,
.drawer-leave-to .absolute.inset-y-0 {
  transform: translateX(100%);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
.list-move {
  transition: transform 0.3s ease;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.9);
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #62748e, #a855f7);
  border-radius: 4px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #1d293d, #9333ea);
}
</style>
