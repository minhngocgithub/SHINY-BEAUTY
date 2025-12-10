<template>
  <div class="w-full min-h-screen">
    <!-- Header - Fixed with highest z-index -->
    <div class="relative z-50 w-full">
      <Header />
    </div>

    <!-- Hero Section - Full width -->
    <section
      class="relative z-0 w-full min-h-[500px] md:min-h-[600px] overflow-hidden"
      data-aos="fade-down"
      data-aos-duration="1000"
    >
      <!-- Background layers -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-rose-100/90 to-pink-50/90"
      ></div>
      <div
        class="absolute inset-0 bg-center bg-cover opacity-40"
        style="
          background-image: url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600');
        "
      ></div>

      <!-- Content container with white card -->
      <div
        class="relative z-10 flex items-center justify-center w-full h-full px-4 py-12 md:py-20"
      >
        <div
          class="w-full max-w-2xl p-8 mx-4 bg-transparent shadow-2xl backdrop-blur-sm rounded-3xl md:p-12"
        >
          <h1
            class="mb-6 text-4xl font-bold leading-tight text-center text-gray-900 md:text-5xl lg:text-6xl"
          >
            Unleash Your Beauty<br />
            <span class="text-rose-600">With Confidence</span>
          </h1>
          <p
            class="px-2 mb-8 text-base leading-relaxed text-center text-gray-700 md:text-lg"
          >
            Discover premium beauty products curated by experts. From skincare
            to makeup, find everything you need to enhance your natural
            radiance.
          </p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <button 
              class="w-full px-6 py-3 font-semibold text-white transition-all duration-300 transform rounded-full shadow-lg md:px-8 md:py-4 bg-rose-600 hover:bg-rose-700 hover:scale-105 hover:shadow-xl sm:w-auto"
            >
              <router-link to="/">Shop Now</router-link>
            </button>
            <button
              class="w-full px-6 py-3 font-semibold text-white transition-all duration-300 transform bg-gray-900 rounded-full shadow-lg md:px-8 md:py-4 hover:bg-gray-800 hover:scale-105 hover:shadow-xl sm:w-auto"
            >
              Beauty Guide
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Badges - Full width -->
    <section
      class="relative z-0 w-full py-6 bg-white md:py-8"
      data-aos="fade-up"
    >
      <div class="w-full px-4 md:px-6">
        <div
          class="max-w-6xl p-6 mx-auto shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl md:p-8"
        >
          <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-8">
            <div
              class="flex flex-col items-center justify-center gap-2 text-center md:flex-row md:gap-3 md:text-left"
            >
              <div
                class="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full md:w-12 md:h-12 bg-rose-100"
              >
                <svg
                  class="w-5 h-5 md:w-6 md:h-6 text-rose-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <div>
                <div class="text-sm font-semibold text-gray-900 md:text-base">
                  Authentic
                </div>
                <div class="text-xs text-gray-600 md:text-sm">
                  100% Original
                </div>
              </div>
            </div>
            <div
              class="flex flex-col items-center justify-center gap-2 text-center md:flex-row md:gap-3 md:text-left"
            >
              <div
                class="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full md:w-12 md:h-12 bg-rose-100"
              >
                <svg
                  class="w-5 h-5 md:w-6 md:h-6 text-rose-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <div class="text-sm font-semibold text-gray-900 md:text-base">
                  Fast Delivery
                </div>
                <div class="text-xs text-gray-600 md:text-sm">2-3 Days</div>
              </div>
            </div>
            <div
              class="flex flex-col items-center justify-center gap-2 text-center md:flex-row md:gap-3 md:text-left"
            >
              <div
                class="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full md:w-12 md:h-12 bg-rose-100"
              >
                <svg
                  class="w-5 h-5 md:w-6 md:h-6 text-rose-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
              </div>
              <div>
                <div class="text-sm font-semibold text-gray-900 md:text-base">
                  Secure Payment
                </div>
                <div class="text-xs text-gray-600 md:text-sm">Protected</div>
              </div>
            </div>
            <div
              class="flex flex-col items-center justify-center gap-2 text-center md:flex-row md:gap-3 md:text-left"
            >
              <div
                class="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full md:w-12 md:h-12 bg-rose-100"
              >
                <svg
                  class="w-5 h-5 md:w-6 md:h-6 text-rose-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  ></path>
                </svg>
              </div>
              <div>
                <div class="text-sm font-semibold text-gray-900 md:text-base">
                  Easy Returns
                </div>
                <div class="text-xs text-gray-600 md:text-sm">
                  30-Day Policy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Us Section - Full width -->
    <section
      class="relative z-0 w-full py-12 md:py-20 bg-gradient-to-b from-rose-50 via-white to-rose-50"
      data-aos="fade-up"
      data-aos-delay="200"
    >
      <div class="w-full px-4 md:px-6">
        <div
          class="max-w-6xl p-6 mx-auto shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl md:p-12"
        >
          <div class="grid items-center gap-8 md:grid-cols-2 md:gap-16">
            <!-- Image Column -->
            <div class="relative order-2 md:order-1" data-aos="fade-right">
              <div
                class="relative overflow-hidden shadow-2xl rounded-2xl md:rounded-3xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800"
                  alt="About Shiny Beauty"
                  class="w-full h-[300px] md:h-[500px] object-cover"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                ></div>
              </div>
              <div
                class="absolute hidden w-32 h-32 rounded-full opacity-50 md:block -bottom-8 -right-8 md:w-48 md:h-48 bg-rose-200 blur-3xl"
              ></div>
            </div>

            <!-- Content Column -->
            <div class="order-1 md:order-2" data-aos="fade-left">
              <div
                class="inline-block px-4 py-2 mb-4 text-xs font-semibold rounded-full bg-rose-100 text-rose-600 md:text-sm"
              >
                ABOUT US
              </div>
              <h2
                class="mb-4 text-3xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-5xl md:mb-6"
              >
                Your Trusted Beauty Partner
              </h2>
              <p
                class="mb-4 text-base leading-relaxed text-gray-600 md:text-lg md:mb-6"
              >
                At SHINY BEAUTY, we believe that everyone deserves to feel
                confident and beautiful. Our carefully curated collection
                features premium beauty products from renowned brands worldwide,
                ensuring quality and authenticity in every purchase.
              </p>
              <p
                class="mb-6 text-base leading-relaxed text-gray-600 md:text-lg md:mb-8"
              >
                <span class="font-semibold text-gray-900"
                  >Every single product</span
                >
                we offer is selected by our team of beauty experts who
                understand the latest trends, ingredient science, and what truly
                works for diverse skin types and beauty needs.
              </p>

              <div class="mb-6 space-y-3 md:space-y-4 md:mb-8">
                <div class="flex items-start gap-3">
                  <div
                    class="flex items-center justify-center flex-shrink-0 w-5 h-5 mt-1 rounded-full md:w-6 md:h-6 bg-rose-600"
                  >
                    <svg
                      class="w-3 h-3 text-white md:w-4 md:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <p class="text-sm text-gray-700 md:text-base">
                    Expert curation of premium beauty products
                  </p>
                </div>
                <div class="flex items-start gap-3">
                  <div
                    class="flex items-center justify-center flex-shrink-0 w-5 h-5 mt-1 rounded-full md:w-6 md:h-6 bg-rose-600"
                  >
                    <svg
                      class="w-3 h-3 text-white md:w-4 md:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <p class="text-sm text-gray-700 md:text-base">
                    100% authentic products with quality guarantee
                  </p>
                </div>
                <div class="flex items-start gap-3">
                  <div
                    class="flex items-center justify-center flex-shrink-0 w-5 h-5 mt-1 rounded-full md:w-6 md:h-6 bg-rose-600"
                  >
                    <svg
                      class="w-3 h-3 text-white md:w-4 md:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <p class="text-sm text-gray-700 md:text-base">
                    Personalized beauty consultation and support
                  </p>
                </div>
              </div>

              <button
                class="inline-flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 transform bg-gray-900 rounded-full shadow-lg md:px-8 md:py-4 hover:bg-gray-800 hover:scale-105 hover:shadow-xl md:text-base sm:w-auto"
              >
                Discover Our Story
                <svg
                  class="w-4 h-4 md:w-5 md:h-5"
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Collections - Full width -->
    <section
      class="relative z-0 w-full py-12 bg-white md:py-20"
      data-aos="fade-up"
      data-aos-delay="300"
    >
      <div class="w-full px-4 md:px-6">
        <div class="mx-auto max-w-7xl">
          <div class="mb-8 text-center md:mb-16">
            <div
              class="inline-block px-4 py-2 mb-4 text-xs font-semibold rounded-full bg-rose-100 text-rose-600 md:text-sm"
            >
              SHOP BY COLLECTION
            </div>
            <h2
              class="mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl"
            >
              Featured Collections
            </h2>
            <p
              class="max-w-2xl px-4 mx-auto text-base text-gray-600 md:text-lg"
            >
              Curated selections for every beauty need
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
            <div
              v-for="collection in collections"
              :key="collection.id"
              class="relative overflow-hidden transition-all duration-500 shadow-xl cursor-pointer group rounded-2xl md:rounded-3xl hover:shadow-2xl"
              data-aos="fade-up"
              :data-aos-delay="collection.id * 100"
            >
              <div class="relative h-[300px] md:h-[400px] overflow-hidden">
                <img
                  :src="collection.image"
                  :alt="collection.title"
                  class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                ></div>

                <div
                  class="absolute bottom-0 left-0 right-0 p-4 text-white transition-transform duration-300 transform translate-y-4 md:p-8 group-hover:translate-y-0"
                >
                  <div class="mb-2 text-xs font-semibold md:text-sm opacity-90">
                    {{ collection.category }}
                  </div>
                  <h3 class="mb-2 text-xl font-bold md:text-2xl">
                    {{ collection.title }}
                  </h3>
                  <p
                    class="mb-4 text-xs transition-opacity duration-300 opacity-0 md:text-sm group-hover:opacity-100"
                  >
                    {{ collection.description }}
                  </p>
                  <button
                    class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-900 transition-all duration-300 bg-white rounded-full opacity-0 md:px-6 group-hover:opacity-100 hover:bg-rose-600 hover:text-white"
                  >
                    Shop Now
                    <svg
                      class="w-3 h-3 md:w-4 md:h-4"
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
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Shop by Category - Full width -->
    <section
      class="relative z-0 w-full py-12 md:py-20 bg-gradient-to-b from-rose-50 to-white"
      data-aos="fade-up"
      data-aos-delay="400"
    >
      <div class="w-full px-4 md:px-6">
        <div class="mx-auto max-w-7xl">
          <div class="mb-8 text-center md:mb-16">
            <div
              class="inline-block px-4 py-2 mb-4 text-xs font-semibold bg-white rounded-full shadow-md text-rose-600 md:text-sm"
            >
              CATEGORIES
            </div>
            <h2
              class="mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl"
            >
              Shop by Category
            </h2>
            <p
              class="max-w-2xl px-4 mx-auto text-base text-gray-600 md:text-lg"
            >
              Find exactly what you're looking for
            </p>
          </div>

          <QuickLink />
        </div>
      </div>
    </section>

    <!-- Beauty Tips Section - Full width -->
    <section
      class="relative z-0 w-full py-12 bg-white md:py-20"
      data-aos="fade-up"
      data-aos-delay="500"
    >
      <div class="w-full px-4 md:px-6">
        <div class="mx-auto max-w-7xl">
          <div class="mb-8 text-center md:mb-16">
            <div
              class="inline-block px-4 py-2 mb-4 text-xs font-semibold rounded-full bg-rose-100 text-rose-600 md:text-sm"
            >
              BEAUTY GUIDE
            </div>
            <h2
              class="mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl"
            >
              Beauty Tips & Inspiration
            </h2>
            <p
              class="max-w-2xl px-4 mx-auto text-base text-gray-600 md:text-lg"
            >
              Expert advice, tutorials, and trends to elevate your beauty
              routine
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <div
              v-for="tip in beautyTips"
              :key="tip.id"
              class="relative overflow-hidden transition-all duration-300 shadow-lg cursor-pointer group rounded-xl md:rounded-2xl hover:shadow-2xl aspect-square"
              data-aos="flip-left"
              :data-aos-delay="tip.id * 50"
            >
              <img
                :src="tip.image"
                :alt="tip.title"
                class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              />
              <div
                class="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:opacity-100"
              ></div>
              <div
                class="absolute inset-0 flex flex-col items-center justify-center p-3 text-white transition-opacity duration-300 opacity-0 md:p-6 group-hover:opacity-100"
              >
                <h3 class="mb-2 text-sm font-bold text-center md:text-lg">
                  {{ tip.title }}
                </h3>
                <button
                  class="px-3 md:px-4 py-1.5 md:py-2 bg-white text-gray-900 rounded-full text-xs md:text-sm font-semibold hover:bg-rose-600 hover:text-white transition-colors"
                >
                  Read More
                </button>
              </div>
            </div>
          </div>

          <div class="mt-8 text-center md:mt-12">
            <button
              class="inline-flex items-center justify-center w-full gap-2 px-6 py-3 mx-4 text-sm font-semibold text-white transition-all duration-300 transform rounded-full shadow-lg md:px-8 md:py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 hover:scale-105 hover:shadow-xl md:text-base sm:w-auto"
            >
              View All Beauty Tips
              <svg
                class="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Trending Products - Full width -->
    <section
      class="relative z-0 w-full py-12 md:py-20 bg-gradient-to-b from-rose-50 to-white"
      data-aos="fade-up"
      data-aos-delay="600"
    >
      <TrendingProducts
        title="Trending This Week"
        subtitle="Discover what beauty lovers are buying"
        :limit="8"
      />
    </section>

    <!-- Newsletter Section - Full width -->
    <section
      class="relative z-0 w-full py-12 text-white md:py-20 bg-gradient-to-r from-rose-600 to-pink-600"
      data-aos="fade-up"
    >
      <div class="w-full px-4 md:px-6">
        <div class="max-w-3xl mx-auto text-center">
          <div
            class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full md:w-20 md:h-20 md:mb-6 bg-white/20"
          >
            <svg
              class="w-8 h-8 md:w-10 md:h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <h2 class="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Join Our Beauty Community
          </h2>
          <p class="px-4 mb-6 text-base md:text-xl opacity-90 md:mb-8">
            Get exclusive beauty tips, early access to sales, and special offers
          </p>
          <div
            class="flex flex-col max-w-md gap-3 mx-auto sm:flex-row md:gap-4"
          >
            <input
              type="email"
              placeholder="Enter your email"
              class="flex-1 px-4 py-3 text-sm text-gray-900 rounded-full md:px-6 md:py-4 focus:outline-none focus:ring-4 focus:ring-white/30 md:text-base"
            />
            <button
              class="px-6 py-3 text-sm font-semibold transition-all duration-300 transform bg-white rounded-full shadow-lg md:px-8 md:py-4 text-rose-600 hover:bg-gray-100 hover:scale-105 hover:shadow-xl whitespace-nowrap md:text-base"
            >
              Subscribe Now
            </button>
          </div>
          <p class="mt-4 text-xs opacity-75 md:text-sm">
            🎁 Get 15% off your first order when you subscribe
          </p>
        </div>
      </div>
    </section>

    <!-- Footer - Full width -->
    <div class="relative z-0 w-full">
      <Footer />
    </div>

    <!-- Floating Cart - Highest z-index -->
    <div class="relative z-40">
      <FloatingCart @toggle-cart="handleToggleCart" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import Header from "../components/Header.vue";
