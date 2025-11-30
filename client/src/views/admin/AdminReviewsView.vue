<template>
  <div class="h-screen overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
        Reviews Management
      </h1>
      <p class="text-slate-600 dark:text-slate-400 mt-1">
        Moderate and respond to customer reviews
      </p>
    </div>

    <!-- Filters -->
    <div
      class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-6"
    >
      <div class="flex items-center gap-2 mb-4">
        <svg
          class="w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
          Bộ Lọc Đánh Giá
        </h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="relative">
          <select
            v-model="filters.status"
            @change="fetchReviews"
            class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">📊 Tất cả trạng thái</option>
            <option value="pending">⏳ Chờ duyệt</option>
            <option value="approved">✅ Đã duyệt</option>
            <option value="rejected">❌ Từ chối</option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          >
            <svg
              class="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <div class="relative">
          <select
            v-model="filters.rating"
            @change="fetchReviews"
            class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">⭐ Tất cả đánh giá</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="2">2 Sao</option>
            <option value="1">1 Sao</option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          >
            <svg
              class="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <div class="relative">
          <select
            v-model="filters.verified"
            @change="fetchReviews"
            class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">📦 Tất cả loại</option>
            <option value="true">✅ Đã mua hàng</option>
            <option value="false">Chưa mua hàng</option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          >
            <svg
              class="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            v-if="selectedReviews.length > 0"
            @click="bulkApprove"
            class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
          >
            Duyệt ({{ selectedReviews.length }})
          </button>
          <button
            v-if="selectedReviews.length > 0"
            @click="bulkReject"
            class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
          >
            Từ chối ({{ selectedReviews.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
    </div>

    <!-- Reviews List -->
    <div v-else class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review._id"
        class="bg-white dark:bg-slate-800 rounded-lg shadow p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Header -->
            <div class="flex items-start gap-4 mb-4">
              <input
                type="checkbox"
                :value="review._id"
                v-model="selectedReviews"
                class="mt-1 rounded border-slate-300"
              />
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <div class="flex items-center">
                    <span
                      v-for="i in 5"
                      :key="i"
                      :class="
                        i <= review.rating
                          ? 'text-yellow-400'
                          : 'text-slate-300'
                      "
                      class="text-lg"
                      >★</span
                    >
                  </div>
                  <span
                    v-if="review.isVerified"
                    class="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded"
                  >
                    Verified Purchase
                  </span>
                  <span
                    :class="getStatusColor(review.status)"
                    class="px-2 py-0.5 rounded text-xs font-medium"
                  >
                    {{ review.status }}
                  </span>
                </div>

                <div class="font-semibold text-slate-900 dark:text-white mb-2">
                  {{ review.title }}
                </div>
                <p class="text-slate-600 dark:text-slate-400 mb-3">
                  {{ review.comment }}
                </p>

                <!-- Images -->
                <div v-if="review.images?.length" class="flex gap-2 mb-3">
                  <img
                    v-for="(img, i) in review.images"
                    :key="i"
                    :src="img"
                    class="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                    @click="openImageModal(img)"
                  />
                </div>

                <!-- User & Product Info -->
                <div class="flex items-center gap-6 text-sm text-slate-500">
                  <span>By {{ review.user?.name || "Anonymous" }}</span>
                  <span>•</span>
                  <span>{{ review.product?.name || "Product" }}</span>
                  <span>•</span>
                  <span>{{ formatDate(review.createdAt) }}</span>
                </div>

                <!-- Admin Response -->
                <div
                  v-if="review.adminResponse"
                  class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500"
                >
                  <div
                    class="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1"
                  >
                    Admin Response:
                  </div>
                  <p class="text-sm text-blue-800 dark:text-blue-300">
                    {{ review.adminResponse }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2 ml-4">
            <button
              v-if="review.status === 'pending'"
              @click="approveReview(review._id)"
              class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm whitespace-nowrap"
            >
              Approve
            </button>
            <button
              v-if="review.status === 'pending'"
              @click="rejectReview(review._id)"
              class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm whitespace-nowrap"
            >
              Reject
            </button>
            <button
              @click="respondToReview(review)"
              class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
            >
              {{ review.adminResponse ? "Edit Response" : "Respond" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="reviews.length === 0" class="text-center py-12">
        <p class="text-slate-600 dark:text-slate-400">No reviews found</p>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex justify-between items-center"
      >
        <span class="text-sm text-slate-600 dark:text-slate-400"
          >Page {{ currentPage }} of {{ totalPages }}</span
        >
        <div class="flex gap-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Response Modal -->
    <div
      v-if="respondingTo"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full p-6"
      >
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Admin Response
        </h3>
        <textarea
          v-model="responseText"
          rows="4"
          placeholder="Write your response..."
          class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-4"
        ></textarea>
        <div class="flex justify-end gap-3">
          <button
            @click="respondingTo = null"
            class="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            @click="submitResponse"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Reactive state
const reviews = ref([]);
const loading = ref(false);
const selectedReviews = ref([]);
const filters = ref({ status: "", rating: "", verified: "" });
const currentPage = ref(1);
const totalPages = ref(1);
const respondingTo = ref(null);
const responseText = ref("");

// Methods
const fetchReviews = async () => {
  loading.value = true;
  // TODO: Implement API call
  setTimeout(() => {
    reviews.value = [];
    loading.value = false;
  }, 500);
};

const approveReview = (id) => {
  console.log("Approve", id);
};

const rejectReview = (id) => {
  console.log("Reject", id);
};

const bulkApprove = () => {
  console.log("Bulk approve", selectedReviews.value);
};

const bulkReject = () => {
  console.log("Bulk reject", selectedReviews.value);
};

const respondToReview = (review) => {
  respondingTo.value = review;
  responseText.value = review.adminResponse || "";
};

const submitResponse = () => {
  console.log("Response:", responseText.value);
  respondingTo.value = null;
};

const changePage = (page) => {
  currentPage.value = page;
  fetchReviews();
};

const getStatusColor = (status) => {
  return (
    {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }[status] || "bg-slate-100 text-slate-800"
  );
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const openImageModal = (img) => {
  window.open(img, "_blank");
};

// Lifecycle
onMounted(() => {
  fetchReviews();
});
</script>
