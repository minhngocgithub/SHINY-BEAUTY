<template>
  <div
    class="min-h-screen py-8 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50"
  >
    <div class="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button
        @click="$router.push('/orders')"
        class="flex items-center gap-2 mb-6 text-gray-700 transition-all hover:text-rose-600 hover:translate-x-[-4px] bg-transparent"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span class="font-medium">Back to Orders</span>
      </button>

      <!-- Loading State -->
      <div v-if="loading && !currentOrder" class="flex justify-center py-16">
        <div class="relative">
          <Loading />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-16 text-center">
        <div
          class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-red-100 rounded-full"
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p class="mb-4 text-red-600">{{ error }}</p>
        <button
          @click="fetchOrder"
          class="px-6 py-3 font-medium text-white transition-all bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl hover:from-rose-600 hover:to-pink-700 hover:shadow-lg"
        >
          Try Again
        </button>
      </div>

      <!-- Order Content -->
      <div v-else-if="currentOrder" class="space-y-6">
        <!-- Header -->
        <div class="relative overflow-hidden bg-white shadow-lg rounded-2xl">
          <div
            class="absolute top-0 right-0 w-64 h-64 rounded-full opacity-50 bg-gradient-to-br from-rose-100 to-pink-100 blur-3xl -z-0"
          ></div>
          <div class="relative z-10 p-6">
            <div
              class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
            >
              <div>
                <h1
                  class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                >
                  Order #{{ currentOrder._id?.slice(-8).toUpperCase() }}
                </h1>
                <p class="mt-2 text-sm text-gray-600">
                  <span class="inline-flex items-center gap-1">
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {{ formatDate(currentOrder.createdAt) }}
                  </span>
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <span
                  class="px-4 py-2 text-sm font-semibold rounded-full shadow-sm"
                  :class="
                    getStatusClass(
                      currentOrder.status || currentOrder.orderStatus
                    )
                  "
                >
                  {{
                    getStatusLabel(
                      currentOrder.status || currentOrder.orderStatus
                    )
                  }}
                </span>
                <!-- Track Order Button -->
                <button
                  v-if="canTrackOrder"
                  @click="$router.push(`/orders/${currentOrder._id}/track`)"
                  class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg hover:scale-105"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Track Order
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="space-y-6 lg:col-span-2">
            <!-- Order Items -->
            <div class="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div
                class="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50"
              >
                <h2
                  class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                >
                  Order Items
                </h2>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div
                    v-for="item in currentOrder.orderItems"
                    :key="item._id"
                    class="flex gap-4 p-3 pb-4 transition-all border-b border-gray-100 last:border-0 hover:bg-gradient-to-r hover:from-rose-50/30 hover:to-pink-50/30 rounded-xl"
                  >
                    <img
                      :src="getItemImage(item)"
                      :alt="getItemName(item)"
                      class="object-cover w-24 h-24 rounded-xl ring-2 ring-rose-100"
                    />
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-gray-900 truncate">
                        {{ getItemName(item) }}
                      </h3>
                      <p class="mt-1 text-sm text-gray-600">
                        Qty: {{ item.quantity }}
                      </p>
                      <!-- Review Button for Delivered Orders -->
                      <button
                        v-if="isDelivered && (item.product || item.productId)"
                        @click="openReviewModal(item)"
                        class="mt-2 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all shadow-sm hover:shadow-md"
                      >
                        ⭐ Write Review
                      </button>
                      <p
                        v-else-if="isDelivered && item.bundle"
                        class="mt-2 text-xs italic text-gray-500"
                      >
                        Bundle items - Review individual products
                      </p>
                    </div>
                    <div class="text-right">
                      <div
                        class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                      >
                        {{ formatCurrency(item.price * item.quantity) }}
                      </div>
                      <div
                        v-if="item.originalPrice > item.price"
                        class="text-sm text-gray-400 line-through"
                      >
                        {{ formatCurrency(item.originalPrice * item.quantity) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div
                class="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50"
              >
                <h2
                  class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                >
                  Shipping Address
                </h2>
              </div>
              <div class="p-6">
                <div class="space-y-2 text-sm text-gray-600">
                  <p class="font-semibold text-gray-900">
                    {{ currentOrder.shippingAddress?.fullName }}
                  </p>
                  <p>{{ currentOrder.shippingAddress?.phone }}</p>
                  <p>{{ currentOrder.shippingAddress?.address }}</p>
                  <p>
                    {{ currentOrder.shippingAddress?.ward }},
                    {{ currentOrder.shippingAddress?.district }},
                    {{ currentOrder.shippingAddress?.city }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div
                class="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50"
              >
                <h2
                  class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                >
                  Payment Information
                </h2>
              </div>
              <div class="p-6">
                <div class="space-y-3 text-sm">
                  <div
                    class="flex items-center justify-between py-2 border-b border-gray-100"
                  >
                    <span class="text-gray-600">Payment Method</span>
                    <span class="font-semibold text-gray-900">{{
                      getPaymentMethodLabel(currentOrder.paymentMethod)
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2">
                    <span class="text-gray-600">Payment Status</span>
                    <span
                      class="px-3 py-1 text-xs font-semibold rounded-full"
                      :class="
                        currentOrder.isPaid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      "
                    >
                      {{ currentOrder.isPaid ? "Paid" : "Unpaid" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Order Summary -->
            <div class="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div
                class="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50"
              >
                <h2
                  class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                >
                  Order Summary
                </h2>
              </div>
              <div class="p-6">
                <div class="space-y-3 text-sm">
                  <div class="flex items-center justify-between py-2">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-semibold text-gray-900">{{
                      formatCurrency(currentOrder.itemsPrice)
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2">
                    <span class="text-gray-600">Shipping</span>
                    <span class="font-semibold text-gray-900">{{
                      formatCurrency(currentOrder.shippingPrice)
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2">
                    <span class="text-gray-600">Tax</span>
                    <span class="font-semibold text-gray-900">{{
                      formatCurrency(currentOrder.taxPrice)
                    }}</span>
                  </div>
                  <div
                    v-if="currentOrder.totalDiscount > 0"
                    class="flex items-center justify-between py-2"
                  >
                    <span class="text-gray-600">Discount</span>
                    <span class="font-semibold text-rose-600">
                      -{{ formatCurrency(currentOrder.totalDiscount) }}
                    </span>
                  </div>
                  <div
                    class="flex items-center justify-between pt-4 mt-4 border-t-2 border-gray-200"
                  >
                    <span class="text-lg font-bold text-gray-900">Total</span>
                    <span
                      class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                    >
                      {{ formatCurrency(currentOrder.totalPrice) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <OrderTimeline
              v-if="currentOrder.timeline && currentOrder.timeline.length > 0"
              :timeline="currentOrder.timeline"
            />
            <div v-else class="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div
                class="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50"
              >
                <h2
                  class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                >
                  Order Status
                </h2>
              </div>
              <div class="p-6">
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-3 h-3 rounded-full shadow-lg bg-gradient-to-r from-rose-500 to-pink-500"
                    ></div>
                    <div>
                      <p class="font-semibold text-gray-900">
                        {{
                          getStatusLabel(
                            currentOrder.status || currentOrder.orderStatus
                          )
                        }}
                      </p>
                      <p class="text-sm text-gray-600">
                        {{ formatDate(currentOrder.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div
              v-if="canCancel"
              class="overflow-hidden bg-white shadow-lg rounded-2xl"
            >
              <div class="p-6">
                <button
                  @click="showCancelModal = true"
                  :disabled="cancelLoading"
                  class="w-full py-3 font-semibold text-white transition-all shadow-md bg-gradient-to-r from-red-500 to-pink-600 rounded-xl hover:from-red-600 hover:to-pink-700 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Cancel Order
                </button>
              </div>
            </div>

            <!-- Contact Support -->
            <div class="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div class="p-6">
                <div
                  class="flex items-center justify-between p-4 mb-4 border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full"
                    >
                      <svg
                        class="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">Need Help?</h3>
                      <p class="text-sm text-gray-600">
                        Contact our support team
                      </p>
                    </div>
                  </div>
                  <button
                    @click="showSupportModal = true"
                    class="px-4 py-2 text-sm font-medium text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-md"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancel Modal -->
      <div
        v-if="showCancelModal"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
        @click.self="showCancelModal = false"
      >
        <div
          class="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl"
        >
          <div
            class="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50"
          >
            <h3
              class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
            >
              Cancel Order
            </h3>
          </div>
          <div class="p-6">
            <p class="mb-4 text-gray-600">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <textarea
              v-model="cancelReason"
              rows="3"
              placeholder="Reason for cancellation (optional)"
              class="w-full px-4 py-3 mb-6 text-gray-900 placeholder-gray-400 transition-all border border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            ></textarea>
            <div class="flex gap-3">
              <button
                @click="confirmCancel"
                :disabled="cancelLoading"
                class="flex-1 py-3 font-semibold text-white transition-all shadow-md bg-gradient-to-r from-red-500 to-pink-600 rounded-xl hover:from-red-600 hover:to-pink-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ cancelLoading ? "Cancelling..." : "Confirm Cancel" }}
              </button>
              <button
                @click="showCancelModal = false"
                :disabled="cancelLoading"
                class="flex-1 py-3 font-semibold text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Review Modal -->
      <div
        v-if="showReviewModal"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeReviewModal"
      >
        <div
          class="w-full max-w-2xl overflow-hidden bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto"
        >
          <div
            class="sticky top-0 z-10 p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50"
          >
            <div class="flex items-center justify-between">
              <h3
                class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
              >
                ⭐ Write Review
              </h3>
              <button
                @click="closeReviewModal"
                class="text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="p-6">
            <!-- Product Info -->
            <div
              v-if="reviewItem"
              class="flex items-center gap-4 p-4 mb-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl"
            >
              <img
                :src="getItemImage(reviewItem)"
                :alt="getItemName(reviewItem)"
                class="object-cover w-20 h-20 rounded-lg ring-2 ring-rose-200"
              />
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">
                  {{ getItemName(reviewItem) }}
                </h4>
                <p class="text-sm text-gray-600">
                  Quantity: {{ reviewItem.quantity }}
                </p>
              </div>
            </div>

            <!-- Rating -->
            <div class="mb-6">
              <label class="block mb-2 text-sm font-semibold text-gray-700"
                >Your Rating *</label
              >
              <div class="flex gap-2">
                <button
                  v-for="star in 5"
                  :key="star"
                  @click="reviewData.rating = star"
                  type="button"
                  class="text-4xl transition-all hover:scale-110"
                  :class="
                    star <= reviewData.rating
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  "
                >
                  ★
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                {{ ratingLabels[reviewData.rating] || "Click to rate" }}
              </p>
            </div>

            <!-- Review Comment -->
            <div class="mb-6">
              <label class="block mb-2 text-sm font-semibold text-gray-700"
                >Your Review *</label
              >
              <textarea
                v-model="reviewData.comment"
                rows="5"
                placeholder="Share your experience with this product..."
                class="w-full px-4 py-3 text-gray-900 placeholder-gray-400 transition-all border border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">
                {{ reviewData.comment.length }} / 500 characters
              </p>
            </div>

            <!-- Upload Images -->
            <div class="mb-6">
              <label class="block mb-2 text-sm font-semibold text-gray-700"
                >Add Photos (Optional)</label
              >
              <div class="flex flex-wrap gap-3">
                <!-- Image Previews -->
                <div
                  v-for="(preview, index) in imagePreviews"
                  :key="index"
                  class="relative group"
                >
                  <img
                    :src="preview"
                    class="object-cover w-24 h-24 border-2 border-gray-200 rounded-lg"
                  />
                  <button
                    @click="removeImage(index)"
                    type="button"
                    class="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <!-- Upload Button -->
                <label
                  v-if="imagePreviews.length < 5"
                  class="flex items-center justify-center w-24 h-24 transition-all border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-rose-500 hover:bg-rose-50"
                >
                  <input
                    type="file"
                    @change="handleImageUpload"
                    accept="image/*"
                    multiple
                    class="hidden"
                  />
                  <svg
                    class="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </label>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                You can upload up to 5 images (JPG, PNG)
              </p>
            </div>

            <!-- Submit Buttons -->
            <div class="flex gap-3">
              <button
                @click="submitReview"
                :disabled="!canSubmitReview || reviewLoading"
                class="flex-1 py-3 font-semibold text-white transition-all shadow-md bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl hover:from-rose-600 hover:to-pink-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ reviewLoading ? "⏳ Submitting..." : "📝 Submit Review" }}
              </button>
              <button
                @click="closeReviewModal"
                :disabled="reviewLoading"
                class="px-6 py-3 font-semibold text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Support Modal -->
      <div
        v-if="showSupportModal"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeSupportModal"
      >
        <div
          class="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl"
        >
          <div
            class="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50"
          >
            <div class="flex items-center justify-between">
              <h3
                class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                💬 Contact Support
              </h3>
              <button
                @click="closeSupportModal"
                class="text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="p-6">
            <div class="mb-4">
              <label class="block mb-2 text-sm font-medium text-gray-700"
                >Issue Type *</label
              >
              <select
                v-model="supportData.type"
                class="w-full px-4 py-3 text-gray-900 transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="order_issue">📦 Order Issue</option>
                <option value="payment_problem">💳 Payment Problem</option>
                <option value="shipping_delay">🚚 Shipping Delay</option>
                <option value="product_quality">⭐ Product Quality</option>
                <option value="other">ℹ️ Other</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block mb-2 text-sm font-medium text-gray-700"
                >Description *</label
              >
              <textarea
                v-model="supportData.message"
                rows="4"
                placeholder="Please describe your issue in detail..."
                class="w-full px-4 py-3 text-gray-900 placeholder-gray-400 transition-all border border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">
                {{ supportData.message.length }}/2000 characters
              </p>
            </div>

            <div
              v-if="supportMessage"
              class="p-3 mb-4 rounded-lg"
              :class="
                supportSuccess
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              "
            >
              <p class="text-sm">{{ supportMessage }}</p>
            </div>

            <div class="flex gap-3">
              <button
                @click="submitSupport"
                :disabled="!canSubmitSupport || supportLoading"
                class="flex-1 py-3 font-semibold text-white transition-all shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ supportLoading ? "⏳ Sending..." : "📤 Send Request" }}
              </button>
              <button
                @click="closeSupportModal"
                :disabled="supportLoading"
                class="px-6 py-3 font-semibold text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOrderStore } from "../../store/order.store";
import { storeToRefs } from "pinia";
import OrderTimeline from "../../components/order/OrderTimeline.vue";
import Loading from "../../components/Loading.vue";
import { createReviewApi } from "../../service/review.service";
import { createFeedbackApi } from "../../service/feedback.service";
import { showSuccessAlert, showErrorAlert } from "../../../utils/sweetAlert";

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const { currentOrder, loading, error } = storeToRefs(orderStore);

const showCancelModal = ref(false);
const cancelReason = ref("");
const cancelLoading = ref(false);

// Review Modal States
const showReviewModal = ref(false);
const reviewItem = ref(null);
const reviewData = ref({
  rating: 0,
  comment: "",
});
const reviewImages = ref([]);
const imagePreviews = ref([]);
const reviewLoading = ref(false);

// Support Modal States
const showSupportModal = ref(false);
const supportData = ref({
  type: "order_issue",
  message: "",
});
const supportLoading = ref(false);
const supportMessage = ref("");
const supportSuccess = ref(false);

const ratingLabels = {
  1: "😞 Poor",
  2: "🙁 Fair",
  3: "🙂 Good",
  4: "😊 Very Good",
  5: "🤩 Excellent",
};

const canCancel = computed(() => {
  const status = currentOrder.value?.status || currentOrder.value?.orderStatus;
  return status === "PENDING";
});

const isDelivered = computed(() => {
  const status = currentOrder.value?.status || currentOrder.value?.orderStatus;
  return status === "DELIVERED";
});

const canSubmitReview = computed(() => {
  return (
    reviewData.value.rating > 0 &&
    reviewData.value.comment.trim().length >= 10 &&
    reviewData.value.comment.length <= 500
  );
});

const canSubmitSupport = computed(() => {
  return (
    supportData.value.message.trim().length >= 10 &&
    supportData.value.message.length <= 2000
  );
});

const getStatusLabel = (status) => {
  const labels = {
    PENDING: "⏳ Pending",
    CONFIRMED: "✅ Confirmed",
    PREPARING: "📦 Preparing",
    IN_TRANSIT: "🚚 In Transit",
    OUT_FOR_DELIVERY: "🚴 Out for Delivery",
    DELIVERED: "✨ Delivered",
    CANCELLED: "❌ Cancelled",
  };
  return labels[status] || status;
};

const getStatusClass = (status) => {
  const normalizedStatus = status?.toUpperCase() || "";
  const classes = {
    PENDING:
      "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
    CONFIRMED:
      "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    PAID: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    PREPARING:
      "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
    PROCESSING:
      "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
    IN_TRANSIT:
      "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    OUT_FOR_DELIVERY:
      "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    SHIPPED:
      "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    DELIVERED:
      "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    CANCELLED: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
  };
  return (
    classes[normalizedStatus] ||
    "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
  );
};

const getPaymentMethodLabel = (method) => {
  const normalizedMethod = method?.toLowerCase() || "";
  const methods = {
    cod: "Cash on Delivery",
    vnpay: "VNPay",
    momo: "Momo",
    paypal: "PayPal",
    bank_transfer: "Bank Transfer",
  };
  return methods[normalizedMethod] || method;
};

const getItemName = (item) => {
  // Check if name is stored directly in orderItem (saved during order creation)
  if (item.name) return item.name;

  // Fallback to populated product/bundle
  return item.product?.name || item.bundle?.name || "Unknown Item";
};

const getItemImage = (item) => {
  // First check if image is stored directly in orderItem (saved during order creation)
  if (item.image) {
    // Handle if it's already a URL string
    if (typeof item.image === "string") return item.image;
    // Handle if it's an object with url property
    if (item.image.url) return item.image.url;
  }

  // Then check product.image (array)
  if (
    item.product?.image &&
    Array.isArray(item.product.image) &&
    item.product.image.length > 0
  ) {
    return item.product.image[0].url;
  }

  // Then check bundle.image
  if (item.bundle?.image) {
    return Array.isArray(item.bundle.image)
      ? item.bundle.image[0]?.url
      : item.bundle.image?.url || item.bundle.image;
  }

  return "/placeholder.jpg";
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const confirmCancel = async () => {
  try {
    cancelLoading.value = true;
    await orderStore.cancelOrder(route.params.id, cancelReason.value);
    showCancelModal.value = false;
    cancelReason.value = "";
  } catch (err) {
    console.error("Cancel order error:", err);
  } finally {
    cancelLoading.value = false;
  }
};

const openReviewModal = (item) => {
  reviewItem.value = item;
  reviewData.value = {
    rating: 0,
    comment: "",
  };
  reviewImages.value = [];
  imagePreviews.value = [];
  showReviewModal.value = true;
};

const closeReviewModal = () => {
  showReviewModal.value = false;
  reviewItem.value = null;
  reviewData.value = { rating: 0, comment: "" };
  reviewImages.value = [];
  imagePreviews.value = [];
};

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);
  const remainingSlots = 5 - imagePreviews.value.length;
  const filesToAdd = files.slice(0, remainingSlots);

  filesToAdd.forEach((file) => {
    if (file.type.startsWith("image/")) {
      reviewImages.value.push(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreviews.value.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  event.target.value = "";
};

const removeImage = (index) => {
  reviewImages.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
};

const submitReview = async () => {
  if (!canSubmitReview.value) return;

  try {
    reviewLoading.value = true;
    let productId =
      reviewItem.value.product?._id ||
      reviewItem.value.productId?._id ||
      reviewItem.value.productId ||
      reviewItem.value.product;

    // ✅ Convert to string if it's an object
    if (typeof productId === "object" && productId !== null) {
      productId = productId.toString();
    } else if (productId) {
      productId = String(productId);
    }

    if (!productId) {
      console.error("Failed to extract productId from:", reviewItem.value);
      alert("Product information not found. Please try again.");
      return;
    }

    const formData = new FormData();
    formData.append("product", productId); 
    formData.append("rating", String(reviewData.value.rating));
    formData.append("comment", reviewData.value.comment);
    if (currentOrder.value._id) {
      formData.append("orderId", String(currentOrder.value._id));
    }
    reviewImages.value.forEach((image) => {
      formData.append("images", image);
    });

    const response = await createReviewApi(formData);
    console.log("Review Response:", response.data);

    await showSuccessAlert(
      "Thank You! 🎉",
      "Thanks for your review! Your feedback helps other customers make informed decisions."
    );
    closeReviewModal();
  } catch (err) {
    console.error("Submit review error:", err);
    console.error(" Error response:", err.response?.data);
    await showErrorAlert(
      "Review Error",
      err.response?.data?.message ||
        "Failed to submit review. Please try again."
    );
  } finally {
    reviewLoading.value = false;
  }
};

const closeSupportModal = () => {
  showSupportModal.value = false;
  supportData.value = { type: "order_issue", message: "" };
  supportMessage.value = "";
  supportSuccess.value = false;
};

const submitSupport = async () => {
  if (!canSubmitSupport.value || supportLoading.value) return;

  try {
    supportLoading.value = true;
    supportMessage.value = "";

    const feedbackData = {
      type: supportData.value.type,
      message: supportData.value.message,
      relatedOrder: currentOrder.value._id,
    };

    const response = await createFeedbackApi(feedbackData);

    if (response.data.success) {
      supportSuccess.value = true;
      supportMessage.value =
        "Thanks for contact! Our team will get back to you soon.";

      setTimeout(() => {
        closeSupportModal();
      }, 2000);
    }
  } catch (err) {
    console.error("Submit support error:", err);
    supportSuccess.value = false;
    supportMessage.value =
      err.response?.data?.message ||
      "Failed to submit support request. Please try again.";
  } finally {
    supportLoading.value = false;
  }
};

const fetchOrder = async () => {
  await orderStore.getOrder(route.params.id);
};

const canTrackOrder = computed(() => {
  const trackableStatuses = [
    "CONFIRMED",
    "PREPARING",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
  ];
  const status = currentOrder.value?.status || currentOrder.value?.orderStatus;
  return trackableStatuses.includes(status);
});

onMounted(() => {
  fetchOrder();
  if (route.params.id) {
    setTimeout(() => {
      if (currentOrder.value?._id) {
        orderStore.connectOrderSocket(currentOrder.value._id);
        orderStore.requestNotificationPermission();
      }
    }, 500);
  }
});

onUnmounted(() => {
  orderStore.disconnectOrderSocket();
});
</script>
