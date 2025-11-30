<template>
  <div class="space-y-6">
    <div
      class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl"
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-red-600">Wishlist</h2>
        <button
          v-if="wishlistStore.wishlistCount > 0"
          @click="$emit('clear-wishlist')"
          class="text-sm text-gray-500 bg-white/90 hover:text-red-700"
        >
          Clear All
        </button>
      </div>

      <!-- Loading State -->
      <div
        v-if="wishlistStore.loading"
        class="flex items-center justify-center py-12"
      >
        <div
          class="w-8 h-8 border-b-2 rounded-full animate-spin border-rose-400"
        ></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="wishlistStore.isEmpty" class="py-12 text-center">
        <div class="mb-4 text-6xl">💝</div>
        <p class="text-gray-500">Your wishlist is empty</p>
        <p class="mt-2 text-sm text-gray-400">
          Add products you love to your wishlist
        </p>
      </div>

      <!-- Wishlist Items -->
      <div v-else class="grid gap-4 md:grid-cols-2">
        <div
          v-for="item in wishlistStore.formattedWishlistItems"
          :key="item._id"
          class="p-4 transition-all duration-200 bg-white border border-gray-100 rounded-xl hover:shadow-md"
        >
          <div class="flex gap-4">
            <img
              :src="getProductImage(item.product)"
              :alt="item.product?.name"
              class="object-cover w-20 h-20 border border-gray-100 rounded-lg"
              @error="handleImageError"
            />
            <div class="flex-1">
              <h3 class="font-semibold text-gray-700 line-clamp-2">
                {{ item.product?.name }}
              </h3>
              <div class="flex items-center gap-2 mt-1">
                <div class="font-semibold text-rose-600">
                  {{
                    formatCurrency(
                      item.product?.displayPrice || item.product?.price
                    )
                  }}
                </div>
                <div
                  v-if="item.product?.salePrice"
                  class="text-sm text-gray-400 line-through"
                >
                  {{ formatCurrency(item.product?.price) }}
                </div>
              </div>

              <!-- Price Drop Indicator -->
              <div
                v-if="item.isPriceLower"
                class="mt-1 text-xs text-emerald-600"
              >
                ⬇️ Price dropped by {{ formatCurrency(item.priceDiff) }}
              </div>

              <div class="flex gap-2 mt-3">
                <button
                  @click="$emit('move-to-cart', item.product._id)"
                  class="px-3 py-1 text-xs rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200"
                >
                  Add to Cart
                </button>
                <button
                  @click="$emit('remove-item', item.product._id)"
                  class="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Price Drop Summary -->
      <div
        v-if="wishlistStore.itemsWithPriceDrops.length > 0"
        class="p-4 mt-6 border border-emerald-200 bg-emerald-50 rounded-xl"
      >
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">💰</span>
          <h3 class="font-semibold text-emerald-700">Price Drops Detected!</h3>
        </div>
        <p class="text-sm text-emerald-600">
          {{ wishlistStore.itemsWithPriceDrops.length }} items have lower
          prices. Save up to {{ formatCurrency(wishlistStore.totalSavings) }}!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  wishlistStore: {
    type: Object,
    required: true,
  },
});

defineEmits(["clear-wishlist", "remove-item", "move-to-cart"]);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
};
const getProductImage = (product) => {
  // Check if product exists first
  if (!product) {
    console.warn("Product is undefined or null");
    return "/placeholder.jpg";
  }

  // Check images array
  if (
    product.images &&
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    const firstImage = product.images[0];
    return firstImage?.url || firstImage || "/placeholder.jpg";
  }

  // Check image array
  if (
    product.image &&
    Array.isArray(product.image) &&
    product.image.length > 0
  ) {
    const firstImage = product.image[0];
    return firstImage?.url || firstImage || "/placeholder.jpg";
  }

  // Check image object
  if (product.image && typeof product.image === "object" && product.image.url) {
    return product.image.url;
  }

  // Check image string
  if (product.image && typeof product.image === "string") {
    return product.image;
  }

  console.warn("No valid image found for product:", product.name);
  return "/placeholder.jpg";
};
const handleImageError = (event) => {
  console.error("Image failed to load:", event.target.src);
  event.target.src = "/placeholder.jpg";
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>