<template>
  <div class="w-full h-fit bg-[#f9f9f9] rounded-md px-4">
    <!-- Title -->
    <div class="flex justify-between w-full p-12">
      <div
        class="flex items-center justify-center gap-2 text-sm font-medium tracking-wider uppercase text-stone-500"
      >
        <h2 class="text-xl font-bold">New Arrivals</h2>
        <span class="w-12 h-px bg-stone-500"></span>
      </div>
      <div
        class="text-[#5a4098] hover:underline hover:text-rose-600 hidden md:block"
      >
        <router-link to="/products/sales">See more</router-link>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center h-48">
      <Loading />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center h-48">
      <div class="text-red-500">{{ error }}</div>
    </div>

    <!-- Products Swiper -->
    <div v-else class="relative flex w-full gap-4 p-4">
      <!-- Navigation Buttons -->
      <div
        class="absolute z-10 flex justify-center items-center top-[45%] -right-5 w-[50px] h-[50px] cursor-pointer bg-white gb-shadow rounded-full"
        @click="mySwiper?.slideNext()"
      >
        <svg
          class="w-5 h-5 mx-auto text-gray-600 transition-colors duration-200 hover:text-rose-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </div>
      <div
        class="absolute z-10 flex justify-center items-center top-[45%] -left-5 w-[50px] h-[50px] cursor-pointer bg-white gb-shadow rounded-full"
        @click="mySwiper?.slidePrev()"
      >
        <svg
          class="w-5 h-5 mx-auto text-gray-600 transition-colors duration-200 hover:text-rose-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
      </div>

      <swiper
        v-if="products.length > 0"
        style="padding: 0 8px 10px 8px"
        class="w-full pb-2"
        :slides-per-view="'auto'"
        :space-between="10"
        @swiper="onSwiper"
      >
        <swiper-slide
          v-for="product in products"
          :key="product._id || product.id"
          style="width: auto"
          class="w-fit"
        >
          <RouterLink :to="`/products/${product._id || product.id}`">
            <!-- ✅ OPTIMIZED: Pass sale info to card -->
            <CartProduct
              :product="product"
              :show-sale-price="true"
              :active-sale-program="getActiveSaleProgram(product)"
            />
          </RouterLink>
        </swiper-slide>
      </swiper>

      <!-- No products message -->
      <div v-else class="flex items-center justify-center w-full h-48">
        <div class="text-gray-500">No products found</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { getNewProductApi } from "../service/product.service";
import CartProduct from "./product/CardProduct.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import Loading from "./Loading.vue";
import { useSaleProgramStore } from "../store/saleProgram.store";

const mySwiper = ref(null);
const products = ref([]);
const error = ref(null);
const loading = ref(false);
const saleProgramStore = useSaleProgramStore();

const onSwiper = (swiper) => {
  mySwiper.value = swiper;
};

// Helper to get active sale program for product using store
const getActiveSaleProgram = (product) => {
  return saleProgramStore.getProgramForProduct(product);
};

const fetchNewArrivals = async () => {
  try {
    loading.value = true;
    error.value = null;
    // Fetch products
    const productsRes = await getNewProductApi();
    if (
      productsRes &&
      productsRes.data &&
      Array.isArray(productsRes.data.products)
    ) {
      products.value = productsRes.data.products;
    } else {
      console.warn("Unexpected API response structure:", productsRes);
      products.value = [];
    }
    // Ensure sale programs are loaded
    if (saleProgramStore.activePrograms.length === 0) {
      await saleProgramStore.fetchActivePrograms();
    }
  } catch (err) {
    console.error("Error fetching new products:", err);
    error.value = "Failed to load products. Please try again later.";
  } finally {
    loading.value = false;
  }
};

onBeforeMount(async () => {
  await fetchNewArrivals();
});
</script>