<template>
  <div class="w-full h-fit bg-[#f9f9f9] rounded-md">
    <!-- title flash sale -->
    <div class="flex justify-between w-full p-12">
      <div class="flex">
        <h2 class="text-xl font-bold">Newest product</h2>
      </div>
      <div class="text-[#5a4098]">See more</div>
    </div>
    <!-- end title header -->

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center h-48">
      <Loading />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center h-48">
      <div class="text-red-500">{{ error }}</div>
    </div>

    <!-- list product -->
    <div v-else class="relative flex w-full gap-4 p-4">
      <div
        class="absolute z-10 flex justify-center items-center top-[45%] -right-5 w-[50px] h-[50px] cursor-pointer bg-white gb-shadow rounded-full"
        @click="mySwiper?.slideNext()"
      >
        <i class="text-2xl ri-arrow-right-s-line"></i>
      </div>
      <div
        class="absolute z-10 flex justify-center items-center top-[45%] -left-5 w-[50px] h-[50px] cursor-pointer bg-white gb-shadow rounded-full"
        @click="mySwiper?.slidePrev()"
      >
        <i class="text-2xl ri-arrow-left-s-line"></i>
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
            <CartProduct :product="product" />
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
import CartProduct from "./product/CartProduct.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import Loading from "../components/Loading.vue";
const mySwiper = ref(null);
const products = ref([]);
const error = ref(null);
const loading = ref(false);
const onSwiper = (swiper) => {
  mySwiper.value = swiper;
  console.log(swiper);
};

const fetchNewProducts = async () => {
  try {
    loading.value = true;
    error.value = null;
    const res = await getNewProductApi();
    console.log("API response:", res);

    // Sửa lại logic kiểm tra cấu trúc response
    if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
      products.value = res.data.data.map((p) => ({
        ...p,
        image:
          (Array.isArray(p.image) ? p.image[0]?.url : p.image) ||
          "/placeholder.jpg",
      }));
    } else if (res && res.data && res.data.data && res.data.data.products) {
      products.value = res.data.data.products.map((p) => ({
        ...p,
        image:
          (Array.isArray(p.image) ? p.image[0]?.url : p.image) ||
          "/placeholder.jpg",
      }));
    } else {
      console.warn("Unexpected API response structure:", res);
      products.value = [];
    }
    console.log("new products: ", products.value);
  } catch (err) {
    console.error("Error fetching new products:", err);
    error.value = "Failed to load products. Please try again later.";
  } finally {
    loading.value = false;
  }
};
onBeforeMount(async () => {
  await fetchNewProducts();
});
</script>

