<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" @click.self="emit('close')">
    <div
      class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        @click="emit('close')"
      ></div>

      <!-- Modal panel -->
      <div
        class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl dark:bg-gray-800 sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full"
      >
        <!-- Header with Real-time Badge -->
        <div
          class="relative flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700"
        >
          <div class="flex items-center gap-4">
            <div>
              <h3 class="text-xl font-bold text-white">Order Details</h3>
              <p class="mt-1 text-sm text-blue-100">
                {{ order.orderNumber || order._id }}
              </p>
            </div>
            <!-- Real-time Status Badge -->
            <div
              v-if="isRealtime"
              class="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 backdrop-blur-sm"
            >
              <span class="relative flex w-2 h-2">
                <span
                  class="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"
                ></span>
                <span
                  class="relative inline-flex w-2 h-2 bg-green-500 rounded-full"
                ></span>
              </span>
              <span class="text-xs font-medium text-green-100">Real-time</span>
            </div>
          </div>
          <button
            @click="emit('close')"
            class="text-white transition-colors hover:text-gray-200"
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

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center p-8">
          <Loading />
        </div>

        <!-- Content -->
        <div v-else class="max-h-[80vh] overflow-y-auto">
          <!-- Order Info Grid -->
          <div
            class="grid grid-cols-1 gap-6 p-6 md:grid-cols-3 bg-gray-50 dark:bg-gray-900"
          >
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Customer</p>
              <p class="font-semibold text-gray-900 dark:text-white">
                {{ order.user?.name }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {{ order.user?.email }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
              <p class="font-semibold text-gray-900 dark:text-white">
                {{ formatDate(order.createdAt) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Total Amount
              </p>
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${{ order.totalPrice?.toFixed(2) }}
              </p>
            </div>
          </div>

          <!-- Tabs -->
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="flex -mb-px">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'px-6 py-3 font-medium text-sm border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                ]"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            <!-- Items Tab -->
            <div v-if="activeTab === 'items'">
              <h4 class="mb-4 font-semibold text-gray-900 dark:text-white">
                Order Items
              </h4>
              <div class="space-y-4">
                <div
                  v-for="item in order.orderItems"
                  :key="item._id"
                  class="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900"
                >
                  <img
                    :src="getItemImage(item)"
                    :alt="getItemName(item)"
                    class="object-cover w-20 h-20 rounded"
                  />
                  <div class="flex-1">
                    <h5 class="font-semibold text-gray-900 dark:text-white">
                      {{ item.product?.name }}
                    </h5>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {{ item.quantity }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Price: ${{ item.price?.toFixed(2) }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-gray-900 dark:text-white">
                      ${{ (item.price * item.quantity).toFixed(2) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Price Breakdown -->
              <div
                class="p-4 mt-6 space-y-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"
              >
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span class="font-medium text-gray-900 dark:text-white"
                    >${{ order.itemsPrice?.toFixed(2) }}</span
                  >
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span class="font-medium text-gray-900 dark:text-white"
                    >${{ order.shippingPrice?.toFixed(2) }}</span
                  >
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Tax</span>
                  <span class="font-medium text-gray-900 dark:text-white"
                    >${{ order.taxPrice?.toFixed(2) }}</span
                  >
                </div>
                <div
                  class="flex justify-between pt-2 text-lg font-bold border-t border-blue-200 dark:border-blue-700"
                >
                  <span class="text-gray-900 dark:text-white">Total</span>
                  <span class="text-blue-600 dark:text-blue-400"
                    >${{ order.totalPrice?.toFixed(2) }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Timeline Tab -->
            <div v-else-if="activeTab === 'timeline'">
              <div
                v-if="timeline.length === 0"
                class="py-8 text-center text-gray-500 dark:text-gray-400"
              >
                <div
                  class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full dark:bg-gray-700"
                >
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p class="text-sm">No timeline data available</p>
              </div>
              <OrderStatusStepper
                v-else
                :status="order.status"
                :created-at="order.createdAt"
                :paid-at="order.paidAt"
                :shipped-at="order.shippedAt"
                :delivered-at="order.deliveredAt"
                :cancelled-at="order.cancelledAt"
                :timeline-events="timeline"
              />
            </div>

            <!-- Tracking Tab with Map -->
            <div v-else-if="activeTab === 'tracking'">
              <div v-if="!trackingData" class="py-8 text-center">
                <div
                  class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full dark:bg-blue-900/20"
                >
                  <svg
                    class="w-8 h-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
                <h3
                  class="mb-2 text-lg font-semibold text-gray-900 dark:text-white"
                >
                  Load Tracking Information
                </h3>
                <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  View real-time location and delivery status
                </p>
                <button
                  @click="loadTracking"
                  :disabled="loadingTracking"
                  class="px-6 py-3 text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="loadingTracking" class="flex items-center gap-2">
                    <svg
                      class="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </span>
                  <span v-else>Load Tracking</span>
                </button>
              </div>
              <div v-else class="space-y-6">
                <!-- Tracking Header -->
                <div
                  class="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                >
                  <div>
                    <p
                      class="text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                      Tracking Number
                    </p>
                    <p
                      class="mt-1 text-2xl font-bold text-gray-900 dark:text-white"
                    >
                      {{
                        trackingData.trackingNumber ||
                        order.trackingNumber ||
                        "N/A"
                      }}
                    </p>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Carrier:
                      <span class="font-medium">{{
                        trackingData.carrier || "Standard Delivery"
                      }}</span>
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Last Updated
                    </p>
                    <p class="mt-1 font-semibold text-gray-900 dark:text-white">
                      {{
                        formatDateTime(trackingData.lastUpdate || new Date())
                      }}
                    </p>
                  </div>
                </div>

                <!-- Origin & Destination Cards -->
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <!-- Origin -->
                  <div
                    class="p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-green-50 dark:bg-green-900/10"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full dark:bg-green-900/30"
                      >
                        <svg
                          class="w-5 h-5 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                          />
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p
                          class="text-xs font-medium text-green-600 dark:text-green-400 uppercase"
                        >
                          From (Warehouse)
                        </p>
                        <p
                          class="mt-1 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{
                            mapData?.origin?.address || "Ga Thường Tín, Hà Nội"
                          }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Destination -->
                  <div
                    class="p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/30"
                      >
                        <svg
                          class="w-5 h-5 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p
                          class="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase"
                        >
                          To (Customer)
                        </p>
                        <p
                          class="mt-1 text-sm font-medium text-gray-900 dark:text-white truncate"
                          :title="mapData?.destination?.address"
                        >
                          {{
                            mapData?.destination?.address ||
                            getShippingAddressString(order) ||
                            "Customer Address"
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Live Map -->
                <div
                  v-if="mapData"
                  class="overflow-hidden rounded-lg shadow-lg"
                >
                  <OrderTrackingMap
                    :origin="mapData.origin"
                    :destination="mapData.destination"
                    :current-location="mapData.currentLocation"
                    :route="mapData.route"
                  />
                </div>

                <!-- Tracking Stats Grid -->
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <!-- Progress Card -->
                  <div
                    class="p-4 transition-shadow bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 hover:shadow-md"
                  >
                    <div class="flex items-center gap-3 mb-3">
                      <div
                        class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/30"
                      >
                        <svg
                          class="w-5 h-5 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          Progress
                        </p>
                        <p
                          class="text-lg font-bold text-gray-900 dark:text-white"
                        >
                          {{ trackingData.progress || 0 }}%
                        </p>
                      </div>
                    </div>
                    <div
                      class="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700"
                    >
                      <div
                        class="h-2 transition-all duration-500 bg-blue-600 rounded-full"
                        :style="{ width: `${trackingData.progress || 0}%` }"
                      ></div>
                    </div>
                  </div>

                  <!-- Estimated Delivery -->
                  <div
                    class="p-4 transition-shadow bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 hover:shadow-md"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full dark:bg-green-900/30"
                      >
                        <svg
                          class="w-5 h-5 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          Est. Delivery
                        </p>
                        <p
                          class="text-lg font-semibold text-gray-900 dark:text-white"
                        >
                          {{ formatDate(trackingData.estimatedDelivery) }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Current Location -->
                  <div
                    class="p-4 transition-shadow bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 hover:shadow-md"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full dark:bg-purple-900/30"
                      >
                        <svg
                          class="w-5 h-5 text-purple-600 dark:text-purple-400"
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
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          Current Location
                        </p>
                        <p
                          class="text-sm font-medium text-gray-900 truncate dark:text-white"
                          :title="trackingData.currentLocation?.address"
                        >
                          {{
                            trackingData.currentLocation?.address || "Unknown"
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Shipper Info (if available) -->
                <ShipperInfoCard
                  v-if="trackingData?.shipper"
                  :shipper="trackingData.shipper"
                  :vehicle="trackingData.vehicle"
                  :order-id="order._id"
                  class="mt-6"
                />

                <!-- Refresh Button -->
                <div class="flex justify-center mt-6">
                  <button
                    @click="refreshTracking"
                    :disabled="loadingTracking"
                    class="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      class="w-5 h-5"
                      :class="{ 'animate-spin': loadingTracking }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span v-if="loadingTracking">Refreshing...</span>
                    <span v-else>Refresh Location</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Shipping Tab -->
            <div v-else-if="activeTab === 'shipping'">
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h5 class="mb-3 font-semibold text-gray-900 dark:text-white">
                    Shipping Address
                  </h5>
                  <div
                    class="p-4 space-y-2 rounded-lg bg-gray-50 dark:bg-gray-900"
                  >
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ getShippingField("fullName") }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">
                      {{ getShippingField("address") }}
                    </p>
                    <p
                      v-if="
                        getShippingField('ward') || getShippingField('district')
                      "
                      class="text-gray-600 dark:text-gray-400"
                    >
                      {{
                        [getShippingField("ward"), getShippingField("district")]
                          .filter(Boolean)
                          .join(", ")
                      }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">
                      {{
                        getShippingField("city") || getShippingField("province")
                      }}
                      <span v-if="getShippingField('postalCode')">
                        - {{ getShippingField("postalCode") }}</span
                      >
                    </p>
                    <p
                      v-if="getShippingField('country')"
                      class="text-gray-600 dark:text-gray-400"
                    >
                      {{ getShippingField("country") }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">
                      📞
                      {{
                        getShippingField("phone") || getShippingField("phoneNo")
                      }}
                    </p>
                  </div>
                </div>
                <div>
                  <h5 class="mb-3 font-semibold text-gray-900 dark:text-white">
                    Payment Information
                  </h5>
                  <div
                    class="p-4 space-y-2 rounded-lg bg-gray-50 dark:bg-gray-900"
                  >
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-400"
                        >Method:</span
                      >
                      <span class="font-medium text-gray-900 dark:text-white">{{
                        formatPaymentMethod(order.paymentMethod)
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-400"
                        >Status:</span
                      >
                      <span
                        :class="
                          getPaymentStatusClass(
                            order.isPaid,
                            order.paymentResult
                          )
                        "
                      >
                        {{
                          formatPaymentStatus(order.isPaid, order.paymentResult)
                        }}
                      </span>
                    </div>
                    <div v-if="order.paidAt" class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-400"
                        >Paid At:</span
                      >
                      <span class="font-medium text-gray-900 dark:text-white">{{
                        formatDateTime(order.paidAt)
                      }}</span>
                    </div>
                    <div
                      v-if="order.paymentResult?.transactionId"
                      class="flex justify-between"
                    >
                      <span class="text-gray-600 dark:text-gray-400"
                        >Transaction ID:</span
                      >
                      <span
                        class="font-medium text-gray-900 dark:text-white text-xs"
                        >{{ order.paymentResult.transactionId }}</span
                      >
                    </div>
                  </div>

                  <!-- Shipping Info -->
                  <h5
                    class="mt-6 mb-3 font-semibold text-gray-900 dark:text-white"
                  >
                    Shipping Details
                  </h5>
                  <div
                    class="p-4 space-y-2 rounded-lg bg-gray-50 dark:bg-gray-900"
                  >
                    <div
                      v-if="order.trackingNumber"
                      class="flex justify-between"
                    >
                      <span class="text-gray-600 dark:text-gray-400"
                        >Tracking #:</span
                      >
                      <span
                        class="font-medium text-blue-600 dark:text-blue-400"
                        >{{ order.trackingNumber }}</span
                      >
                    </div>
                    <div v-if="order.shippingZone" class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-400"
                        >Zone:</span
                      >
                      <span
                        class="font-medium text-gray-900 dark:text-white capitalize"
                        >{{ order.shippingZone }}</span
                      >
                    </div>
                    <div
                      v-if="order.shippingDistance"
                      class="flex justify-between"
                    >
                      <span class="text-gray-600 dark:text-gray-400"
                        >Distance:</span
                      >
                      <span class="font-medium text-gray-900 dark:text-white"
                        >{{ order.shippingDistance }} km</span
                      >
                    </div>
                    <div
                      v-if="order.estimatedDeliveryDate"
                      class="flex justify-between"
                    >
                      <span class="text-gray-600 dark:text-gray-400"
                        >Est. Delivery:</span
                      >
                      <span
                        class="font-medium text-green-600 dark:text-green-400"
                        >{{ formatDate(order.estimatedDeliveryDate) }}</span
                      >
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-400"
                        >Shipping Fee:</span
                      >
                      <span class="font-medium text-gray-900 dark:text-white"
                        >${{ order.shippingPrice?.toFixed(2) || "0.00" }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Admin Notes Tab -->
            <div v-else-if="activeTab === 'notes'">
              <div class="space-y-4">
                <!-- Notes List -->
                <div
                  v-for="(note, index) in order.adminNotes || []"
                  :key="note._id || index"
                  class="p-4 border-l-4 border-yellow-400 rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
                >
                  <p class="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {{ note.note }}
                  </p>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    By {{ note.admin?.name || "Admin" }} •
                    {{ formatDateTime(note.createdAt) }}
                  </p>
                </div>

                <!-- Empty State -->
                <div
                  v-if="!order.adminNotes || order.adminNotes.length === 0"
                  class="py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  <div
                    class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full dark:bg-gray-700"
                  >
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <p class="text-sm">No admin notes yet</p>
                  <p class="mt-1 text-xs">
                    Add notes to track important information about this order
                  </p>
                </div>

                <!-- Add Note Form -->
                <div
                  class="p-4 mt-6 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                >
                  <h5 class="mb-3 font-medium text-gray-900 dark:text-white">
                    Add New Note
                  </h5>
                  <textarea
                    v-model="newNote"
                    rows="3"
                    placeholder="Enter note about this order..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  ></textarea>
                  <div class="flex items-center justify-between mt-3">
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Notes are visible to admins only
                    </p>
                    <button
                      @click="addNote"
                      :disabled="!newNote.trim() || addingNote"
                      class="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg
                        v-if="addingNote"
                        class="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>{{ addingNote ? "Adding..." : "Add Note" }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700"
        >
          <!-- Auto Status Info -->
          <div
            class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
          >
            <svg
              class="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              >Order status updates automatically based on delivery
              timeline</span
            >
          </div>

          <div class="flex gap-3">
            <button
              v-if="['PENDING', 'CONFIRMED'].includes(order.status)"
              @click="cancelOrder"
              class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Cancel Order
            </button>
            <button
              @click="emit('close')"
              class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
  getOrderDetailApi,
  getOrderTrackingApi,
  getOrderTimelineApi,
} from "../../../service/order.service";
import {
  updateOrderStatusApi,
  adminCancelOrderApi,
  addAdminNotesApi,
} from "../../../service/admin.service";
import OrderTrackingMap from "../../order/OrderTrackingMap.vue";
import OrderStatusStepper from "../../order/OrderStatusStepper.vue";
import ShipperInfoCard from "../../order/ShipperInfoCard.vue";
import Loading from "../../Loading.vue";
import { useAdminSocketStore } from "../../../store/admin/adminSocket.store";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(["close", "updated"]);

// State
const loading = ref(false);
const loadingTracking = ref(false);
const addingNote = ref(false);
const activeTab = ref("items");
const tabs = ref([
  { id: "items", label: "Items" },
  { id: "timeline", label: "Timeline" },
  { id: "tracking", label: "Live Tracking" },
  { id: "shipping", label: "Shipping & Payment" },
  { id: "notes", label: "Admin Notes" },
]);
const timeline = ref([]);
const trackingData = ref(null);
const mapData = ref(null);
const newNote = ref("");
const realtimeInterval = ref(null);
const isRealtime = ref(false);
const socketListeners = ref([]);

// Store
const adminSocketStore = useAdminSocketStore();

// Lifecycle hooks
onMounted(() => {
  loadTimeline();

  // Setup real-time listeners
  if (adminSocketStore.isConnected) {
    isRealtime.value = true;
    setupRealtimeListeners();
  }

  // Auto-load tracking if order is in transit
  if (["IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(props.order.status)) {
    activeTab.value = "tracking";
    loadTracking();
  }
});

onUnmounted(() => {
  cleanupRealtimeListeners();
  if (realtimeInterval.value) {
    clearInterval(realtimeInterval.value);
  }
});

// Real-time socket functions
const setupRealtimeListeners = () => {
  if (!adminSocketStore.socket) return;

  const orderUpdateListener = (response) => {
    if (response.success && response.data._id === props.order._id) {
      console.log("[OrderDetail] Real-time order update received");
    }
  };

  adminSocketStore.socket.on("admin:order:updated", orderUpdateListener);
  socketListeners.value.push({
    event: "admin:order:updated",
    listener: orderUpdateListener,
  });
};

const cleanupRealtimeListeners = () => {
  if (!adminSocketStore.socket) return;

  socketListeners.value.forEach(({ event, listener }) => {
    adminSocketStore.socket.off(event, listener);
  });
  socketListeners.value = [];
};

// API functions
const loadTimeline = async () => {
  try {
    // First check if timeline is already available in the order prop
    if (props.order.timeline && props.order.timeline.length > 0) {
      timeline.value = props.order.timeline;
      return;
    }

    // If not, fetch from API
    const response = await getOrderTimelineApi(props.order._id);
    if (response.timeline && response.timeline.length > 0) {
      timeline.value = response.timeline;
    } else {
      // Create a default timeline based on order status for display
      timeline.value = createDefaultTimeline(props.order);
    }
  } catch (err) {
    console.error("Failed to load timeline:", err);
    // Fallback to order's timeline or create default
    if (props.order.timeline && props.order.timeline.length > 0) {
      timeline.value = props.order.timeline;
    } else {
      timeline.value = createDefaultTimeline(props.order);
    }
  }
};

// Create a default timeline based on order data
const createDefaultTimeline = (order) => {
  const defaultTimeline = [];

  // Order created - no location needed for pending
  defaultTimeline.push({
    status: "PENDING",
    message: "Order placed successfully",
    timestamp: order.createdAt,
  });

  // Add confirmed if status is beyond PENDING
  if (
    [
      "CONFIRMED",
      "PREPARING",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ].includes(order.status?.toUpperCase())
  ) {
    defaultTimeline.push({
      status: "CONFIRMED",
      message: "Order confirmed by admin",
      timestamp: order.confirmedAt || order.createdAt,
    });
  }

  // Add preparing if applicable
  if (
    ["PREPARING", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
      order.status?.toUpperCase()
    )
  ) {
    defaultTimeline.push({
      status: "PREPARING",
      message: "Order is being prepared for shipping",
      timestamp: order.preparingAt || order.createdAt,
    });
  }

  // Add in transit if applicable - show warehouse as origin
  if (
    ["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
      order.status?.toUpperCase()
    )
  ) {
    defaultTimeline.push({
      status: "IN_TRANSIT",
      message: "Order has been shipped",
      timestamp: order.shippedAt || order.createdAt,
      location: "Departed from warehouse",
    });
  }

  // Add out for delivery if applicable
  if (["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status?.toUpperCase())) {
    defaultTimeline.push({
      status: "OUT_FOR_DELIVERY",
      message: "Order is out for delivery",
      timestamp: order.outForDeliveryAt || order.createdAt,
      location: getShippingAddressString(order),
    });
  }

  // Add delivered if applicable - show customer address
  if (order.status?.toUpperCase() === "DELIVERED") {
    defaultTimeline.push({
      status: "DELIVERED",
      message: "Order delivered successfully",
      timestamp: order.deliveredAt || order.createdAt,
      location: getShippingAddressString(order),
    });
  }

  // Add cancelled if applicable
  if (order.status?.toUpperCase() === "CANCELLED") {
    defaultTimeline.push({
      status: "CANCELLED",
      message: order.cancellationReason || "Order cancelled",
      timestamp: order.cancelledAt || order.createdAt,
    });
  }

  return defaultTimeline;
};

// Get formatted shipping address string from order
const getShippingAddressString = (order) => {
  const addr = order.shippingAddress || order.shippingInfo;
  if (!addr) return null;

  const parts = [
    addr.address,
    addr.ward,
    addr.district,
    addr.city || addr.province,
  ].filter(Boolean);

  return parts.join(", ") || null;
};

const loadTracking = async () => {
  try {
    loadingTracking.value = true;
    const response = await getOrderTrackingApi(props.order._id);
    trackingData.value = response.tracking || null;

    if (trackingData.value) {
      setupMapData();

      // Start real-time updates
      if (["IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(props.order.status)) {
        startRealtimeTracking();
      }
    }
  } catch (err) {
    console.error("Failed to load tracking:", err);
  } finally {
    loadingTracking.value = false;
  }
};

const setupMapData = () => {
  if (!trackingData.value) return;

  // Default warehouse location (Ga Thường Tín, Hà Nội)
  // Correct coordinates: 20.9954°N, 105.9033°E
  const warehouseLocation = {
    lat: 20.9954,
    lng: 105.9033,
    address: "Ga Thường Tín, Thường Tín, Hà Nội (Warehouse)",
  };

  // Parse destination from shipping address (support both shippingAddress and shippingInfo)
  const addr = props.order.shippingAddress || props.order.shippingInfo;
  const destinationAddress =
    getShippingAddressString(props.order) || "Customer Address";

  const destination = {
    lat: addr?.coordinates?.lat || 21.0285,
    lng: addr?.coordinates?.lng || 105.8542,
    address: destinationAddress,
  };

  mapData.value = {
    origin: warehouseLocation,
    destination: destination,
    currentLocation: trackingData.value.currentLocation || warehouseLocation,
    route: trackingData.value.route || [],
  };
};

const startRealtimeTracking = () => {
  if (realtimeInterval.value) {
    clearInterval(realtimeInterval.value);
  }

  // Update every 30 seconds
  realtimeInterval.value = setInterval(() => {
    refreshTracking();
  }, 30000);
};

const refreshTracking = async () => {
  try {
    const response = await getOrderTrackingApi(props.order._id);
    if (response.tracking) {
      trackingData.value = response.tracking;
      setupMapData();
    }
  } catch (err) {
    console.error("Failed to refresh tracking:", err);
  }
};

const cancelOrder = async () => {
  const reason = prompt("Enter cancellation reason:");
  if (!reason) return;

  try {
    await adminCancelOrderApi(props.order._id, { reason });
    emit("updated");
  } catch (err) {
    console.error("Failed to cancel order:", err);
  }
};

const addNote = async () => {
  if (!newNote.value.trim()) return;

  try {
    addingNote.value = true;
    await addAdminNotesApi(props.order._id, { note: newNote.value });
    newNote.value = "";
    emit("updated");
  } catch (err) {
    console.error("Failed to add note:", err);
    alert("Failed to add note. Please try again.");
  } finally {
    addingNote.value = false;
  }
};

// Helper function to get shipping field from either shippingAddress or shippingInfo
const getShippingField = (field) => {
  const addr = props.order.shippingAddress || props.order.shippingInfo;
  if (!addr) return null;
  return addr[field] || null;
};

// Format payment method for display
const formatPaymentMethod = (method) => {
  const methods = {
    COD: "Cash on Delivery",
    VNPAY: "VNPay",
    MOMO: "MoMo Wallet",
    BANK_TRANSFER: "Bank Transfer",
    PAYPAL: "PayPal",
  };
  return methods[method?.toUpperCase()] || method || "N/A";
};

// Utility functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getItemName = (item) => {
  return item.name || item.product?.name || item.bundle?.name || "Unknown Item";
};

const getItemImage = (item) => {
  if (item.image) return item.image;

  if (
    item.product?.image &&
    Array.isArray(item.product.image) &&
    item.product.image.length > 0
  ) {
    return item.product.image[0].url;
  }

  if (item.bundle?.image) {
    return Array.isArray(item.bundle.image)
      ? item.bundle.image[0]?.url
      : item.bundle.image.url;
  }

  return "/placeholder.png";
};

const formatPaymentStatus = (isPaid, paymentResult) => {
  if (isPaid) return "Paid";
  if (paymentResult?.status === "failed") return "Failed";
  if (paymentResult?.status === "refunded") return "Refunded";
  return "Pending";
};

const getPaymentStatusClass = (isPaid, paymentResult) => {
  if (isPaid) {
    return "px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  }
  if (paymentResult?.status === "failed") {
    return "px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }
  if (paymentResult?.status === "refunded") {
    return "px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
  return "px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
};
</script>