<template>
  <section class="relative w-full overflow-hidden bg-white">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-96">
      <Loading />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-20 text-center">
      <div class="max-w-md px-6 mx-auto">
        <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100">
          <svg class="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="mb-2 text-lg font-semibold text-gray-900">Unable to Load Promotions</h3>
        <p class="mb-6 text-sm text-gray-600">{{ error }}</p>
        <button @click="fetchSalePrograms" class="px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 rounded-lg bg-black hover:bg-gray-800">
          Try Again
        </button>
      </div>
    </div>

    <!-- Main Slider -->
    <div v-else-if="salePrograms.length > 0" class="relative">
      <swiper
        class="sale-swiper"
        :modules="modules"
        :slides-per-view="1"
        :space-between="0"
        :loop="true"
        :autoplay="{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }"
        :speed="600"
        @swiper="onSwiper"
        @slide-change="onSlideChange"
      >
        <swiper-slide v-for="program in salePrograms" :key="program.id || program._id">
          <div 
            class="relative w-full h-[500px] md:h-[580px] cursor-pointer group overflow-hidden"
            @click="goToSaleProducts(program.id || program._id)"
          >
            <!-- Background Image -->
            <div class="absolute inset-0">
              <img
                :src="program.bannerImage || '/placeholder-sale.jpg'"
                :alt="program.title"
                class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <!-- Gradient Overlay - Sephora Style -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            </div>

            <!-- Content Container -->
            <div class="relative z-10 flex items-end h-full px-6 pb-16 mx-auto max-w-7xl sm:px-8 lg:px-12">
              <div class="w-full max-w-2xl space-y-4">
                <!-- Badge/Label -->
                <div v-if="program.benefits?.discountPercentage" class="inline-flex items-center gap-2 px-4 py-2 text-white border-2 border-white rounded-full backdrop-blur-sm bg-black/30">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="text-sm font-bold tracking-wider uppercase">
                    UP TO {{ program.benefits.discountPercentage }}% OFF
                  </span>
                </div>

                <!-- Title -->
                <h2 class="text-4xl font-bold text-white md:text-5xl lg:text-6xl drop-shadow-2xl">
                  {{ program.title }}
                </h2>

                <!-- Description -->
                <p class="text-lg text-white md:text-xl drop-shadow-lg">
                  {{ program.shortDescription }}
                </p>

                <!-- CTA Button -->
                <div class="pt-4">
                  <button
                    @click.stop="goToSaleProducts(program.id || program._id)"
                    class="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 bg-black rounded-full hover:bg-gray-900 hover:gap-3 group/btn"
                  >
                    SHOP NOW
                    <svg class="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <!-- Promo Code (if applicable) -->
                <div v-if="program.promoCode" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border rounded-lg border-white/50 backdrop-blur-sm bg-white/10">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>USE CODE <strong class="font-bold">{{ program.promoCode }}</strong></span>
                </div>
              </div>
            </div>

            <!-- Decorative Stars (Sephora style) -->
            <div class="absolute pointer-events-none top-8 right-8 opacity-80">
              <svg class="w-8 h-8 text-yellow-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z" />
              </svg>
            </div>
            <div class="absolute pointer-events-none top-20 right-20 opacity-60">
              <svg class="w-5 h-5 text-yellow-300 animate-pulse-slow" fill="currentColor" viewBox="0 0 24 24" style="animation-delay: 0.5s">
                <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z" />
              </svg>
            </div>
          </div>
        </swiper-slide>
      </swiper>

      <!-- Navigation Arrows -->
      <button
        @click="prevSlide"
        class="absolute z-20 flex items-center justify-center w-12 h-12 text-white transition-all duration-300 -translate-y-1/2 rounded-full left-4 top-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        @click="nextSlide"
        class="absolute z-20 flex items-center justify-center w-12 h-12 text-white transition-all duration-300 -translate-y-1/2 rounded-full right-4 top-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Pagination Dots -->
      <div class="absolute z-20 flex items-center justify-center w-full gap-2 bottom-6">
        <button
          v-for="(program, index) in salePrograms"
          :key="'dot-' + index"
          @click="goToSlide(index)"
          :class="[
            'h-2 rounded-full transition-all duration-300',
            currentSlideIndex === index
              ? 'w-8 bg-white'
              : 'w-2 bg-white/50 hover:bg-white/75'
          ]"
        ></button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="py-32 text-center">
      <div class="max-w-md px-6 mx-auto">
        <div class="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <h3 class="mb-2 text-2xl font-bold text-gray-900">No Active Promotions</h3>
        <p class="text-base text-gray-600">Check back soon for amazing deals and exclusive offers!</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { getActiveSaleProgramsApi } from "../service/saleProgram.service";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Loading from "./Loading.vue";

const router = useRouter();
const salePrograms = ref([]);
const loading = ref(true);
const error = ref(null);

const modules = [Autoplay];
const mySwiper = ref(null);
const currentSlideIndex = ref(0);

const onSwiper = (swiper) => {
  mySwiper.value = swiper;
};

const onSlideChange = (swiper) => {
  currentSlideIndex.value = swiper.realIndex;
};

const goToSlide = (index) => {
  if (mySwiper.value) {
    mySwiper.value.slideToLoop(index);
  }
};

const prevSlide = () => {
  if (mySwiper.value) {
    mySwiper.value.slidePrev();
  }
};

const nextSlide = () => {
  if (mySwiper.value) {
    mySwiper.value.slideNext();
  }
};

const fetchSalePrograms = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await getActiveSaleProgramsApi();

    if (response.data.success) {
      salePrograms.value = response.data.salePrograms || [];
    }
  } catch (err) {
    console.error("Error fetching sale programs:", err);
    error.value = "Unable to load sale programs. Please try again.";
  } finally {
    loading.value = false;
  }
};

const goToSaleProducts = (programId) => {
  router.push({
    name: "SaleProgramProducts",
    params: { id: programId },
  });
};

onMounted(() => {
  fetchSalePrograms();
});

onUnmounted(() => {
  if (mySwiper.value) {
    mySwiper.value.destroy();
  }
});
</script>

<style scoped>
.sale-swiper {
  width: 100%;
  height: 100%;
}

/* Smooth animations */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

/* Font smoothing */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar (optional) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>