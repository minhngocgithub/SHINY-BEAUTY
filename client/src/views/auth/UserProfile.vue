<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50"
  >
    <div
      v-if="globalLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <Loading />
    </div>
    <div
      v-else-if="!authStore.isLoggedIn"
      class="flex items-center justify-center min-h-screen p-4"
    >
      <div
        class="w-full max-w-md p-8 text-center bg-white shadow-2xl rounded-3xl"
      >
        <div class="mb-6 text-6xl">🔒</div>
        <h2 class="mb-4 text-2xl font-bold text-gray-700">
          Authentication Required
        </h2>
        <p class="mb-6 text-gray-500">Please log in to view your profile</p>
        <button
          @click="router.push('/auth/login')"
          class="w-full px-6 py-3 font-medium text-white transition-all duration-200 shadow-sm bg-gradient-to-r from-rose-400 to-violet-400 rounded-xl hover:from-rose-500 hover:to-violet-500"
        >
          Go to Login
        </button>
      </div>
    </div>

    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
    ></div>
    <ModelProfile
      v-if="!globalLoading && authStore.isLoggedIn"
      :isMobileMenuOpen="isMobileMenuOpen"
      @toggle-mobile-menu="isMobileMenuOpen = !isMobileMenuOpen"
      @close-mobile-menu="isMobileMenuOpen = false"
      @show-password-modal="showPasswordModal = true"
      @show-add-address="handleShowAddAddress"
      @edit-address="handleEditAddress"
      @avatar-loading="handleAvatarLoading"
    />

    <ModelChangePassword
      v-if="showPasswordModal"
      @close="showPasswordModal = false"
    />

    <!-- Add/Edit Address Modal -->
    <AddShippingAddressModal
      v-if="showAddAddressModal"
      :editMode="!!editingAddress"
      :addressData="editingAddress"
      @close="handleCloseAddressModal"
      @address-added="handleAddressAdded"
      @address-updated="handleAddressUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../store/auth.store";
import { useUserStore } from "../../store/user.store";
import { useOrderStore } from "../../store/order.store";
import { useWishlistStore } from "../../store/wishlist.store";
import { useReviewStore } from "../../store/review.store";
import { useLoyaltyStore } from "../../store/loyalty.store";
import Loading from "../../components/Loading.vue";
import ModelProfile from "../../components/profile/ModelProfile.vue";
import ModelChangePassword from "../../components/profile/ModelChangePassword.vue";
import AddShippingAddressModal from "../../components/profile/AddShippingAddressModal.vue";
import { showErrorAlert } from "../../../utils/sweetAlert";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const orderStore = useOrderStore();
const wishlistStore = useWishlistStore();
const reviewStore = useReviewStore();
const loyaltyStore = useLoyaltyStore();

const globalLoading = ref(false);
const isMobileMenuOpen = ref(false);
const showPasswordModal = ref(false);
const showAddAddressModal = ref(false);
const editingAddress = ref(null);

const handleAvatarLoading = (loading) => {
  globalLoading.value = loading;
};

const handleShowAddAddress = () => {
  editingAddress.value = null; // Reset editing state
  showAddAddressModal.value = true;
};

const handleEditAddress = (address) => {
  editingAddress.value = address;
  showAddAddressModal.value = true;
};

const handleCloseAddressModal = () => {
  showAddAddressModal.value = false;
  editingAddress.value = null;
};

const handleAddressAdded = async () => {
  showAddAddressModal.value = false;
  editingAddress.value = null;
  await userStore.fetchAddresses();
};

const handleAddressUpdated = async () => {
  showAddAddressModal.value = false;
  editingAddress.value = null;
  await userStore.fetchAddresses();
};

onMounted(async () => {
  try {
    globalLoading.value = true;
    if (!authStore.isLoggedIn) {
      authStore.loadFromStorage();
    }

    if (!authStore.isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    await Promise.allSettled([
      orderStore.fetchMyOrders(),
      wishlistStore.fetchWishlist(),
      reviewStore.fetchMyReviews(),
      userStore.fetchAddresses(),
      userStore.fetchStats(),
      userStore.fetchNotificationPreferences(),
      loyaltyStore.fetchDashboard(),
    ]);
  } catch (error) {
    console.error("Failed to load profile data:", error);
    showErrorAlert("Error", "Failed to load user data");
  } finally {
    globalLoading.value = false;
  }
});
</script>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(16px);
}
</style>