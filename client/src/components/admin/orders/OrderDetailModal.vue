<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('close')">
    <div
      class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel -->
      <div
        class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl dark:bg-gray-800 sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700"
        >
          <div>
            <h3 class="text-xl font-bold text-white">Order Details</h3>
            <p class="mt-1 text-sm text-blue-100">
              {{ order.orderNumber || order._id }}
            </p>
          </div>
          <button
            @click="$emit('close')"
            class="text-white hover:text-gray-200"
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
          <div
            class="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"
          ></div>
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
            <div v-else-if="activeTab === 'timeline'" class="space-y-4">
              <div
                v-if="timeline.length === 0"
                class="py-8 text-center text-gray-500 dark:text-gray-400"
              >
                No timeline data available
              </div>
              <div v-else class="relative">
                <div
                  class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
                ></div>
                <div
                  v-for="(event, index) in timeline"
                  :key="index"
                  class="relative pb-8 pl-12 last:pb-0"
                >
                  <div
                    :class="[
                      'absolute left-0 w-8 h-8 rounded-full flex items-center justify-center',
                      getTimelineColor(event.status),
                    ]"
                  >
                    <svg
                      class="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="p-4 bg-white rounded-lg shadow dark:bg-gray-900">
                    <div class="flex items-start justify-between">
                      <div>
                        <h5 class="font-semibold text-gray-900 dark:text-white">
                          {{ formatStatus(event.status) }}
                        </h5>
                        <p
                          class="mt-1 text-sm text-gray-600 dark:text-gray-400"
                        >
                          {{ event.message }}
                        </p>
                        <p
                          v-if="event.location"
                          class="mt-1 text-xs text-gray-500 dark:text-gray-500"
                        >
                          📍 {{ event.location }}
                        </p>
                      </div>
                      <span class="text-xs text-gray-500 dark:text-gray-400">{{
                        formatDateTime(event.timestamp)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tracking Tab -->
            <div v-else-if="activeTab === 'tracking'">
              <div v-if="!trackingData" class="py-8 text-center">
                <button
                  @click="loadTracking"
                  class="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Load Tracking Information
                </button>
              </div>
              <div v-else class="space-y-6">
                <!-- Tracking Number -->
                <div class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Tracking Number
                  </p>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ trackingData.trackingNumber }}
                  </p>
                  <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Carrier: {{ trackingData.carrier }}
                  </p>
                </div>

                <!-- Current Location -->
                <div
                  v-if="trackingData.currentLocation"
                  class="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <h5 class="mb-2 font-semibold text-gray-900 dark:text-white">
                    Current Location
                  </h5>
                  <p class="text-gray-600 dark:text-gray-400">
                    📍 {{ trackingData.currentLocation.address }}
                  </p>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-500">
                    Last updated: {{ formatDateTime(trackingData.lastUpdate) }}
                  </p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div
                    class="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  >
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Estimated Delivery
                    </p>
                    <p
                      class="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      {{ formatDate(trackingData.estimatedDelivery) }}
                    </p>
                  </div>
                  <div
                    class="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  >
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Progress
                    </p>
                    <div class="mt-2">
                      <div
                        class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"
                      >
                        <div
                          class="bg-blue-600 h-2.5 rounded-full"
                          :style="{ width: `${trackingData.progress || 0}%` }"
                        ></div>
                      </div>
                      <p
                        class="mt-1 text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        {{ trackingData.progress || 0 }}%
                      </p>
                    </div>
                  </div>
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
                    <p class="text-gray-900 dark:text-white">
                      {{ order.shippingInfo?.fullName }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">
                      {{ order.shippingInfo?.address }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">
                      {{ order.shippingInfo?.ward }},
                      {{ order.shippingInfo?.district }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">
                      {{ order.shippingInfo?.province }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">
                      📞 {{ order.shippingInfo?.phoneNo }}
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
                        order.paymentInfo?.method
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-400"
                        >Status:</span
                      >
                      <span
                        :class="
                          getPaymentStatusClass(order.paymentInfo?.status)
                        "
                      >
                        {{ formatPaymentStatus(order.paymentInfo?.status) }}
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
                  </div>
                </div>
              </div>
            </div>

            <!-- Admin Notes Tab -->
            <div v-else-if="activeTab === 'notes'">
              <div class="space-y-4">
                <div
                  v-for="note in order.adminNotes || []"
                  :key="note._id"
                  class="p-4 border-l-4 border-yellow-400 rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
                >
                  <p class="text-gray-900 dark:text-white">{{ note.note }}</p>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    By {{ note.admin?.name }} •
                    {{ formatDateTime(note.createdAt) }}
                  </p>
                </div>
                <div
                  v-if="!order.adminNotes || order.adminNotes.length === 0"
                  class="py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No admin notes yet
                </div>

                <!-- Add Note Form -->
                <div class="mt-6">
                  <textarea
                    v-model="newNote"
                    rows="3"
                    placeholder="Add admin note..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  ></textarea>
                  <button
                    @click="addNote"
                    :disabled="!newNote.trim()"
                    class="px-4 py-2 mt-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700"
        >
          <div class="flex gap-3">
            <select
              v-model="selectedStatus"
              class="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Change Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
            <button
              @click="updateStatus"
              :disabled="!selectedStatus"
              class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Status
            </button>
          </div>
          <div class="flex gap-3">
            <button
              v-if="['pending', 'confirmed'].includes(order.orderStatus)"
              @click="cancelOrder"
              class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Cancel Order
            </button>
            <button
              @click="$emit('close')"
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

<script>
import { getOrderDetailApi } from "../../../service/order.service";
import {
  getOrderTrackingApi,
  getOrderTimelineApi,
} from "../../../service/order.service";
import {
  updateOrderStatusApi,
  adminCancelOrderApi,
  addAdminNotesApi,
} from "../../../service/admin.service";

export default {
  name: "OrderDetailModal",
  props: {
    order: {
      type: Object,
      required: true,
    },
  },
  emits: ["close", "updated"],
  data() {
    return {
      loading: false,
      activeTab: "items",
      tabs: [
        { id: "items", label: "Items" },
        { id: "timeline", label: "Timeline" },
        { id: "tracking", label: "Tracking" },
        { id: "shipping", label: "Shipping & Payment" },
        { id: "notes", label: "Admin Notes" },
      ],
      timeline: [],
      trackingData: null,
      selectedStatus: "",
      newNote: "",
    };
  },
  mounted() {
    this.loadTimeline();
  },
  methods: {
    async loadTimeline() {
      try {
        const response = await getOrderTimelineApi(this.order._id);
        this.timeline = response.timeline || [];
      } catch (err) {
        console.error("Failed to load timeline:", err);
      }
    },

    async loadTracking() {
      try {
        this.loading = true;
        const response = await getOrderTrackingApi(this.order._id);
        this.trackingData = response.tracking || null;
      } catch (err) {
        console.error("Failed to load tracking:", err);
        this.$toast?.error("Failed to load tracking information");
      } finally {
        this.loading = false;
      }
    },

    async updateStatus() {
      if (!this.selectedStatus) return;

      try {
        await updateOrderStatusApi(this.order._id, {
          status: this.selectedStatus,
        });
        this.$toast?.success("Order status updated successfully");
        this.selectedStatus = "";
        this.$emit("updated");
      } catch (err) {
        console.error("Failed to update status:", err);
        this.$toast?.error(
          err.response?.data?.message || "Failed to update status"
        );
      }
    },

    async cancelOrder() {
      const reason = prompt("Enter cancellation reason:");
      if (!reason) return;

      try {
        await adminCancelOrderApi(this.order._id, { reason });
        this.$toast?.success("Order cancelled successfully");
        this.$emit("updated");
      } catch (err) {
        console.error("Failed to cancel order:", err);
        this.$toast?.error(
          err.response?.data?.message || "Failed to cancel order"
        );
      }
    },

    async addNote() {
      if (!this.newNote.trim()) return;

      try {
        await addAdminNotesApi(this.order._id, { note: this.newNote });
        this.$toast?.success("Note added successfully");
        this.newNote = "";
        this.$emit("updated");
      } catch (err) {
        console.error("Failed to add note:", err);
        this.$toast?.error(err.response?.data?.message || "Failed to add note");
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    formatDateTime(date) {
      return new Date(date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    getItemName(item) {
      return (
        item.name || item.product?.name || item.bundle?.name || "Unknown Item"
      );
    },

    getItemImage(item) {
      // First check if image is stored directly in orderItem
      if (item.image) return item.image;

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
          : item.bundle.image.url;
      }

      return "/placeholder.png";
    },

    formatStatus(status) {
      const statusMap = {
        pending: "Pending",
        confirmed: "Confirmed",
        preparing: "Preparing",
        shipped: "Shipped",
        out_for_delivery: "Out for Delivery",
        delivered: "Delivered",
        cancelled: "Cancelled",
        returned: "Returned",
      };
      return statusMap[status] || status;
    },

    formatPaymentStatus(status) {
      const statusMap = {
        pending: "Pending",
        paid: "Paid",
        failed: "Failed",
        refunded: "Refunded",
      };
      return statusMap[status] || status;
    },

    getTimelineColor(status) {
      const colors = {
        pending: "bg-yellow-500",
        confirmed: "bg-blue-500",
        preparing: "bg-purple-500",
        shipped: "bg-indigo-500",
        out_for_delivery: "bg-cyan-500",
        delivered: "bg-green-500",
        cancelled: "bg-red-500",
        returned: "bg-gray-500",
      };
      return colors[status] || "bg-gray-400";
    },

    getPaymentStatusClass(status) {
      const classes = {
        pending:
          "px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        paid: "px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        failed:
          "px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        refunded:
          "px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      };
      return classes[status] || classes.pending;
    },
  },
};
</script>
