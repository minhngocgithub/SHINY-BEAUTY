<template>
  <div class="flex min-h-screen">
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-40 w-80 transform transition-all duration-300 ease-in-out',
        isMobileMenuOpen
          ? 'translate-x-0'
          : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div
        class="h-full border-r border-gray-100 shadow-xl bg-white/90 backdrop-blur-xl"
      >
        <div class="p-6 border-b border-gray-100">
          <div class="text-center">
            <h1
              class="text-2xl font-bold text-transparent bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text"
            >
              Shiny Beauty
            </h1>
            <router-link to="/"
              ><span class="mt-1 text-sm text-gray-500 hover:text-rose-600"
                >Shopping Now</span
              ></router-link
            >
          </div>
        </div>

        <div class="p-6 border-b border-gray-100">
          <div class="grid grid-cols-2 gap-3">
            <div
              class="p-3 text-center border border-gray-100 bg-[#FEFEFF] shadow-lg rounded-xl"
            >
              <div class="text-2xl font-bold text-[#C9123F]">
                {{ userStats?.totalOrders || 0 }}
              </div>
              <div class="text-xs text-gray-600">Orders</div>
            </div>
            <div
              class="p-3 text-center border border-gray-100 bg-[#FEFEFF] shadow-lg rounded-xl"
            >
              <div class="text-2xl font-bold text-[#C9123F]">
                {{ userStats?.totalReviews || 0 }}
              </div>
              <div class="text-xs text-gray-600">Reviews</div>
            </div>
            <div
              class="p-3 text-center border border-gray-100 bg-[#FEFEFF] shadow-lg rounded-xl"
            >
              <div class="text-2xl font-bold text-[#C9123F]">
                {{ wishlistStore.wishlistCount || 0 }}
              </div>
              <div class="text-xs text-gray-600">Wishlist</div>
            </div>
            <div
              class="p-3 text-center border border-gray-100 bg-[#FEFEFF] shadow-lg rounded-xl"
            >
              <div class="text-2xl font-bold text-[#C9123F]">
                {{ formatCurrency(userStats?.totalSpent || 0) }}
              </div>
              <div class="text-xs text-gray-600">Total Spent</div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-6 overflow-y-auto">
          <ul class="space-y-2">
            <li v-for="item in menuItems" :key="item.id">
              <button
                @click="changeTab(item.id)"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-rose-100 to-violet-100 text-rose-700 shadow-sm border border-rose-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700',
                ]"
              >
                <span class="font-medium">{{ item.label }}</span>
                <span
                  v-if="item.badge"
                  class="ml-auto px-2 py-0.5 text-xs bg-rose-500 text-white rounded-full"
                >
                  {{ item.badge }}
                </span>
              </button>
            </li>
          </ul>
        </nav>

        <div class="p-6 border-t border-gray-100">
          <button
            @click="handleLogout"
            class="flex items-center w-full gap-3 px-4 py-3 text-red-500 transition-all duration-200 hover:bg-red-50 rounded-xl"
          >
            <span class="text-xl"></span>
            <span class="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 p-4 overflow-y-auto lg:p-8">
      <div class="max-w-5xl mx-auto">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'">
          <ProfileTab
            :authStore="authStore"
            :userStore="userStore"
            :isEditing="isEditing"
            :editForm="editForm"
            @toggle-edit="toggleEdit"
            @update-profile="updateProfile"
            @avatar-update="handleAvatarUpdate"
            @avatar-loading="handleAvatarLoadingState"
          />
        </div>

        <!-- Orders Tab -->
        <div v-if="activeTab === 'orders'">
          <OrdersTab
            :orders="orderStore.orders"
            :selectedFilter="selectedOrderFilter"
            @update-filter="selectedOrderFilter = $event"
            @view-order="viewOrderDetail"
            @cancel-order="cancelOrder"
            @track-order="trackOrder"
          />
        </div>

        <!-- Wishlist Tab -->
        <div v-if="activeTab === 'wishlist'">
          <WishlistTab
            :wishlistStore="wishlistStore"
            @clear-wishlist="clearWishlist"
            @remove-item="removeFromWishlist"
            @move-to-cart="moveToCart"
          />
        </div>

        <!-- Reviews Tab -->
        <div v-if="activeTab === 'reviews'">
          <ReviewsTab :reviews="reviewStore.myReviews" />
        </div>

        <!-- Addresses Tab -->
        <div v-if="activeTab === 'addresses'">
          <AddressTab
            :addresses="userStore.addresses"
            :hasAddresses="userStore.hasAddresses"
            @add-address="$emit('show-add-address')"
            @edit-address="$emit('edit-address', $event)"
            @delete-address="deleteAddress"
            @set-default="setDefaultAddress"
          />
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'">
          <SettingsTab
            :notificationPreferences="userStore.notificationPreferences"
            @show-password-modal="$emit('show-password-modal')"
            @update-notifications="updateNotificationPrefs"
          />
        </div>

        <!-- Loyalty Tab -->
        <div v-if="activeTab === 'loyalty'">
          <LoyaltyTab />
        </div>
      </div>
    </main>

    <!-- Mobile Menu Button (Outside sidebar but inside this component) -->
    <button
      @click="$emit('toggle-mobile-menu')"
      class="fixed z-50 p-3 border border-gray-100 shadow-lg top-4 left-4 lg:hidden bg-white/90 backdrop-blur-xl rounded-2xl"
    >
      <div class="space-y-1">
        <span
          :class="[
            'block w-5 h-0.5 bg-gray-600 transition-all duration-300',
            isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : '',
          ]"
        ></span>
        <span
          :class="[
            'block w-5 h-0.5 bg-gray-600 transition-all duration-300',
            isMobileMenuOpen ? 'opacity-0' : '',
          ]"
        ></span>
        <span
          :class="[
            'block w-5 h-0.5 bg-gray-600 transition-all duration-300',
            isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : '',
          ]"
        ></span>
      </div>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../store/auth.store";
