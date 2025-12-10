<template>
  <div class="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          💬 Reviews Management
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Moderate and respond to customer reviews professionally
        </p>
      </div>
      <button
        @click="refreshReviews"
        :disabled="loading"
        class="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {{ loading ? "⏳ Loading..." : "🔄 Refresh" }}
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <div
        class="p-6 bg-white rounded-xl shadow-sm dark:bg-gray-800 hover:shadow-md transition"
      >
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
          Total
        </p>
        <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          {{ stats.total }}
        </p>
      </div>
      <div
        class="p-6 bg-white rounded-xl shadow-sm dark:bg-gray-800 hover:shadow-md transition"
      >
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
          Pending
        </p>
        <p class="mt-2 text-3xl font-bold text-yellow-600">
          {{ stats.pending }}
        </p>
      </div>
      <div
        class="p-6 bg-white rounded-xl shadow-sm dark:bg-gray-800 hover:shadow-md transition"
      >
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
          Published
        </p>
        <p class="mt-2 text-3xl font-bold text-green-600">
          {{ stats.published }}
        </p>
      </div>
      <div
        class="p-6 bg-white rounded-xl shadow-sm dark:bg-gray-800 hover:shadow-md transition"
      >
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
          ⭐ Avg
        </p>
        <p class="mt-2 text-3xl font-bold text-blue-600">
          {{ stats.avgRating }}
        </p>
      </div>
      <div
        class="p-6 bg-white rounded-xl shadow-sm dark:bg-gray-800 hover:shadow-md transition"
      >
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
          Replied
        </p>
        <p class="mt-2 text-3xl font-bold text-purple-600">
          {{ stats.withReply }}
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="p-6 mb-6 bg-white rounded-xl shadow-sm dark:bg-gray-800">
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div class="md:col-span-2">
          <input
            v-model="filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="🔍 Search reviews..."
            class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <select
          v-model="filters.status"
          @change="onFilterChange"
          class="px-4 py-2 border rounded-lg dark:bg-gray-700"
        >
          <option value="">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="published">✅ Published</option>
          <option value="hidden">👁️ Hidden</option>
          <option value="flagged">🚩 Flagged</option>
        </select>
        <select
          v-model="filters.rating"
          @change="onFilterChange"
          class="px-4 py-2 border rounded-lg dark:bg-gray-700"
        >
          <option value="">All Ratings</option>
          <option value="5">⭐⭐⭐⭐⭐</option>
          <option value="4">⭐⭐⭐⭐</option>
          <option value="3">⭐⭐⭐</option>
          <option value="2">⭐⭐</option>
          <option value="1">⭐</option>
        </select>
        <select
          v-model="filters.hasReply"
          @change="onFilterChange"
          class="px-4 py-2 border rounded-lg dark:bg-gray-700"
        >
          <option value="">All</option>
          <option value="true">💬 With Replies</option>
          <option value="false">📭 No Replies</option>
        </select>
        <select
          v-model="filters.sortBy"
          @change="onFilterChange"
          class="px-4 py-2 border rounded-lg dark:bg-gray-700"
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="-rating">Highest ⭐</option>
          <option value="rating">Lowest ⭐</option>
        </select>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div
      v-if="selectedReviews.length"
      class="flex items-center justify-between p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
    >
      <span class="font-medium text-blue-900 dark:text-blue-200"
        >{{ selectedReviews.length }} selected</span
      >
      <div class="flex gap-2">
        <button
          @click="bulkAction('published')"
          class="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          ✓ Publish
        </button>
        <button
          @click="bulkAction('hidden')"
          class="px-4 py-2 text-sm text-white bg-orange-600 rounded-lg hover:bg-orange-700"
        >
          Hide
        </button>
        <button
          @click="bulkAction('flagged')"
          class="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Flag
        </button>
        <button
          @click="clearSelection"
          class="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <!-- Reviews List -->
    <div v-else-if="reviews.length" class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review._id"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
      >
        <!-- Header -->
        <div class="flex items-start gap-4 p-6 border-b dark:border-gray-700">
          <input
            type="checkbox"
            :value="review._id"
            v-model="selectedReviews"
            class="mt-1 rounded"
          />
          <img
            :src="review.user?.avatar || '/avatar.png'"
            class="w-12 h-12 rounded-full object-cover"
          />
          <div class="flex-1">
            <div class="flex items-start justify-between mb-2">
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-semibold text-gray-900 dark:text-white">
                    {{ review.user?.name || "Anonymous" }}
                  </h4>
                  <span
                    v-if="review.verifiedPurchase"
                    class="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 rounded-full"
                    >✓ Verified</span
                  >
                </div>
                <div
                  class="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400"
                >
                  <div class="flex">
                    <span
                      v-for="i in 5"
                      :key="i"
                      :class="
                        i <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      "
                      >★</span
                    >
                  </div>
                  <span>•</span>
                  <span>{{ formatDate(review.createdAt) }}</span>
                </div>
              </div>
              <span
                :class="getStatusClass(review.status)"
                class="px-3 py-1 text-xs font-semibold rounded-full"
                >{{ getStatusLabel(review.status) }}</span
              >
            </div>

            <!-- Product -->
            <div
              v-if="review.product"
              class="flex items-center gap-3 p-3 mb-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <img
                :src="review.product.images?.[0]?.url"
                class="w-12 h-12 rounded object-cover"
              />
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 dark:text-white truncate">
                  {{ review.product.name }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  ${{ review.product.price }}
                </p>
              </div>
            </div>

            <!-- Comment -->
            <p
              class="mb-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
            >
              {{ review.comment }}
            </p>

            <!-- Images -->
            <div v-if="review.images?.length" class="flex gap-2 mb-4">
              <img
                v-for="(img, i) in review.images"
                :key="i"
                :src="img.url"
                @click="openImageModal(img.url)"
                class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
              />
            </div>

            <!-- Flag Info -->
            <div
              v-if="review.flaggedBy?.length"
              class="p-3 mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
            >
              <p class="text-sm font-medium text-red-900 dark:text-red-200">
                🚩 Flagged by {{ review.flaggedBy.length }} users
              </p>
              <p class="text-xs text-red-700 dark:text-red-300">
                {{ review.flaggedBy.map((f) => f.reason).join(", ") }}
              </p>
            </div>
          </div>
        </div>

        <!-- Admin Replies (Chat Style) -->
        <div
          v-if="review.reply?.length"
          class="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-b dark:border-gray-700"
        >
          <h5
            class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
          >
            💬 Admin Replies ({{ review.reply.length }})
          </h5>
          <div class="space-y-3">
            <div
              v-for="(reply, idx) in review.reply"
              :key="idx"
              class="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
            >
              <img
                :src="reply.admin?.avatar || '/admin.png'"
                class="w-8 h-8 rounded-full object-cover"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-medium text-blue-600">{{
                    reply.admin?.name || "Admin"
                  }}</span>
                  <span class="text-xs text-gray-500">{{
                    formatDate(reply.repliedAt)
                  }}</span>
                </div>
                <p
                  class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                >
                  {{ reply.message }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-700/30">
          <button
            v-if="review.status === 'pending'"
            @click="moderateReview(review._id, 'published')"
            class="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            ✓ Publish
          </button>
          <button
            v-if="review.status === 'published'"
            @click="moderateReview(review._id, 'hidden')"
            class="px-4 py-2 text-sm text-white bg-orange-600 rounded-lg hover:bg-orange-700"
          >
            Hide
          </button>
          <button
            v-if="review.status !== 'flagged'"
            @click="moderateReview(review._id, 'flagged')"
            class="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Flag
          </button>
          <button
            @click="openReplyModal(review)"
            class="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            💬 {{ review.reply?.length ? "Add Reply" : "Reply" }}
          </button>
          <button
            @click="deleteReview(review._id)"
            class="px-4 py-2 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="py-12 text-center bg-white dark:bg-gray-800 rounded-xl">
      <p class="text-gray-600 dark:text-gray-400 mb-2">No reviews found</p>
      <p class="text-sm text-gray-500">Try adjusting your filters</p>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-6">
      <button
        v-for="page in pagination.pages"
        :key="page"
        @click="goToPage(page)"
        :class="[
          'px-4 py-2 rounded-lg',
          page === pagination.page
            ? 'bg-blue-600 text-white'
            : 'bg-white dark:bg-gray-800 hover:bg-gray-100',
        ]"
      >
        {{ page }}
      </button>
    </div>

    <!-- Reply Modal -->
    <div
      v-if="replyModal.show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeReplyModal"
    >
      <div
        class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
      >
        <div
          class="flex items-center justify-between p-6 border-b dark:border-gray-700"
        >
          <h3 class="text-xl font-bold">💬 Reply to Review</h3>
          <button
            @click="closeReplyModal"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <!-- Review Context -->
        <div
          class="p-4 bg-gray-50 dark:bg-gray-700/30 border-b dark:border-gray-700"
        >
          <div class="flex items-center gap-3 mb-2">
            <img
              :src="replyModal.review?.user?.avatar"
              class="w-10 h-10 rounded-full"
            />
            <div>
              <p class="font-medium">{{ replyModal.review?.user?.name }}</p>
              <div class="flex">
                <span
                  v-for="i in 5"
                  :key="i"
                  :class="
                    i <= replyModal.review?.rating
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  "
                  >★</span
                >
              </div>
            </div>
          </div>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            "{{ replyModal.review?.comment }}"
          </p>
        </div>

        <!-- Previous Replies -->
        <div
          v-if="replyModal.review?.reply?.length"
          class="max-h-60 overflow-y-auto p-4 space-y-3 border-b dark:border-gray-700"
        >
          <div
            v-for="(reply, idx) in replyModal.review.reply"
            :key="idx"
            class="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
          >
            <img :src="reply.admin?.avatar" class="w-8 h-8 rounded-full" />
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-blue-600">{{
                  reply.admin?.name
                }}</span>
                <span class="text-xs text-gray-500">{{
                  formatDate(reply.repliedAt)
                }}</span>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ reply.message }}
              </p>
            </div>
          </div>
        </div>

        <!-- Reply Input -->
        <div class="p-6">
          <textarea
            v-model="replyModal.message"
            rows="6"
            placeholder="Write your reply..."
            class="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none focus:ring-2 focus:ring-blue-500"
          ></textarea>

          <!-- Quick Templates -->
          <div class="mt-3 mb-4">
            <p class="text-xs font-medium text-gray-600 mb-2">
              Quick Templates:
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="t in templates"
                :key="t.label"
                @click="replyModal.message = t.text"
                class="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-full"
              >
                {{ t.label }}
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              @click="closeReplyModal"
              class="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="submitReply"
              :disabled="!replyModal.message.trim() || submitting"
              class="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ submitting ? "Sending..." : "Send Reply" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="imageModal.show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      @click="closeImageModal"
    >
      <img
        :src="imageModal.url"
        @click.stop
        class="max-w-4xl max-h-[90vh] object-contain rounded-lg"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  getAllReviewsForAdminApi,
  moderateReviewApi,
  replyToReviewApi,
  bulkModerateReviewsApi,
} from "../../service/review.service";
import axiosApiInstance from "../../../utils/api";

