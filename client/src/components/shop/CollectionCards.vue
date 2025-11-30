<!-- ================================================================ -->

<!-- CollectionCards.vue -->
<template>
  <section class="w-full py-12 bg-white md:py-16">
    <div class="px-4 mx-auto max-w-7xl lg:px-8">
      <!-- Section Title -->
      <div class="mb-10 text-center" data-aos="fade-up" data-aos-duration="800">
        <h2 class="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
          Quick Navigation
        </h2>
        <p class="text-gray-600">Jump to your favorite collections</p>
      </div>

      <!-- Collection Cards Grid -->
      <div
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        data-aos="fade-up"
        data-aos-delay="200"
        data-aos-duration="800"
      >
        <!-- Featured Products Card -->
        <router-link
          to="/shop/featured"
          class="relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:shadow-2xl hover:-translate-y-2 group"
        >
          <div class="p-8">
            <div class="flex items-start justify-between mb-4">
              <div
                class="flex items-center justify-center w-16 h-16 bg-purple-200 rounded-xl"
              >
                <svg
                  class="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <span
                class="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-200 rounded-full"
              >
                Editor's Choice
              </span>
            </div>

            <h3 class="mb-2 text-2xl font-bold text-gray-900">
              Featured Products
            </h3>
            <p class="mb-4 text-gray-600">
              Handpicked premium selections just for you
            </p>

            <div
              class="flex items-center text-purple-600 transition-transform group-hover:translate-x-2"
            >
              <span class="mr-2 font-medium">Explore Now</span>
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </div>

          <!-- Decorative gradient -->
          <div
            class="absolute bottom-0 right-0 w-32 h-32 bg-purple-300 rounded-full opacity-20 blur-2xl"
          ></div>
        </router-link>

        <!-- Flash Sale Card -->
        <router-link
          to="/shop/sales"
          class="relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-rose-50 to-red-100 rounded-2xl hover:shadow-2xl hover:-translate-y-2 group"
        >
          <div class="p-8">
            <div class="flex items-start justify-between mb-4">
              <div
                class="flex items-center justify-center w-16 h-16 bg-red-200 rounded-xl"
              >
                <svg
                  class="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <span
                class="px-3 py-1 text-xs font-semibold text-red-700 bg-red-200 rounded-full animate-pulse"
              >
                Limited Time
              </span>
            </div>

            <h3 class="mb-2 text-2xl font-bold text-gray-900">Flash Sale</h3>
            <p class="mb-4 text-gray-600">Up to 50% off on selected items</p>

            <div
              class="flex items-center text-red-600 transition-transform group-hover:translate-x-2"
            >
              <span class="mr-2 font-medium">Shop Deals</span>
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </div>

          <div
            class="absolute bottom-0 right-0 w-32 h-32 bg-red-300 rounded-full opacity-20 blur-2xl"
          ></div>
        </router-link>

        <!-- Wishlist Card -->
        <router-link
          to="/shop/wishlist"
          class="relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl hover:shadow-2xl hover:-translate-y-2 group"
        >
          <div class="p-8">
            <div class="flex items-start justify-between mb-4">
              <div
                class="flex items-center justify-center w-16 h-16 bg-pink-200 rounded-xl"
              >
                <svg
                  class="w-8 h-8 text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <span
                v-if="wishlistCount > 0"
                class="px-3 py-1 text-xs font-semibold text-pink-700 bg-pink-200 rounded-full"
              >
                {{ wishlistCount }} items
              </span>
            </div>

            <h3 class="mb-2 text-2xl font-bold text-gray-900">Your Wishlist</h3>
            <p class="mb-4 text-gray-600">
              {{
                wishlistCount > 0
                  ? "Review your saved favorites"
                  : "Save items you love"
              }}
            </p>

            <div
              class="flex items-center text-pink-600 transition-transform group-hover:translate-x-2"
            >
              <span class="mr-2 font-medium">View Wishlist</span>
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </div>

          <div
            class="absolute bottom-0 right-0 w-32 h-32 bg-pink-300 rounded-full opacity-20 blur-2xl"
          ></div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useWishlistStore } from "../../store/wishlist.store";

const wishlistStore = useWishlistStore();

const wishlistCount = computed(() => {
  return wishlistStore.wishlist?.length || 0;
});
</script>