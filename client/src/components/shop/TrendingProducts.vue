<template>
  <section class="w-full py-12 bg-white md:py-16">
    <div class="px-4 mx-auto max-w-7xl lg:px-8">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-10">
        <div data-aos="fade-right" data-aos-duration="800">
          <h2 class="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
            {{ title }}
          </h2>
          <p class="text-gray-600">{{ subtitle }}</p>
        </div>

        <router-link
          to="/shop/sales"
          class="text-rose-600 hover:text-rose-700 hover:underline"
          data-aos="fade-left"
          data-aos-duration="800"
        >
          See more →
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-48">
        <Loading />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center h-48">
        <div class="text-red-500">{{ error }}</div>
      </div>

      <!-- Products Carousel -->
      <div
        v-else
        class="relative"
        data-aos="fade-up"
        data-aos-delay="200"
        data-aos-duration="800"
      >
        <!-- Navigation Buttons -->
        <button
          @click="mySwiper?.slideNext()"
          class="absolute z-10 flex items-center justify-center w-12 h-12 transition-all duration-300 transform -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 -right-6 hover:scale-110 hover:shadow-xl disabled:opacity-50"
          :disabled="!mySwiper || isEnd"
        >
          <svg
            class="w-6 h-6 text-gray-600 transition-colors duration-200 hover:text-rose-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <button
          @click="mySwiper?.slidePrev()"
          class="absolute z-10 flex items-center justify-center w-12 h-12 transition-all duration-300 transform -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 -left-6 hover:scale-110 hover:shadow-xl disabled:opacity-50"
          :disabled="!mySwiper || isBeginning"
        >
          <svg
            class="w-6 h-6 text-gray-600 transition-colors duration-200 hover:text-rose-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <!-- Swiper Container -->
        <swiper
          v-if="products.length > 0"
          class="pb-4"
          :slides-per-view="'auto'"
          :space-between="16"
          :breakpoints="{
            320: { slidesPerView: 2, spaceBetween: 12 },
            640: { slidesPerView: 3, spaceBetween: 16 },
            1024: { slidesPerView: 4, spaceBetween: 20 },
            1280: { slidesPerView: 5, spaceBetween: 24 },
          }"
          @swiper="onSwiper"
          @slide-change="onSlideChange"
        >
          <swiper-slide
            v-for="product in products"
            :key="product._id || product.id"
          >
            <router-link :to="`/products/${product._id || product.id}`">
              <CardProduct :product="product" />
            </router-link>
          </swiper-slide>
        </swiper>

        <!-- No Products Message -->
        <div v-else class="flex items-center justify-center h-48">
          <div class="text-gray-500">No trending products available</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useProductStore } from "../../store/product.store";
import CardProduct from "../product/CardProduct.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import Loading from "../Loading.vue";

const props = defineProps({
  title: {
    type: String,
    default: "Trending This Week",
  },
  subtitle: {
    type: String,
    default: "Hot products everyone is talking about",
  },
  limit: {
    type: Number,
    default: 8,
  },
});

const productStore = useProductStore();
const mySwiper = ref(null);
const isBeginning = ref(true);
const isEnd = ref(false);

const products = ref([]);
const loading = ref(false);
const error = ref(null);

const onSwiper = (swiper) => {
  mySwiper.value = swiper;
  isBeginning.value = swiper.isBeginning;
  isEnd.value = swiper.isEnd;
};

const onSlideChange = (swiper) => {
  isBeginning.value = swiper.isBeginning;
  isEnd.value = swiper.isEnd;
};

const fetchTrendingProducts = async () => {
  try {
    loading.value = true;
    error.value = null;

    await productStore.fetchTrendingProducts({ limit: props.limit });
    products.value = productStore.trendingProducts || [];
  } catch (err) {
    console.error("Error fetching trending products:", err);
    error.value = "Failed to load trending products";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTrendingProducts();
});
</script>