<template>
  <div
    :class="`flex flex-col h-[330px] overflow-hidden bg-white rounded-xl ${width} relative group shadow-[0_3px_10px_rgb(0,0,0,0.3)]`"
    @mouseenter="showQuickLook = true"
    @mouseleave="showQuickLook = false"
  >
    <!-- Primary Badge -->
    <div v-if="primaryBadge" class="absolute z-30 top-2 left-2">
      <div
        :class="`px-3 py-1.5 text-xs font-semibold text-white rounded-full shadow-lg bg-gradient-to-r ${primaryBadge.class}`"
      >
        {{ primaryBadge.label }}
      </div>
    </div>

    <!-- Sale Program Badge -->
    <div v-if="shouldShowSaleProgramBadge" class="absolute z-30 top-2 right-2">
      <div
        :class="`px-3 py-1.5 text-xs font-semibold text-white rounded-full shadow-lg bg-gradient-to-r ${saleProgramBadge.class}`"
      >
        {{ saleProgramBadge.text }}
      </div>
    </div>

    <!-- Quick Look Overlay -->
    <div
      v-show="showQuickLook"
      class="absolute inset-0 z-20 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-20"
    >
      <button
        @click.stop.prevent="openQuickLook"
        class="px-6 py-2 text-sm font-medium text-white transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
      >
        Quicklook
      </button>
    </div>

    <!-- Image Section -->
    <div @click="goToProductDetail" class="cursor-pointer">
      <LazyImg
        class-style="h-[180px] object-cover w-full flex-shrink-0"
        :src="productImage"
        :alt="product.name"
      />
    </div>

    <!-- Content Section -->
    <div class="flex flex-col flex-1 p-3">
      <!-- Brand -->
      <p class="text-sm font-semibold text-[#191919] truncate h-5 mb-2">
        {{ product.brand }}
      </p>

      <!-- Product Name -->
      <p
        @click="goToProductDetail"
        class="text-sm font-semibold text-[#363636] h-10 mb-2 leading-5 line-clamp-2 cursor-pointer hover:text-[#f88113] transition-colors"
      >
        {{ product.name }}
      </p>

      <div class="mb-2">
        <div v-if="hasActiveSale" class="flex items-center gap-2">
          <span class="text-lg font-bold text-red-600">
            ${{ displayPrice }}
          </span>
          <span class="text-sm text-gray-400 line-through">
            ${{ originalPrice }}
          </span>
          <span
            v-if="discountPercentage > 0"
            class="text-xs font-semibold text-red-600"
          >
            -{{ discountPercentage }}%
          </span>
        </div>
        <div v-else>
          <span class="text-lg font-bold text-[#f88113]">
            ${{ originalPrice }}
          </span>
        </div>
      </div>

      <!-- Rating & Sold Info -->
      <div class="flex items-center gap-2 mt-auto text-xs text-gray-600">
        <div class="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-4 h-4 text-[#f88113]"
          >
            <path
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
          <span>{{ productRating }}</span>
        </div>
        <span class="text-gray-400">|</span>
        <span>{{ soldCount }} sold</span>
      </div>
    </div>
    <QuickLookModal
      :is-open="isQuickLookOpen"
      :product="product"
      @close="isQuickLookOpen = false"
      @add-to-cart="handleAddToCart"
      @add-to-wishlist="handleAddToWishlist"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import LazyImg from "../atoms/LazyImg.vue";
import QuickLookModal from "./QuickLookModal.vue";
import { useProductStore } from "../../store/product.store";
import { useSaleProgramStore } from "../../store/saleProgram.store";
import { useWishlistStore } from "../../store/wishlist.store";
import { useCartStore } from "../../store/cart.store";

const router = useRouter();

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  width: {
    type: String,
    default: "w-[200px]",
  },
});

const emit = defineEmits(["add-to-cart", "add-to-wishlist"]);

const productStore = useProductStore();
const saleProgramStore = useSaleProgramStore();
const wishlistStore = useWishlistStore();
const cartStore = useCartStore();

const showQuickLook = ref(false);
const isQuickLookOpen = ref(false);

const hasBackendSale = computed(() => {
  const result = !!(
    props.product.hasSale ||
    props.product.activeSaleProgram ||
    (props.product.finalPrice && props.product.finalPrice < props.product.price)
  );
  return result;
});

const hasDirectSale = computed(() => {
  if (!props.product.salePrice || !props.product.price) {
    return false;
  }
  if (props.product.salePrice >= props.product.price) {
    return false;
  }

  if (props.product.saleStartDate && props.product.saleEndDate) {
    const now = new Date();
    const startDate = new Date(props.product.saleStartDate);
    const endDate = new Date(props.product.saleEndDate);
    return now >= startDate && now <= endDate;
  }
  return props.product.isOnSale === true;
});

