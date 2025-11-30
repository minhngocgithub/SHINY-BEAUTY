<template>
  <div class="flex py-12 category-guidance-section bg-gray-50">
    <div class="px-4 mx-auto">
      <div class="grid mb-8 place-content-center">
        <h2 class="mb-2 text-2xl font-bold text-gray-900">
          Need a Little Guidance?
        </h2>
        <p class="text-gray-600">Check out what's popular now.</p>
      </div>

      <div
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8"
      >
        <CategoryCard
          v-for="category in categories"
          :key="category.id"
          :category="category"
          @click="handleCategoryClick(category)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import CategoryCard from "../components/atoms/CategoryCard.vue";

const router = useRouter();

const categories = ref([
  {
    id: 1,
    name: "Value Sets",
    icon: "ShoppingBagIcon",
    color: "green",
    route: "/shop/makeup/value-gift-sets-makeup",
  },
  {
    id: 2,
    name: "Fragrance",
    icon: "BeakerIcon",
    color: "gray",
    route: "/shop/fragrance",
  },
  {
    id: 3,
    name: "Face Moisturizers",
    icon: "SparklesIcon",
    color: "green",
    route: "/shop/skincare/moisturizers",
  },
  {
    id: 4,
    name: "Lip",
    icon: "HeartIcon",
    color: "red",
    route: "/shop/makeup/lips-makeup",
  },
  {
    id: 5,
    name: "Best Sellers",
    icon: "CubeIcon",
    color: "blue",
    route: "/shop/new/best-sellers",
  },
  {
    id: 6,
    name: "Foundation",
    icon: "SwatchIcon",
    color: "blue",
    route: "/shop/makeup/face-makeup/foundation",
  },
  {
    id: 7,
    name: "Trending on Social",
    icon: "FireIcon",
    color: "orange",
    route: "/shop/new/trending-social",
  },
  {
    id: 8,
    name: "Sale",
    icon: "TagIcon",
    color: "red",
    route: "/shop/sale-offers",
  },
]);

const handleCategoryClick = (category) => {
  router.push(category.route);
};
</script>