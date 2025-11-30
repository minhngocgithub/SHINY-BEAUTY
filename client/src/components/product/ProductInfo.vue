<template>
  <div class="space-y-6 product-info">
    <div v-if="primaryCategory" class="inline-block">
      <router-link
        :to="getCategoryLink(primaryCategory)"
        class="inline-flex items-center px-3 py-1 text-sm font-medium transition-colors rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200"
      >
        {{ primaryCategory.name }}
      </router-link>
    </div>

    <div>
      <div class="flex items-start justify-between gap-4 mb-2">
        <h1 class="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          {{ product.name }}
        </h1>
        <div
          :class="[
            'flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap',
            isInStock
              ? 'text-green-700 bg-green-100'
              : 'text-red-700 bg-red-100',
          ]"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              v-if="isInStock"
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
            <path
              v-else
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          {{ isInStock ? "In Stock" : "Out of Stock" }}
        </div>
      </div>

      <div class="mb-2">
        <router-link
          :to="`/brand/${encodeURIComponent(product.brand)}`"
          class="text-lg font-medium transition-colors text-rose-600 hover:text-rose-700"
        >
          {{ product.brand }}
        </router-link>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <div class="flex text-xl text-yellow-400">
          <span v-for="i in 5" :key="i">
            {{ i <= Math.floor(productRating) ? "★" : "☆" }}
          </span>
        </div>
        <span class="text-lg font-semibold text-gray-900">
          {{ productRating.toFixed(1) }}
        </span>
      </div>

      <a
        href="#reviews"
        class="text-sm text-gray-600 transition-colors hover:text-rose-600"
      >
        ({{ reviewCount }} Reviews)
      </a>
    </div>

    <div
      class="border-2 rounded-lg border-rose-100 bg-gradient-to-br from-white to-rose-50"
    >
      <PriceSection :product="product" />
    </div>

    <div v-if="product.description">
      <p class="text-sm leading-relaxed text-gray-700 md:text-base">
        {{ product.description }}
      </p>
    </div>

    <div v-if="productSizes.length > 0" class="space-y-3">
      <label class="text-sm font-semibold text-gray-900">Size/Volume</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="size in productSizes"
          :key="size"
          @click="selectedSize = size"
          :class="[
            'px-4 py-2 text-sm font-medium border-2 rounded-lg transition-all',
            selectedSize === size
              ? 'border-green-600 bg-green-50 text-green-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
          ]"
        >
          {{ size }}
        </button>
      </div>
    </div>

    <AddToCart
      :product="product"
      :is-processing="isProcessing"
      @add-to-cart="handleAddToCart"
      @buy-now="handleBuyNow"
    />

    <ActionButton :product="product" @share="handleShare" />

    <div
      v-if="displayCategories.length > 0"
      class="pt-4 space-y-2 border-t border-gray-200"
    >
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <span class="font-semibold text-gray-700">Tags:</span>
        <router-link
          v-for="cat in displayCategories"
          :key="cat._id"
          :to="getCategoryLink(cat)"
          class="px-2 py-1 text-xs text-gray-700 transition-colors bg-gray-100 rounded hover:bg-rose-100 hover:text-rose-700"
        >
          {{ cat.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import AddToCart from "./AddToCart.vue";
import ActionButton from "./ActionButton.vue";
import PriceSection from "./PriceSection.vue";
import { useCartStore } from "../../store/cart.store";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["add-to-cart", "buy-now"]);

const router = useRouter();
const cartStore = useCartStore();

const selectedSize = ref(null);

const primaryCategory = computed(() => {
  if (!props.product.category || !Array.isArray(props.product.category)) {
    return null;
  }
  return props.product.category[0] || null;
});

const displayCategories = computed(() => {
  if (!props.product.category || !Array.isArray(props.product.category)) {
    return [];
  }

  const seen = new Set();
  return props.product.category.filter((cat) => {
    if (!cat || !cat._id) return false;
    if (seen.has(cat._id)) return false;
    seen.add(cat._id);
    return true;
  });
});

const productSizes = computed(() => {
  if (props.product.sizes && Array.isArray(props.product.sizes)) {
    return props.product.sizes;
  }
  return [];
});

const productRating = computed(() => {
  return props.product.ratings?.average || props.product.rating || 0;
});

const reviewCount = computed(() => {
  return props.product.ratings?.count || 0;
});

const isInStock = computed(() => {
  const stock = (props.product.countInstock || 0) > 0;
  console.log("📦 Stock Check:", {
    productName: props.product.name,
    countInstock: props.product.countInstock,
    isInStock: stock,
  });
  return stock;
});

const getCategoryLink = (cat) => {
  if (!cat) return "/shop";

  const categories = props.product.category || [];
  const buildParentChain = (category) => {
    const chain = [];
    let current = category;
    while (current) {
      chain.unshift(current);

      if (current.parent) {
        const parentId =
          typeof current.parent === "object"
            ? current.parent._id
            : current.parent;
        current = categories.find((c) => c._id === parentId);
      } else {
        current = null;
      }
    }

    return chain;
  };

  const chain = buildParentChain(cat);

  let path = "/shop";
  for (const c of chain) {
    const slug = c.slug || c.name?.toLowerCase().replace(/\s+/g, "-");
    path += `/${slug}`;
  }

  return path;
};

const handleAddToCart = async (data) => {
  try {
    const result = await cartStore.addToCart({
      product: props.product,
      quantity: data.quantity || 1,
      selectedSize: selectedSize.value,
    });

    if (result.success) {
      emit("add-to-cart", {
        ...data,
        selectedSize: selectedSize.value,
        success: true,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    emit("add-to-cart", {
      ...data,
      selectedSize: selectedSize.value,
      success: false,
      error: error.message,
    });
  }
};

const handleBuyNow = async (data) => {
  try {
    const result = await cartStore.addToCart({
      product: props.product,
      quantity: data.quantity || 1,
      selectedSize: selectedSize.value,
    });

    if (result.success) {
      router.push("/checkout");

      emit("buy-now", {
        ...data,
        selectedSize: selectedSize.value,
        success: true,
      });
    }
  } catch (error) {
    console.error("Buy now error:", error);
    emit("buy-now", {
      ...data,
      selectedSize: selectedSize.value,
      success: false,
      error: error.message,
    });
  }
};

const handleShare = () => {
  const url = window.location.href;
  const title = props.product.name;

  if (navigator.share) {
    navigator
      .share({
        title,
        url,
      })
      .catch((err) => console.error("Share error:", err));
  } else {
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
        url
      )}&description=${encodeURIComponent(title)}`,
    };

    const selectedPlatform = prompt(
      "Share on:\n1. Facebook\n2. Twitter\n3. Pinterest\n4. Copy Link"
    );

    if (selectedPlatform === "1") {
      window.open(shareUrls.facebook, "_blank", "width=600,height=400");
    } else if (selectedPlatform === "2") {
      window.open(shareUrls.twitter, "_blank", "width=600,height=400");
    } else if (selectedPlatform === "3") {
      window.open(shareUrls.pinterest, "_blank", "width=600,height=400");
    } else if (selectedPlatform === "4") {
      navigator.clipboard.writeText(url);
    }
  }
};
</script>