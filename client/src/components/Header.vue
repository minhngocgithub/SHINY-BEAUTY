<template>
  <section class="relative ">
    <nav class="bg-white shadow-sm">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-4">
          <!-- Logo -->
          <div class="flex items-center flex-shrink-0 min-w-0">
            <div class="flex items-center flex-shrink-0 mt-2">
              <img
                src="E:\Booking App\Booking App\client\src\assets\image\image_logo\logo_website.png"
                alt="Beauty Cosmetic"
                class="object-contain w-auto p-2 rounded-lg shadow-sm h-"
                style="max-width: 140px"
              />
              <span>Beauty Comestic</span>
            </div>
          </div>

          <!-- Search Bar - Hidden on mobile -->
          <div class="flex-1 hidden max-w-xl mx-4 md:block">
            <SearchWrapper />
          </div>

          <!-- Right Section: Wishlist, Loyalty & Profile -->
          <div class="flex items-center gap-2 sm:gap-3">
            <!-- Wishlist Button -->
            <router-link
              to="/shop/wishlist"
              class="relative p-2 text-gray-600 transition-colors rounded-full hover:bg-gray-100 hover:text-rose-600 group/wishlist"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>

              <!-- Badge -->
              <span
                v-if="wishlistStore.wishlistCount > 0"
                class="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full -top-1 -right-1"
              >
                {{ wishlistStore.wishlistCount }}
              </span>

              <!-- Tooltip -->
              <span
                class="absolute hidden px-2 py-1 text-xs text-white transition-opacity bg-gray-800 rounded opacity-0 pointer-events-none -left-20 top-full group-hover/wishlist:opacity-100 whitespace-nowrap"
              >
                Wishlist ({{ wishlistStore.wishlistCount }})
              </span>
            </router-link>

            <!-- Loyalty Points (only for logged in users) -->
            <router-link
              v-if="authStore.isLoggedIn"
              to="/account/profile"
              class="items-center hidden gap-2 px-3 py-2 text-gray-700 transition-colors rounded-lg lg:flex hover:bg-purple-50 hover:text-purple-600 group/loyalty"
            >
              <span class="text-xl">⭐</span>
              <div class="text-left">
                <p class="text-xs leading-none text-gray-500">Points</p>
                <p class="text-sm font-semibold">
                  {{ formatPoints(loyaltyStore.points) }}
                </p>
              </div>

              <!-- Tooltip -->
              <span
                class="absolute hidden px-2 py-1 text-xs text-white transition-opacity bg-gray-800 rounded opacity-0 pointer-events-none -left-10 top-full group-hover/loyalty:opacity-100 whitespace-nowrap"
              >
                {{ loyaltyStore.points }} loyalty points
              </span>
            </router-link>

            <div v-if="!authStore.isLoggedIn" class="bg-[#5a4098] rounded-lg">
              <router-link
                to="/auth/login"
                class="block px-3 py-2 text-sm font-semibold text-white transition-colors sm:px-4"
              >
                Sign in
              </router-link>
            </div>

            <!-- Profile Dropdown -->
            <div
              v-else
              class="relative"
              @mouseenter="profileMenuOpen = true"
              @mouseleave="profileMenuOpen = false"
            >
              <button
                @click="toggleProfileMenu"
                class="flex items-center gap-2 px-2 py-1.5 transition-colors rounded-lg hover:bg-gray-100 lg:px-3"
                id="user-menu-button"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <Avatar
                  :current-avatar="
                    authStore.user?.avatar?.url || '@/assets/image/vue.svg'
                  "
                  :size="32"
                />
                <span
                  class="hidden text-sm font-medium text-gray-700 truncate lg:inline-block max-w-24 xl:max-w-32"
                >
                  {{ authStore.user?.name || "" }}
                </span>
                <svg
                  class="w-4 h-4 text-gray-500 transition-transform"
                  :class="{ 'rotate-180': profileMenuOpen }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <transition name="dropdown">
                <div
                  v-if="profileMenuOpen"
                  class="absolute right-0 w-48 py-1 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg top-full z-[10000]"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <router-link
                    to="/account/profile"
                    @click="closeProfileMenu"
                    class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    role="menuitem"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Your Profile
                  </router-link>
                  <router-link
                    to="/setting"
                    @click="closeProfileMenu"
                    class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    role="menuitem"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </router-link>
                  <hr class="my-1 border-gray-200" />
                  <a
                    @click.prevent="logoutAccount"
                    href="#"
                    class="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition-colors cursor-pointer hover:bg-red-50"
                    role="menuitem"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Log out
                  </a>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Mobile Search Bar -->
        <div class="pb-3 md:hidden">
          <SearchWrapper />
        </div>
      </div>
    </nav>

    <!-- Navbar 2 - Category Navigation -->
    <nav class="relative bg-gray-800">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <!-- Mobile Menu Button -->
          <button
            type="button"
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="inline-flex items-center justify-center p-2 mr-3 text-gray-400 transition-colors rounded-md lg:hidden hover:bg-gray-700 hover:text-white"
            aria-controls="mobile-menu"
            aria-expanded="false"
          >
            <svg
              v-if="!mobileMenuOpen"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Desktop Navigation -->
          <div class="items-center justify-center flex-1 hidden lg:flex">
            <div class="flex items-center space-x-1">
              <div
                v-for="category in categories"
                :key="category._id"
                @mouseenter="showDropdown(category.name)"
                @mouseleave="scheduleHideDropdown"
                class="relative category-item"
              >
                <router-link
                  :to="`/shop/${category.slug}`"
                  class="block px-3 py-2 text-sm font-medium text-white transition-all duration-200 rounded-md hover:bg-gray-700"
                  :class="{ 'bg-gray-700': currentDropdown === category.name }"
                >
                  {{ category.name }}
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div v-if="mobileMenuOpen" class="pb-3 lg:hidden" id="mobile-menu">
          <div class="space-y-1">
            <div
              v-for="category in categories"
              :key="category._id"
              class="space-y-1"
            >
              <div class="flex items-center">
                <router-link
                  :to="`/shop/${category.slug}`"
                  class="flex-1 px-3 py-2 text-base font-medium text-gray-300 transition-colors rounded-md hover:bg-gray-700 hover:text-white"
                  @click="mobileMenuOpen = false"
                >
                  {{ category.name }}
                </router-link>
                <button
                  v-if="category.children && category.children.length > 0"
                  @click="toggleMobileDropdown(category.name)"
                  class="p-2 transition-colors bg-gray-800 hover:text-white"
                >
                  <svg
                    :class="{
                      'rotate-180': currentMobileDropdown === category.name,
                    }"
                    class="w-5 h-5 text-white transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              <!-- Mobile Subcategories -->
              <div
                v-if="
                  currentMobileDropdown === category.name &&
                  category.children &&
                  category.children.length > 0
                "
                class="pl-4 space-y-1 overflow-hidden transition-all duration-300"
              >
                <div
                  v-for="subCategory in category.children"
                  :key="subCategory._id"
                  class="space-y-1"
                >
                  <router-link
                    :to="`/shop/${
                      subCategory.fullPath ||
                      category.slug + '/' + subCategory.slug
                    }`"
                    class="block px-3 py-2 text-sm font-medium text-gray-400 transition-colors rounded-md hover:bg-gray-700 hover:text-white"
                    @click="mobileMenuOpen = false"
                  >
                    {{ subCategory.name }}
                  </router-link>

                  <!-- Level 2 items -->
                  <div
                    v-if="
                      subCategory.children && subCategory.children.length > 0
                    "
                    class="pl-4 space-y-1"
                  >
                    <router-link
                      v-for="item in subCategory.children"
                      :key="item._id"
                      :to="`/shop/${
                        item.fullPath ||
                        category.slug + '/' + subCategory.slug + '/' + item.slug
                      }`"
                      class="block px-3 py-2 text-xs text-gray-500 transition-colors rounded-md hover:bg-gray-700 hover:text-white"
                      @click="mobileMenuOpen = false"
                    >
                      {{ item.name }}
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Dropdown Menu - Positioned outside navbar -->
      <transition name="dropdown-fade">
        <div
          v-if="currentDropdown"
          @mouseenter="cancelHideDropdown"
          @mouseleave="scheduleHideDropdown"
          class="absolute left-0 right-0 z-50 hidden bg-white shadow-2xl lg:block dropdown-container"
          style="top: 100%"
        >
          <div class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div
              v-for="category in categories"
              :key="category._id"
              v-show="currentDropdown === category.name"
            >
              <div
                v-if="category.children && category.children.length > 0"
                class="grid gap-8"
                :class="getGridCols(category.children.length)"
              >
                <!-- Subcategories -->
                <div
                  v-for="subCategory in category.children"
                  :key="subCategory._id"
                  class="space-y-3"
                >
                  <router-link
                    :to="`/shop/${
                      subCategory.fullPath ||
                      category.slug + '/' + subCategory.slug
                    }`"
                    class="block text-base font-semibold text-gray-900 transition-colors hover:underline"
                  >
                    {{ subCategory.name }}
                  </router-link>

                  <!-- Level 2 items -->
                  <div
                    v-if="
                      subCategory.children && subCategory.children.length > 0
                    "
                    class="space-y-2"
                  >
                    <router-link
                      v-for="item in subCategory.children"
                      :key="item._id"
                      :to="`/shop/${
                        item.fullPath ||
                        category.slug + '/' + subCategory.slug + '/' + item.slug
                      }`"
                      class="block text-sm text-gray-600 transition-colors hover:text-gray-900 hover:font-medium"
                    >
                      {{ item.name }}
                    </router-link>
                  </div>

                  <!-- Featured image -->
                  <div v-if="subCategory.image" class="mt-4">
                    <router-link
                      :to="`/shop/${
                        subCategory.fullPath ||
                        category.slug + '/' + subCategory.slug
                      }`"
                    >
                      <img
                        :src="subCategory.image"
                        :alt="subCategory.name"
                        class="w-full transition-shadow rounded-lg shadow-md hover:shadow-xl"
                      />
                    </router-link>
                  </div>
                </div>

                <!-- Featured Product -->
                <div
                  v-if="
                    category.featuredProduct && category.featuredProduct.image
                  "
                  class="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl"
                >
                  <router-link
                    :to="
                      category.featuredProduct.link || `/shop/${category.slug}`
                    "
                    class="block"
                  >
                    <img
                      :src="category.featuredProduct.image"
                      :alt="category.featuredProduct.title"
                      class="w-full mb-4 transition-shadow rounded-lg shadow-md hover:shadow-xl"
                    />
                    <p class="text-base font-semibold text-gray-900">
                      {{ category.featuredProduct.title }}
                    </p>
                    <p class="mt-1 text-sm text-gray-600">
                      {{ category.featuredProduct.subtitle }}
                    </p>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </nav>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth.store";
import { useWishlistStore } from "../store/wishlist.store";
import { useLoyaltyStore } from "../store/loyalty.store";
import { getRootCategoriesWithChildrenApi } from "../service/category.service.js";
import { logoutAccountApi } from "../service/auth.service";
import {
  showErrorAlert,
  showSuccessAlert,
  showConfirmAlert,
  closeAlert,
} from "../../utils/sweetAlert";
import SearchWrapper from "../components/search/SearchWrapper.vue";
import Avatar from "../components/atoms/Avatar.vue";

const router = useRouter();
const authStore = useAuthStore();
const wishlistStore = useWishlistStore();
const loyaltyStore = useLoyaltyStore();

const categories = ref([]);
const currentDropdown = ref(null);
const currentMobileDropdown = ref(null);
const mobileMenuOpen = ref(false);
const profileMenuOpen = ref(false);
const loading = ref(false);
let hideTimeout = null;

// Format points for display
const formatPoints = (points) => {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k`;
  }
  return points || 0;
};