const reviews = ref([]);
const loading = ref(false);
const submitting = ref(false);
const selectedReviews = ref([]);
const filters = ref({
  search: "",
  status: "",
  rating: "",
  hasReply: "",
  sortBy: "-createdAt",
  page: 1,
  limit: 20,
});
const pagination = ref({ total: 0, page: 1, limit: 10, pages: 1 });
const statsData = ref({});
const replyModal = ref({ show: false, review: null, message: "" });
const imageModal = ref({ show: false, url: "" });

const templates = [
  {
    label: "Thank You",
    text: "Thank you for your wonderful feedback! We appreciate your support.",
  },
  {
    label: "Apology",
    text: "We sincerely apologize for the inconvenience. We'll work to improve.",
  },
  {
    label: "Follow Up",
    text: "Thank you for bringing this to our attention. Our team will follow up with you.",
  },
];

const stats = computed(() => {
  const byStatus = statsData.value.byStatus || [];
  const overall = statsData.value.overall?.[0] || {};
  return {
    total: overall.total || 0,
    pending: byStatus.find((s) => s._id === "pending")?.count || 0,
    published: byStatus.find((s) => s._id === "published")?.count || 0,
    avgRating: overall.avgRating ? overall.avgRating.toFixed(1) : "0.0",
    withReply: overall.withReply || 0,
  };
});