import { useUserStore } from "../../store/user.store";
import { useOrderStore } from "../../store/order.store";
import { useWishlistStore } from "../../store/wishlist.store";
import { useReviewStore } from "../../store/review.store";
import { logoutAccountApi } from "../../service/auth.service";
import ProfileTab from "./ProfileTab.vue";
import OrdersTab from "./OrdersTab.vue";
import WishlistTab from "./WishlistTab.vue";
import ReviewsTab from "./ReviewsTab.vue";
import AddressTab from "./AddressTab.vue";
import SettingsTab from "./SettingTab.vue";
import LoyaltyTab from "./LoyaltyTab.vue";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../utils/sweetAlert";

const props = defineProps({
  isMobileMenuOpen: Boolean,
});

const emit = defineEmits([
  "toggle-mobile-menu",
  "close-mobile-menu",
  "show-password-modal",
  "show-add-address",
  "edit-address",
  "update-stats",
]);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();
const orderStore = useOrderStore();
const wishlistStore = useWishlistStore();
const reviewStore = useReviewStore();

// State - Initialize from URL query param or default to 'profile'
const activeTab = ref(route.query.tab || "profile");
const isEditing = ref(false);
const selectedOrderFilter = ref("all");
const userStats = ref(null);

const editForm = ref({
  name: "",
  email: "",
  phone: "",
  birthDate: "",
  address: "",
});

const menuItems = computed(() => [
  { id: "profile", label: "Profile" },
  {
    id: "orders",
    label: "Orders",
    badge: orderStore.pendingOrders.length || null,
  },
  {
    id: "wishlist",
    label: "Wishlist",
    badge: wishlistStore.wishlistCount || null,
  },
  { id: "reviews", label: "Reviews" },
  { id: "addresses", label: "Addresses" },
  { id: "loyalty", label: "Loyalty" },
  { id: "settings", label: "Settings" },
]);

// Methods
const changeTab = (tabId) => {
  activeTab.value = tabId;
  router.push({ query: { tab: tabId } });
  emit("close-mobile-menu");
};

// Watch for URL query changes (browser back/forward)
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && newTab !== activeTab.value) {
      activeTab.value = newTab;
    }
  }
);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
};

const toggleEdit = () => {
  if (isEditing.value) {
    loadUserData();
  }
  isEditing.value = !isEditing.value;
};

const loadUserData = () => {
  if (authStore.user) {
    editForm.value = {
      name: authStore.user.name || "",
      email: authStore.user.email || "",
      phone: authStore.user.phone || "",
      birthDate: authStore.user.birthDate || "",
      address: authStore.user.address || "",
    };
  }
};

