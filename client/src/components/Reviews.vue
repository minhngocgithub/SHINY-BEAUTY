<template>
  <section class="py-16 bg-gradient-to-b from-slate-100 to-white">
    <div class="px-4 mx-auto"> <!-- Xóa container và max-w-7xl -->
      <!-- Header -->
      <div class="mb-12 text-center">
        <h2 class="text-3xl font-bold text-slate-800 md:text-4xl">
          What Our Clients Are
          <span class="text-blue-600">Saying</span>
        </h2>
        <p class="max-w-2xl mx-auto mt-4 text-slate-600">
          Trusted by thousands of customers who love our products
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div
          class="w-10 h-10 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"
        ></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-12 text-center">
        <p class="text-red-500">{{ error }}</p>
        <button
          @click="fetchTestimonials"
          class="px-4 py-2 mt-4 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>

      <!-- Testimonials Grid -->
      <div
        v-else-if="testimonials.length > 0"
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <div
          v-for="(testimonial, index) in testimonials"
          :key="testimonial._id || index"
          class="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl hover:-translate-y-1"
        >
          <!-- User Info -->
          <div class="flex items-center gap-3 mb-4">
            <img
              :src="getUserAvatar(testimonial.user)"
              :alt="testimonial.user?.name || 'Customer'"
              class="object-cover w-12 h-12 border-2 border-blue-100 rounded-full"
            />
            <div class="flex-1">
              <h4 class="font-semibold text-slate-800">
                {{ testimonial.user?.name || "Anonymous" }}
              </h4>
              <!-- Star Rating -->
              <div class="flex items-center gap-0.5">
                <svg
                  v-for="star in 5"
                  :key="star"
                  class="w-4 h-4"
                  :class="
                    star <= testimonial.rating
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  "
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
            </div>
            <!-- Verified Badge -->
            <span
              v-if="testimonial.verifiedPurchase"
              class="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full"
            >
              ✓ Verified
            </span>
          </div>

          <!-- Review Comment -->
          <p class="leading-relaxed text-slate-600">
            {{ truncateComment(testimonial.comment, 180) }}
          </p>

          <!-- Review Date & Product -->
          <div
            class="flex items-center justify-between pt-4 mt-4 border-t border-slate-100"
          >
            <span class="text-sm font-medium text-blue-600">
              {{ formatDate(testimonial.createdAt) }}
            </span>
            <span
              v-if="testimonial.product?.name"
              class="text-xs text-slate-500"
            >
              on {{ testimonial.product.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-12 text-center">
        <svg
          class="w-16 h-16 mx-auto text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p class="mt-4 text-slate-500">No testimonials available yet</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getTestimonialsApi } from "../service/review.service";

const props = defineProps({
  limit: {
    type: Number,
    default: 4,
  },
});

const testimonials = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchTestimonials = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await getTestimonialsApi({ limit: props.limit });

    if (response.data.success) {
      testimonials.value = response.data.testimonials || [];
    } else {
      error.value = response.data.message || "Failed to load testimonials";
    }
  } catch (err) {
    console.error("Fetch testimonials error:", err);
    error.value = "Failed to load testimonials. Please try again.";
  } finally {
    loading.value = false;
  }
};

const getUserAvatar = (user) => {
  if (!user) return "/default-avatar.png";
  if (user.avatar?.url) return user.avatar.url;
  if (typeof user.avatar === "string") return user.avatar;
  return "/default-avatar.png";
};

const truncateComment = (comment, maxLength = 180) => {
  if (!comment) return "";
  if (comment.length <= maxLength) return comment;
  return comment.substring(0, maxLength).trim() + "...";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

onMounted(() => {
  fetchTestimonials();
});
</script>