let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.value.page = 1;
    fetchReviews();
  }, 300);
};

const fetchReviews = async () => {
  loading.value = true;
  try {
    const params = { ...filters.value };
    // Remove empty string values but keep page and limit
    Object.keys(params).forEach((k) => {
      if (params[k] === "" && k !== "page" && k !== "limit") {
        delete params[k];
      }
    });
    console.log("Fetching reviews with params:", params);
    const res = await getAllReviewsForAdminApi(params);
    const data = res.data.data;
    reviews.value = data.reviews;
    pagination.value = data.pagination;
    statsData.value = data.stats;
  } catch (err) {
    console.error("Error fetching reviews:", err);
    alert(
      "Failed to load reviews: " + (err.response?.data?.message || err.message)
    );
  } finally {
    loading.value = false;
  }
};

const onFilterChange = () => {
  filters.value.page = 1;
  fetchReviews();
};

const refreshReviews = () => {
  filters.value.page = 1;
  fetchReviews();
};

const goToPage = (page) => {
  filters.value.page = page;
  fetchReviews();
};

const moderateReview = async (id, status) => {
  if (!confirm(`Set to "${status}"?`)) return;
  try {
    await moderateReviewApi(id, status);
    await fetchReviews();
  } catch (err) {
    console.error(err);
    alert("Failed");
  }
};