import TrendingProducts from "../components/shop/TrendingProducts.vue";
import FloatingCart from "../components/FloatingCart.vue";
import QuickLink from "../components/QuickLink.vue";
import Footer from "../components/Footer.vue";
import { refreshAOS } from "../../utils/aos";

const router = useRouter();

const collections = ref([
  {
    id: 1,
    title: "Summer Glow",
    category: "SEASONAL",
    description: "Lightweight formulas perfect for hot weather",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800",
  },
  {
    id: 2,
    title: "K-Beauty Favorites",
    category: "TRENDING",
    description: "Korean skincare must-haves for glass skin",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800",
  },
  {
    id: 3,
    title: "Luxury Collection",
    category: "PREMIUM",
    description: "High-end products for ultimate indulgence",
    image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800",
  },
]);

const categories = ref([
  { id: 1, name: "Skincare", icon: "✨", count: 124 },
  { id: 2, name: "Makeup", icon: "💄", count: 98 },
  { id: 3, name: "Hair Care", icon: "💇‍♀️", count: 67 },
  { id: 4, name: "Fragrance", icon: "🌸", count: 45 },
  { id: 5, name: "Tools", icon: "🔧", count: 34 },
  { id: 6, name: "Body Care", icon: "🧴", count: 56 },
  { id: 7, name: "Nails", icon: "💅", count: 28 },
  { id: 8, name: "Gift Sets", icon: "🎁", count: 19 },
]);

