<template>
  <div v-if="recentProducts.length > 0" class="recently-viewed">
    <h3 class="mb-6 text-xl font-bold">Recently Viewed</h3>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
      <router-link
        v-for="product in recentProducts"
        :key="product._id"
        :to="`/products/${product._id}`"
        class="p-2 transition-all duration-200 bg-white border border-gray-200 rounded-lg group hover:border-rose-300 hover:shadow-md"
      >
        <div class="mb-2 overflow-hidden bg-gray-100 rounded-lg aspect-square">
          <img
            :src="getProductImage(product)"
            :alt="product.name"
            class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            @error="handleImageError"
          />
        </div>

        <h4
          class="overflow-hidden text-xs font-medium text-gray-900 transition-colors group-hover:text-rose-600 line-clamp-2"
        >
          {{ product.name }}
        </h4>

        <p class="mt-1 text-xs font-bold text-gray-900">
          ${{ formatPrice(product.price) }}
        </p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { getProductApi } from "../../service/product.service";

const route = useRoute();
const recentProducts = ref([]);
const loading = ref(false);

async function loadRecentlyViewed() {
  try {
    loading.value = true;
    const recentIds = JSON.parse(
      localStorage.getItem("recentlyViewed") || "[]"
    );

    console.log("📦 Loading recently viewed:", {
      totalIds: recentIds.length,
      ids: recentIds,
    });

    if (recentIds.length === 0) {
      console.log("⚠️ No recently viewed products");
      return;
    }

    const currentProductId = route.params.id;
    const filteredIds = recentIds.filter((id) => id !== currentProductId);

    console.log("🔍 Filtered IDs:", {
      currentProductId,
      filteredCount: filteredIds.length,
    });

    const products = [];

    for (const id of filteredIds.slice(0, 12)) {
      try {
        const res = await getProductApi(id);

        // ✅ FIXED: Check multiple possible response structures
        let productData = null;

        if (res.data.productData) {
          productData = res.data.productData;
        } else if (res.data.product) {
          productData = res.data.product;
        } else if (res.data.data?.product) {
          productData = res.data.data.product;
        }

        if (productData && productData._id) {
          products.push(productData);
          console.log("✅ Loaded product:", productData.name);
        } else {
          console.warn("⚠️ Invalid product data for ID:", id);
        }
      } catch (err) {
        console.error("❌ Failed to load product:", id, err);
      }
    }

    recentProducts.value = products;
    console.log("✅ Total recently viewed products loaded:", products.length);
  } catch (err) {
    console.error("❌ Failed to load recently viewed:", err);
  } finally {
    loading.value = false;
  }
}

function getProductImage(product) {
  if (Array.isArray(product.image) && product.image.length > 0) {
    const mainImage = product.image.find((img) => img.isMain);
    if (mainImage?.url) {
      return mainImage.url;
    }
    return product.image[0]?.url || product.image[0] || "/placeholder.png";
  }

  if (
    product.images &&
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    return product.images[0]?.url || product.images[0] || "/placeholder.png";
  }

  // ✅ PRIORITY 3: Check single image object
  if (
    product.image &&
    typeof product.image === "object" &&
    !Array.isArray(product.image)
  ) {
    return product.image.url || "/placeholder.png";
  }

  // ✅ PRIORITY 4: Check single image string
  if (product.image && typeof product.image === "string") {
    return product.image;
  }

  // ✅ PRIORITY 5: Fallback to imageUrl
  if (product.imageUrl) {
    return product.imageUrl;
  }

  return "/placeholder.png";
}

function handleImageError(event) {
  event.target.src = "/placeholder.png";
}

function formatPrice(price) {
  if (!price) return "0.00";
  return Number(price).toFixed(2);
}

watch(
  () => route.params.id,
  () => {
    loadRecentlyViewed();
  }
);

onMounted(() => {
  loadRecentlyViewed();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>