const bulkAction = async (status) => {
  if (!confirm(`Set ${selectedReviews.value.length} to "${status}"?`)) return;
  try {
    await bulkModerateReviewsApi(selectedReviews.value, status);
    selectedReviews.value = [];
    await fetchReviews();
  } catch (err) {
    alert("Failed");
  }
};

const clearSelection = () => {
  selectedReviews.value = [];
};
const openReplyModal = (review) => {
  replyModal.value = { show: true, review, message: "" };
};
const closeReplyModal = () => {
  replyModal.value = { show: false, review: null, message: "" };
};

const submitReply = async () => {
  if (!replyModal.value.message.trim()) return;
  submitting.value = true;
  try {
    await replyToReviewApi(
      replyModal.value.review._id,
      replyModal.value.message
    );
    closeReplyModal();
    await fetchReviews();
  } catch (err) {
    alert("Failed");
  } finally {
    submitting.value = false;
  }
};

const deleteReview = async (id) => {
  if (!confirm("Delete? Cannot undo.")) return;
  try {
    await axiosApiInstance.delete(`/review/${id}/admin`);
    await fetchReviews();
  } catch (err) {
    alert("Failed");
  }
};

const openImageModal = (url) => {
  imageModal.value = { show: true, url };
};
const closeImageModal = () => {
  imageModal.value = { show: false, url: "" };
};

const getStatusClass = (status) =>
  ({
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    published:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    hidden: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
    flagged: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }[status] || "");

const getStatusLabel = (status) =>
  ({
    pending: "Pending",
    published: "Published",
    hidden: "Hidden",
    flagged: "Flagged",
  }[status] || status);

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  fetchReviews();
});
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
