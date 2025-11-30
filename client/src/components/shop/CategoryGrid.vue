<template>
  <section class="w-full py-12 bg-gray-50 md:py-16">
    <div class="px-4 mx-auto max-w-7xl lg:px-8">
      <!-- Section Title -->
      <div class="mb-10 text-center" data-aos="fade-up" data-aos-duration="800">
        <h2 class="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
          Shop by Category
        </h2>
        <p class="text-gray-600">Find exactly what you're looking for</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-48">
        <Loading />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center h-48">
        <div class="text-red-500">{{ error }}</div>
      </div>

      <!-- Categories Grid -->
      <div
        v-else
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        data-aos="fade-up"
        data-aos-delay="200"
        data-aos-duration="800"
      >
        <div
          v-for="category in categories"
          :key="category._id"
          @click="handleCategoryClick(category)"
          class="p-6 transition-all duration-300 bg-white border border-gray-200 cursor-pointer rounded-xl hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 group"
        >
          <div class="flex flex-col items-center gap-3 text-center">
            <!-- Icon -->
            <div
              class="flex items-center justify-center w-16 h-16 transition-colors rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 group-hover:from-rose-100 group-hover:to-pink-100"
            >
              <span class="text-3xl">{{ category.icon || "📦" }}</span>
            </div>

            <!-- Category Name -->
            <h3
              class="text-sm font-semibold leading-tight text-gray-900 transition-colors group-hover:text-rose-600"
            >
              {{ category.name }}
            </h3>

            <!-- Product Count (optional) -->
            <span
              v-if="category.productCount > 0"
              class="text-xs text-gray-500"
            >
              {{ category.productCount }} items
            </span>
          </div>
        </div>
      </div>

      <!-- No Categories Message -->
      <div
        v-if="!loading && !error && categories.length === 0"
        class="flex items-center justify-center h-48"
      >
        <div class="text-gray-500">No categories available</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getRootCategoriesWithChildrenApi } from "../../service/category.service";
import Loading from "../Loading.vue";

const router = useRouter();
const categories = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchCategories = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await getRootCategoriesWithChildrenApi();

    if (response.data && response.data.success) {
      // Get root categories only (level 0)
      categories.value = response.data.categories || [];
    }
  } catch (err) {
    console.error("Error fetching categories:", err);
    error.value = "Failed to load categories";
  } finally {
    loading.value = false;
  }
};

const handleCategoryClick = (category) => {
  // Navigate to category products page
  router.push(`/shop/${category.slug}`);
};

onMounted(() => {
  fetchCategories();
});
</script>