const updateProfile = async () => {
  if (!editForm.value.name || !editForm.value.email) {
    showErrorAlert("Validation Error", "Please fill in all required fields");
    return;
  }

  try {
    await userStore.updateProfile(editForm.value);
    authStore.setAuthStore({
      ...authStore.state,
      user: { ...authStore.state.user, ...editForm.value },
    });
    isEditing.value = false;
    showSuccessAlert("Success!", "Profile updated successfully!");
  } catch (error) {
    console.error("Update profile error:", error);
    showErrorAlert("Error", userStore.error || "Failed to update profile");
  }
};

const handleAvatarUpdate = (newAvatarUrl) => {
  const currentState = authStore.state;
  if (currentState.user) {
    const updatedUser = { ...currentState.user };
    updatedUser.avatar = { url: newAvatarUrl };
    authStore.setAuthStore({
      ...currentState,
      user: updatedUser,
    });
  }
};

const handleAvatarLoadingState = (loading) => {
  emit("avatar-loading", loading);
};

const viewOrderDetail = (order) => {
  router.push(`/orders/${order._id}`);
};

const trackOrder = (orderId) => {
  router.push(`/orders/${orderId}/track`);
};

const cancelOrder = async (orderId) => {
  const confirmed = await showConfirmAlert(
    "Cancel Order",
    "Are you sure you want to cancel this order?",
    "Cancel Order",
    "No"
  );

  if (confirmed) {
    try {
      await orderStore.cancelOrder(orderId);
      showSuccessAlert("Success!", "Order cancelled successfully");
    } catch (error) {
      showErrorAlert("Error", "Failed to cancel order");
    }
  }
};

const clearWishlist = async () => {
  const confirmed = await showConfirmAlert(
    "Clear Wishlist",
    "Are you sure you want to remove all items from wishlist?",
    "Clear All",
    "Cancel"
  );

  if (confirmed) {
    try {
      await wishlistStore.clearWishlist();
      showSuccessAlert("Success!", "Wishlist cleared");
    } catch (error) {
      showErrorAlert("Error", "Failed to clear wishlist");
    }
  }
};

const removeFromWishlist = async (productId) => {
  try {
    await wishlistStore.removeFromWishlist(productId);
    showSuccessAlert("Success!", "Removed from wishlist");
  } catch (error) {
    showErrorAlert("Error", "Failed to remove item");
  }
};

const moveToCart = async (productId) => {
  try {
    await wishlistStore.moveToCart(productId);
    showSuccessAlert("Success!", "Added to cart");
  } catch (error) {
    showErrorAlert("Error", wishlistStore.error || "Failed to add to cart");
  }
};

const deleteAddress = async (addressId) => {
  const confirmed = await showConfirmAlert(
    "Delete Address",
    "Are you sure you want to delete this address?",
    "Delete",
    "Cancel"
  );

  if (confirmed) {
    try {
      await userStore.removeAddress(addressId);
      showSuccessAlert("Success!", "Address deleted");
    } catch (error) {
      showErrorAlert("Error", "Failed to delete address");
    }
  }
};

const setDefaultAddress = async (addressId) => {
  try {
    await userStore.setDefault(addressId);
    showSuccessAlert("Success!", "Default address updated");
  } catch (error) {
    showErrorAlert("Error", "Failed to set default address");
  }
};

const updateNotificationPrefs = async () => {
  try {
    await userStore.updateNotifications(userStore.notificationPreferences);
  } catch (error) {
    console.error("Update notification preferences error:", error);
  }
};

const handleLogout = async () => {
  const confirmed = await showConfirmAlert(
    "Confirm Logout",
    "Are you sure you want to logout?",
    "Logout",
    "Cancel"
  );

  if (confirmed) {
    try {
      await logoutAccountApi();
      authStore.logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      authStore.logout();
      router.push("/auth/login");
    }
  }
};

// Load stats
onMounted(async () => {
  loadUserData();
  try {
    const stats = await userStore.fetchStats();
    userStats.value = stats;
    emit("update-stats", stats);
  } catch (error) {
    console.error("Failed to load stats:", error);
  }
});
</script>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(16px);
}

* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #fb7185, #a78bfa);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #f43f5e, #8b5cf6);
}
</style>