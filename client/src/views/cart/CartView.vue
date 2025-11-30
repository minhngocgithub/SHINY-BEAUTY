<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Shopping Cart
        </h1>
        <p
          v-if="!isEmpty"
          class="mt-1 text-sm text-gray-600 dark:text-gray-400"
        >
          {{ cartCount }} {{ cartCount === 1 ? "item" : "items" }} in your cart
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading && cartItems.length === 0"
        class="flex justify-center py-16"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"
        ></div>
      </div>

      <!-- Empty Cart -->
      <EmptyCart v-else-if="isEmpty" @start-shopping="goToShop" />

      <!-- Cart Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          <CartItem
            v-for="item in cartItems"
            :key="item._id"
            :item="item"
            :loading="updateLoading"
            @update-quantity="handleUpdateQuantity"
            @remove="handleRemoveItem"
          />
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <CartSummary
            :summary="cartSummary"
            :loading="loading"
            @checkout="goToCheckout"
            @continue-shopping="goToShop"
          />
        </div>
      </div>

      <!-- Remove Confirmation Modal -->
      <div
        v-if="showRemoveModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
        @click.self="showRemoveModal = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Remove Item
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to remove this item from your cart?
          </p>
          <div class="flex gap-3">
            <button
              @click="confirmRemove"
              :disabled="removeLoading"
              class="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {{ removeLoading ? "Removing..." : "Remove" }}
            </button>
            <button
              @click="showRemoveModal = false"
              :disabled="removeLoading"
              class="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../../store/cart.store";
import { storeToRefs } from "pinia";
import CartItem from "../../components/cart/CartItem.vue";
import CartSummary from "../../components/cart/CartSummary.vue";
import EmptyCart from "../../components/cart/EmptyCart.vue";

const router = useRouter();
const cartStore = useCartStore();
const { cartItems, cartSummary, loading, isEmpty } = storeToRefs(cartStore);

const updateLoading = ref(false);
const removeLoading = ref(false);
const showRemoveModal = ref(false);
const itemToRemove = ref(null);

const cartCount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0);
});

const handleUpdateQuantity = async (itemId, newQuantity) => {
  try {
    updateLoading.value = true;
    await cartStore.updateCartItem(itemId, newQuantity);
  } catch (error) {
    console.error("Update quantity error:", error);
  } finally {
    updateLoading.value = false;
  }
};

const handleRemoveItem = (itemId) => {
  itemToRemove.value = itemId;
  showRemoveModal.value = true;
};

const confirmRemove = async () => {
  try {
    removeLoading.value = true;
    await cartStore.removeFromCart(itemToRemove.value);
    showRemoveModal.value = false;
    itemToRemove.value = null;
  } catch (error) {
    console.error("Remove item error:", error);
  } finally {
    removeLoading.value = false;
  }
};

const goToCheckout = () => {
  router.push("/checkout");
};

const goToShop = () => {
  router.push("/shop");
};

onMounted(async () => {
  await cartStore.fetchCart();
});
</script>
