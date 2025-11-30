<template>
  <div class="space-y-6">
    <div class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl">
      <h2 class="mb-6 text-xl font-semibold text-gray-700">My Reviews</h2>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-b-2 rounded-full animate-spin border-rose-400"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="reviews.length === 0" class="py-12 text-center">
        <div class="mb-4 text-6xl">⭐</div>
        <p class="text-gray-500">You haven't reviewed any products yet</p>
        <p class="mt-2 text-sm text-gray-400">Share your experience with products you've purchased</p>
      </div>

      <!-- Reviews List -->
      <div v-else class="space-y-4">
        <div
          v-for="review in reviews"
          :key="review._id"
          class="p-4 bg-white border border-gray-100 rounded-xl"
        >
          <div class="flex gap-4">
            <img
              :src="review.product?.images?.[0]?.url || '/placeholder.png'"
              :alt="review.product?.name"
              class="object-cover w-16 h-16 border border-gray-100 rounded-lg"
            />
            <div class="flex-1">
              <h3 class="font-semibold text-gray-700">{{ review.product?.name }}</h3>
              
              <!-- Rating Stars -->
              <div class="flex items-center gap-2 mt-1">
                <div class="flex">
                  <span v-for="i in 5" :key="i" class="text-sm">
                    {{ i <= review.rating ? '⭐' : '☆' }}
                  </span>
                </div>
                <span class="text-xs text-gray-500">{{ formatDate(review.createdAt) }}</span>
              </div>

              <!-- Review Comment -->
              <p class="mt-2 text-sm text-gray-600">{{ review.comment }}</p>

              <!-- Review Images -->
              <div v-if="review.images && review.images.length > 0" class="flex gap-2 mt-2">
                <img
                  v-for="(img, idx) in review.images"
                  :key="idx"
                  :src="img.url"
                  class="object-cover w-12 h-12 border border-gray-200 rounded-lg cursor-pointer hover:opacity-80"
                  @click="openImagePreview(img.url)"
                />
              </div>

              <!-- Verified Purchase Badge -->
              <div v-if="review.verifiedPurchase" class="flex items-center gap-1 mt-2">
                <span class="text-xs text-emerald-600">✓ Verified Purchase</span>
              </div>

              <!-- Helpful Count -->
              <div v-if="review.helpful && review.helpful.length > 0" class="mt-2 text-xs text-gray-500">
                {{ review.helpful.length }} people found this helpful
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  reviews: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const openImagePreview = (imageUrl) => {
  window.open(imageUrl, '_blank')
}
</script>