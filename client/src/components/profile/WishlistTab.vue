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
          class="p-4 transition-all duration-200 bg-white border border-gray-100 cursor-pointer rounded-xl hover:shadow-md hover:border-rose-200"
          @click="goToProductDetail(getItemData(item))"
        >
          <div class="flex gap-4">
            <div class="relative flex-shrink-0">
              <img
                :src="getProductImage(getItemData(item))"
                :alt="getItemData(item)?.name"
                class="object-cover w-20 h-20 border-2 border-gray-100 rounded-lg"
                @error="handleImageError"
              />
              <div
                v-if="getDiscountPercentage(item) > 0"
                class="absolute top-0 right-0 px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-bl-lg rounded-tr-lg"
              >
                -{{ getDiscountPercentage(item) }}%
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3
                class="font-semibold text-gray-700 transition-colors line-clamp-2 hover:text-rose-600"
              >
                {{ getItemData(item)?.name }}
              </h3>
              <p
                v-if="getItemData(item)?.brand"
                class="text-xs text-gray-500 mt-0.5"
              >
                {{ getItemData(item).brand }}
              </p>
              <div class="flex items-center gap-2 mt-1">
                <div class="font-semibold text-rose-600">
                  {{ formatCurrency(getDisplayPrice(item)) }}
                </div>
                <div
                  v-if="getDiscountPercentage(item) > 0"
                  class="text-sm text-gray-400 line-through"
                >
                  {{ formatCurrency(getOriginalPrice(item)) }}
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
                  @click.stop="$emit('move-to-cart', getItemData(item)._id)"
                  class="px-3 py-1 text-xs font-medium transition-colors rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200"
                >
                  Add to Cart
                </button>
                <button
                  @click.stop="$emit('remove-item', getItemData(item)._id)"
                  class="px-3 py-1 text-xs font-medium text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-rose-600"
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
import { useRouter } from "vue-router";

const router = useRouter();

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

const getItemData = (item) => {
  return item.product || item.bundle || item;
};

const getDisplayPrice = (item) => {
  const data = getItemData(item);
  if (!data) return 0;

  // Use pre-calculated prices from backend
  return parseFloat(
    data.finalPrice ||
      data.currentPrice ||
      data.salePrice ||
      data.displayPrice ||
      data.price ||
      0
  );
};

const getOriginalPrice = (item) => {
  const data = getItemData(item);
  if (!data) return 0;

  return parseFloat(data.originalPrice || data.price || 0);
};

const getDiscountPercentage = (item) => {
  const display = getDisplayPrice(item);
  const original = getOriginalPrice(item);

  if (original <= 0 || display >= original) return 0;
  return Math.round(((original - display) / original) * 100);
};

const getProductImage = (entity) => {
  if (!entity) {
    return "/placeholder-product.png";
  }

  // Try images array first (most common)
  if (
    entity.images &&
    Array.isArray(entity.images) &&
    entity.images.length > 0
  ) {
    const firstImage = entity.images[0];
    return firstImage?.url || firstImage || "/placeholder-product.png";
  }

  // Try image array
  if (entity.image && Array.isArray(entity.image) && entity.image.length > 0) {
    const firstImage = entity.image[0];
    return firstImage?.url || firstImage || "/placeholder-product.png";
  }

  // Try image object
  if (entity.image && typeof entity.image === "object" && entity.image.url) {
    return entity.image.url;
  }

  // Try image string
  if (entity.image && typeof entity.image === "string") {
    return entity.image;
  }

  return "/placeholder-product.png";
};

const handleImageError = (event) => {
  event.target.src = "/placeholder-product.png";
};

const goToProductDetail = (entity) => {
  if (!entity?._id) return;

  if (entity.bundlePrice || entity.items) {
    router.push(`/bundles/${entity._id}`);
  } else {
    router.push(`/products/${entity._id}`);
  }
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