// ✅ PRIORITY 3: Check flash sale
const hasFlashSale = computed(() => {
  if (!props.product.flashSale?.isFlashSale) {
    return false;
  }

  if (props.product.saleEndDate) {
    const now = new Date();
    const endDate = new Date(props.product.saleEndDate);
    return now <= endDate;
  }

  return true;
});

const hasActiveSale = computed(() => {
  return hasBackendSale.value || hasDirectSale.value || hasFlashSale.value;
});

// Get sale program from backend or fallback to frontend store
const activeSaleProgram = computed(() => {
  if (props.product.activeSaleProgram) {
    return props.product.activeSaleProgram;
  }

  // Priority 2: Fallback to frontend store lookup
  return saleProgramStore.getProgramForProduct(props.product);
});

const shouldShowSaleProgramBadge = computed(() => {
  return activeSaleProgram.value && !hasDirectSale.value && !hasFlashSale.value;
});

const primaryBadge = computed(() => {
  if (hasActiveSale.value && discountPercentage.value > 0) {
    return {
      type: "sale",
      label: `-${discountPercentage.value}%`,
      class: "from-red-500 to-pink-500",
    };
  }

  if (props.product.isBestSeller) {
    return {
      type: "bestseller",
      label: "Best Seller",
      class: "from-amber-500 to-orange-500",
    };
  }

  if (props.product.isNewProduct) {
    return {
      type: "new",
      label: "New",
      class: "from-pink-500 to-rose-500",
    };
  }

  return null;
});

const saleProgramBadge = computed(() => {
  if (!activeSaleProgram.value) return null;

  if (activeSaleProgram.value.badge) {
    return activeSaleProgram.value.badge;
  }
  return saleProgramStore.getProgramBadge(activeSaleProgram.value);
});

const originalPrice = computed(() => {
  if (props.product.originalPrice) {
    return props.product.originalPrice.toFixed(2);
  }
  return (props.product.price || 0).toFixed(2);
});

const displayPrice = computed(() => {
  if (
    props.product.finalPrice &&
    props.product.finalPrice < props.product.price
  ) {
    return props.product.finalPrice.toFixed(2);
  }

  if (
    props.product.currentPrice &&
    props.product.currentPrice < props.product.price
  ) {
    return props.product.currentPrice.toFixed(2);
  }
  if (hasDirectSale.value && props.product.salePrice) {
    return props.product.salePrice.toFixed(2);
  }
  if (
    activeSaleProgram.value &&
    activeSaleProgram.value.benefits?.discountPercentage
  ) {
    const discount =
      (props.product.price *
        activeSaleProgram.value.benefits.discountPercentage) /
      100;
    return (props.product.price - discount).toFixed(2);
  }

  return originalPrice.value;
});

const discountPercentage = computed(() => {
  if (
    props.product.discountPercentage &&
    props.product.discountPercentage > 0
  ) {
    return props.product.discountPercentage;
  }

  // Priority 2: Calculate from prices
  if (hasActiveSale.value) {
    const original = parseFloat(originalPrice.value);
    const display = parseFloat(displayPrice.value);
    if (original > display) {
      return Math.round(((original - display) / original) * 100);
    }
  }

  return 0;
});

const productImage = computed(() => {
  // Priority 1: Use main image for SEO
  if (
    props.product.image &&
    Array.isArray(props.product.image) &&
    props.product.image.length > 0
  ) {
    const mainImage = props.product.image.find((img) => img.isMain && img.url);
    if (mainImage) {
      return mainImage.url;
    }
    // Fallback to first image (ensure string)
    const first = props.product.image[0];
    if (typeof first === "string") return first;
    if (first && typeof first.url === "string") return first.url;
    return "/placeholder-product.jpg";
  }
  if (typeof props.product.image === "string") return props.product.image;
  if (props.product.imageUrl && typeof props.product.imageUrl === "string")
    return props.product.imageUrl;
  return "/placeholder-product.jpg";
});

const productRating = computed(() => {
  return (props.product.ratings?.average || props.product.rating || 0).toFixed(
    1
  );
});

const soldCount = computed(() => {
  return props.product.sold || 0;
});

const openQuickLook = () => {
  isQuickLookOpen.value = true;
};

const goToProductDetail = () => {
  if (props.product._id) {
    router.push(`/product/${props.product._id}`);
  }
};

const handleAddToCart = async (data) => {
  try {
    const result = await cartStore.addToCart({
      product: props.product,
      quantity: data.quantity || 1,
    });

    if (result.success) {
      emit("add-to-cart", { ...data, success: true, message: result.message });
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    emit("add-to-cart", { ...data, success: false, error: error.message });
  }
};

const handleAddToWishlist = async () => {
  try {
    const result = await wishlistStore.toggleWishlist(props.product);

    emit("add-to-wishlist", {
      product: props.product,
      success: true,
      action: result.action,
    });
  } catch (error) {
    console.error("Wishlist error:", error);
    emit("add-to-wishlist", {
      product: props.product,
      success: false,
      error: error.message,
    });
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