const showDropdown = (name) => {
  cancelHideDropdown();
  currentDropdown.value = name;
};

const scheduleHideDropdown = () => {
  hideTimeout = setTimeout(() => {
    currentDropdown.value = null;
  }, 200);
};

const cancelHideDropdown = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
};

const toggleMobileDropdown = (name) => {
  currentMobileDropdown.value =
    currentMobileDropdown.value === name ? null : name;
};

const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value;
};

const closeProfileMenu = () => {
  profileMenuOpen.value = false;
};

const getGridCols = (count) => {
  if (count <= 2) return "sm:grid-cols-1 md:grid-cols-2";
  if (count <= 3) return "sm:grid-cols-2 md:grid-cols-3";
  if (count <= 4) return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  if (count <= 5) return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
  return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";
};

const fetchCategories = async () => {
  try {
    loading.value = true;
    const response = await getRootCategoriesWithChildrenApi();
    if (response.data.success) {
      categories.value = response.data.data;
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    showErrorAlert("Failed to load categories");
  } finally {
    loading.value = false;
  }
};

const logoutAccount = async () => {
  try {
    const result = await showConfirmAlert("You wanna logout account ?");
    if (result) {
      authStore.logout();
      try {
        await logoutAccountApi();
      } catch (apiError) {
        console.error("Logout API error:", apiError);
      }

      closeAlert();
      showSuccessAlert("Logout successfully!");
      router.push({ path: "/auth/login" });
    }
  } catch (error) {
    // Clear auth data even on error
    authStore.logout();
    router.push({ path: "/auth/login" });
  }
};

onMounted(async () => {
  await wishlistStore.fetchWishlist();
  if (authStore.isLoggedIn) {
    await loyaltyStore.fetchDashboard();
  }
  await fetchCategories();
});
</script>

<style scoped>
/* Smooth transitions */
a,
button {
  transition: all 0.2s ease;
}

/* Ensure dropdown appears correctly */
nav {
  position: relative;
}

/* Category hover effect */
.category-item:hover a {
  background-color: rgb(55 65 81);
}

/* Profile dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Category dropdown fade animation */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.dropdown-fade-enter-to,
.dropdown-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Dropdown container max width */
.dropdown-container {
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

/* Mobile menu smooth expand */
@media (max-width: 1023px) {
  .space-y-1 > div {
    animation: slideDown 0.3s ease;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}
</style>