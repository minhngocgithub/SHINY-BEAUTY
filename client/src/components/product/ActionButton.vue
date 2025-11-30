<template>
  <div class="flex gap-3 action-buttons">
    <button
      @click="handleAddToWishlist"
      :disabled="isAddingToWishlist"
      :class="[
        'flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold transition border-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed',
        isInWishlist
          ? 'border-red-600 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-700'
          : 'border-gray-300 text-gray-700 hover:border-rose-500 hover:text-rose-500 hover:bg-gray-50',
      ]"
    >
      <svg
        :class="['w-5 h-5', isAddingToWishlist && 'animate-spin']"
        :fill="isInWishlist ? 'currentColor' : 'none'"
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
      <span>
        {{
          isAddingToWishlist
            ? "Adding..."
            : isInWishlist
            ? "Remove from Wishlist"
            : "Add to Wishlist"
        }}
      </span>
    </button>

    <button
      @click="handleShare"
      class="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-gray-700 transition border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 hover:bg-gray-50"
    >
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
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
      Share
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useWishlistStore } from "../../store/wishlist.store";
import { useAuthStore } from "../../store/auth.store";
import { showWarningAlert } from "../../../utils/sweetAlert";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["share"]);

const wishlistStore = useWishlistStore();
const authStore = useAuthStore();

const isAddingToWishlist = ref(false);

const isInWishlist = computed(() => {
  return wishlistStore.isInWishlist(props.product._id || props.product.id);
});

const handleAddToWishlist = async () => {
  try {
    if (!authStore.state.isLoggedIn) {
      showWarningAlert("You need to be logged in to manage your wishlist.");
      return;
    }

    isAddingToWishlist.value = true;

    if (isInWishlist.value) {
      await wishlistStore.removeFromWishlist(
        props.product._id || props.product.id
      );
    } else {
      await wishlistStore.addToWishlist(props.product);
    }
  } catch (error) {
    console.error("Error updating wishlist:", error);
  } finally {
    isAddingToWishlist.value = false;
  }
};

const handleShare = () => {
  emit("share");
};
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>