const beautyTips = ref([
  {
    id: 1,
    title: "10-Step Korean Skincare",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400",
  },
  {
    id: 2,
    title: "Summer Makeup Trends",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400",
  },
  {
    id: 3,
    title: "Anti-Aging Secrets",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400",
  },
  {
    id: 4,
    title: "Hair Care Routine",
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400",
  },
  {
    id: 5,
    title: "Glowing Skin Tips",
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400",
  },
  {
    id: 6,
    title: "Bold Lip Looks",
    image: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400",
  },
  {
    id: 7,
    title: "Eye Care Essentials",
    image: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400",
  },
  {
    id: 8,
    title: "Natural Beauty Hacks",
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400",
  },
]);

const handleToggleCart = () => {
  router.push("/cart");
};

onMounted(async () => {
  await nextTick();
  setTimeout(() => {
    refreshAOS();
  }, 100);

  addStructuredData();
});

const addStructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Shop - SHINY BEAUTY",
    description:
      "Premium beauty products and expert beauty tips. Shop skincare, makeup, hair care, and more with free shipping on orders over $50.",
    url: window.location.href,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: window.location.origin,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: window.location.href,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Beauty Products & Collections",
      description:
        "Curated beauty product collections and expert beauty guides",
    },
  };

  let script = document.querySelector('script[type="application/ld+json"]');
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(structuredData);
};
</script>

<style scoped>
/* Ensure full width */
section {
  width: 100%;
  max-width: 100%;
}

/* Z-index hierarchy */
/* Header: z-50, FloatingCart: z-40, Sections: z-0 */

/* Smooth transitions */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>