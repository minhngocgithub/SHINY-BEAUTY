<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700"
      >
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
          {{ isEdit ? "Edit Campaign" : "Create New Campaign" }}
        </h2>
        <button
          @click="$emit('close')"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <span class="text-2xl">✕</span>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6">
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Basic Information -->
          <div>
            <h3
              class="text-lg font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b-2 border-slate-100 dark:border-slate-700"
            >
              Basic Information
            </h3>

            <div class="mb-5">
              <label
                class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Campaign Name *
              </label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all"
                placeholder="e.g., Christmas Sale 2025"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label
                  class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  Category *
                </label>
                <select
                  v-model="formData.category"
                  class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all"
                  required
                >
                  <option value="">Select category</option>
                  <option value="FLASH_SALE">🔥 Flash Sale</option>
                  <option value="NEW_PRODUCT">✨ New Product</option>
                  <option value="PRICE_DROP">💰 Price Drop</option>
                  <option value="BACK_IN_STOCK">📦 Back in Stock</option>
                  <option value="ABANDONED_CART">🛒 Abandoned Cart</option>
                  <option value="BIRTHDAY_OFFER">🎂 Birthday Offer</option>
                  <option value="LOYALTY_UPDATE">⭐ Loyalty Update</option>
                  <option value="NEWSLETTER">📰 Newsletter</option>
                  <option value="PROMOTION">🎁 Promotion</option>
                  <option value="ANNOUNCEMENT">📢 Announcement</option>
                </select>
              </div>

              <div>
                <label
                  class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  Email Template *
                </label>
                <select
                  v-model="formData.template"
                  class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all"
                  required
                >
                  <option value="generic">📧 Generic</option>
                  <option value="flashSale">⚡ Flash Sale</option>
                  <option value="newProduct">✨ New Product</option>
                  <option value="priceDrop">💸 Price Drop</option>
                  <option value="backInStock">📦 Back in Stock</option>
                  <option value="abandonedCart">🛒 Abandoned Cart</option>
                  <option value="birthdayOffer">🎂 Birthday Offer</option>
                  <option value="newsletter">📰 Newsletter</option>
                  <option value="christmas2025">
                    🎄 Christmas 2025 Special
                  </option>
                </select>
              </div>
            </div>

            <div class="mb-5">
              <label
                class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Email Subject *
              </label>
              <input
                v-model="formData.subject"
                type="text"
                class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all"
                placeholder="e.g., 🎄 Merry Christmas! Special 50% OFF Just For You 🎁"
                required
              />
            </div>

            <div class="mb-5">
              <label
                class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Preview Text
              </label>
              <input
                v-model="formData.previewText"
                type="text"
                class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all"
                placeholder="Short preview text shown in email clients"
              />
            </div>
          </div>

          <!-- Target Audience -->
          <div>
            <h3
              class="text-lg font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b-2 border-slate-100 dark:border-slate-700"
            >
              Target Audience
            </h3>

            <div class="mb-5">
              <label
                class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Audience Type *
              </label>
              <select
                v-model="formData.targetAudience.type"
                class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all"
                required
              >
                <option value="all">All Users</option>
                <option value="segments">Specific Segments</option>
                <option value="specific_users">Specific Users</option>
              </select>
            </div>

            <div
              v-if="formData.targetAudience.type === 'segments'"
              class="mb-5"
            >
              <label
                class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Segments
              </label>
              <div class="flex flex-col gap-3">
                <label
                  class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value="vip"
                    v-model="formData.targetAudience.segments"
                    class="w-4 h-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span>VIP Customers</span>
                </label>
                <label
                  class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value="new_customers"
                    v-model="formData.targetAudience.segments"
                    class="w-4 h-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span>New Customers</span>
                </label>
                <label
                  class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value="inactive_customers"
                    v-model="formData.targetAudience.segments"
                    class="w-4 h-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span>Inactive Customers</span>
                </label>
                <label
                  class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value="high_spenders"
                    v-model="formData.targetAudience.segments"
                    class="w-4 h-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span>High Spenders</span>
                </label>
              </div>
            </div>

            <div>
              <label
                class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  v-model="formData.excludePreviousRecipients"
                  class="w-4 h-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span
                  >Don't send to users who received this campaign before</span
                >
              </label>
            </div>
          </div>

          <!-- Email Content -->
          <div>
            <h3
              class="text-lg font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b-2 border-slate-100 dark:border-slate-700"
            >
              Email Content
            </h3>

            <!-- Template Helper for Christmas 2025 -->
            <div
              v-if="formData.template === 'christmas2025'"
              class="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-5 mb-5 text-white shadow-lg"
            >
              <div class="text-base font-bold mb-3 flex items-center gap-2">
                🎄 Christmas 2025 Template Guide
              </div>
              <div class="bg-white/15 backdrop-blur-md rounded-lg p-4">
                <p class="mb-2 font-semibold text-sm">Available fields:</p>
                <ul class="text-xs leading-relaxed ml-5 space-y-1 mb-4">
                  <li>
                    <code
                      class="bg-white/20 px-1.5 py-0.5 rounded font-mono text-xs"
                      >userName</code
                    >
                    - Customer name (auto-filled)
                  </li>
                  <li>
                    <code
                      class="bg-white/20 px-1.5 py-0.5 rounded font-mono text-xs"
                      >message</code
                    >
                    - Main Christmas message
                  </li>
                  <li>
                    <code
                      class="bg-white/20 px-1.5 py-0.5 rounded font-mono text-xs"
                      >discount</code
                    >
                    - Discount percentage (number)
                  </li>
                  <li>
                    <code
                      class="bg-white/20 px-1.5 py-0.5 rounded font-mono text-xs"
                      >products</code
                    >
                    - Array of products with: name, description, image,
                    originalPrice, salePrice, savings
                  </li>
                  <li>
                    <code
                      class="bg-white/20 px-1.5 py-0.5 rounded font-mono text-xs"
                      >actionUrl</code
                    >
                    - CTA button link
                  </li>
                  <li>
                    <code
                      class="bg-white/20 px-1.5 py-0.5 rounded font-mono text-xs"
                      >endsAt</code
                    >
                    - Offer end date (ISO string)
                  </li>
                  <li>
                    <code
                      class="bg-white/20 px-1.5 py-0.5 rounded font-mono text-xs"
                      >additionalMessage</code
                    >
                    - Special note
                  </li>
                  <li>
                    <code
                      class="bg-white/20 px-1.5 py-0.5 rounded font-mono text-xs"
                      >socialLinks</code
                    >
                    - Object with facebook, instagram, twitter
                  </li>
                </ul>
                <button
                  type="button"
                  @click="useChristmasExample"
                  class="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold text-xs hover:bg-orange-50 transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                >
                  📋 Use Christmas Example
                </button>
              </div>
            </div>

            <div>
              <label
                class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Content Data (JSON)
              </label>
              <textarea
                v-model="contentDataString"
                :rows="formData.template === 'christmas2025' ? 12 : 8"
                class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white font-mono resize-y transition-all"
                placeholder='{"title": "Summer Sale", "message": "50% off all items", "ctaText": "Shop Now", "ctaLink": "https://..."}'
              ></textarea>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Template variables depend on selected template.
                <span
                  v-if="formData.template === 'christmas2025'"
                  class="text-red-600 dark:text-red-400 font-semibold"
                >
                  🎅 Christmas template supports: message, discount, products,
                  actionUrl, endsAt, additionalMessage
                </span>
                <span v-else>
                  Common: title, message, ctaText, ctaLink, productName,
                  discount, etc.
                </span>
              </p>
            </div>
          </div>

          <!-- Scheduling -->
          <div>
            <h3
              class="text-lg font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b-2 border-slate-100 dark:border-slate-700"
            >
              Scheduling
            </h3>

            <div class="mb-5">
              <label
                class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Send Timing
              </label>
              <select
                v-model="sendTiming"
                class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all"
              >
                <option value="now">Send Immediately</option>
                <option value="schedule">Schedule for Later</option>
              </select>
            </div>

            <div v-if="sendTiming === 'schedule'">
              <label
                class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Scheduled Date & Time
              </label>
              <input
                v-model="formData.scheduledAt"
                type="datetime-local"
                class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all"
              />
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div
        class="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
      >
        <button
          type="button"
          @click="$emit('close')"
          class="px-6 py-2.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          type="button"
          class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all"
        >
          {{
            isEdit
              ? "Update Campaign"
              : sendTiming === "now"
              ? "Create & Send"
              : "Create Campaign"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  campaign: {
    type: Object,
    default: null,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "save"]);

const formData = ref({
  name: "",
  category: "",
  template: "generic",
  subject: "",
  previewText: "",
  targetAudience: {
    type: "all",
    segments: [],
    userIds: [],
  },
  contentData: {},
  scheduledAt: null,
  excludePreviousRecipients: false,
});

const contentDataString = ref("{}");
const sendTiming = ref("schedule");

// Watch contentDataString and parse to contentData
watch(contentDataString, (newVal) => {
  try {
    formData.value.contentData = JSON.parse(newVal);
  } catch (e) {
    // Invalid JSON, keep previous value
  }
});

// Initialize form with campaign data if editing
onMounted(() => {
  if (props.isEdit && props.campaign) {
    formData.value = {
      name: props.campaign.name,
      category: props.campaign.category,
      template: props.campaign.template || "generic",
      subject: props.campaign.subject,
      previewText: props.campaign.previewText || "",
      targetAudience: { ...props.campaign.targetAudience },
      contentData: { ...props.campaign.contentData },
      scheduledAt: props.campaign.scheduledAt
        ? new Date(props.campaign.scheduledAt).toISOString().slice(0, 16)
        : null,
      excludePreviousRecipients:
        props.campaign.excludePreviousRecipients || false,
    };
    contentDataString.value = JSON.stringify(
      props.campaign.contentData,
      null,
      2
    );
    sendTiming.value = props.campaign.scheduledAt ? "schedule" : "now";
  } else {
    // Set default contentData based on template
    contentDataString.value = JSON.stringify(
      {
        title: "Special Offer",
        message: "Check out our amazing deals!",
        ctaText: "Shop Now",
        ctaLink: "https://shinybeauty.com/shop",
      },
      null,
      2
    );
  }
});

const handleSubmit = () => {
  // Validate JSON
  try {
    JSON.parse(contentDataString.value);
  } catch (e) {
    alert("Invalid JSON in content data");
    return;
  }

  // Validate required fields
  if (
    !formData.value.name ||
    !formData.value.category ||
    !formData.value.subject
  ) {
    alert("Please fill in all required fields");
    return;
  }

  // Validate scheduled date
  if (sendTiming.value === "schedule" && !formData.value.scheduledAt) {
    alert("Please select a scheduled date and time");
    return;
  }

  // Prepare payload theo đúng API backend
  const payload = {
    name: formData.value.name,
    type: "EMAIL",
    category: formData.value.category,
    subject: formData.value.subject,
    emailTemplate: formData.value.template,
    emailContent: formData.value.contentData,
    targetSegment: mapTargetAudience(formData.value.targetAudience.type),
    segmentFilters: buildSegmentFilters(),
    sendImmediately: sendTiming.value === "now",
    priority: "NORMAL",
  };

  // Add scheduledAt if scheduling
  if (sendTiming.value === "schedule" && formData.value.scheduledAt) {
    payload.scheduledAt = new Date(formData.value.scheduledAt).toISOString();
  } else if (sendTiming.value === "now") {
    // Ensure sendImmediately is true and scheduledAt is null for immediate send
    payload.sendImmediately = true;
  }

  console.log("📤 Submitting campaign payload:", payload);
  emit("save", payload);
};

// Map target audience type
const mapTargetAudience = (type) => {
  const mapping = {
    all: "ALL_USERS",
    segments: "CUSTOM_QUERY",
    specific_users: "CUSTOM_QUERY",
  };
  return mapping[type] || "ALL_USERS";
};

// Build segment filters
const buildSegmentFilters = () => {
  if (formData.value.targetAudience.type === "segments") {
    return {
      customQuery: {
        // Map segments to query conditions
        // Ví dụ: nếu có segment "vip", filter users với loyalty tier
      },
    };
  }
  return {};
};

// Christmas template example
const useChristmasExample = () => {
  const christmasExample = {
    message:
      "Wishing you a magical Christmas filled with joy, love, and beauty! 🌟",
    discount: "50",
    products: [
      {
        name: "Christmas Glow Serum",
        description: "24K gold-infused serum for radiant holiday skin",
        image: "https://example.com/serum.jpg",
        originalPrice: "89.99",
        salePrice: "44.99",
        savings: "45.00",
      },
      {
        name: "Festive Red Lipstick Set",
        description: "5 stunning red shades perfect for Christmas parties",
        image: "https://example.com/lipstick.jpg",
        originalPrice: "59.99",
        salePrice: "29.99",
        savings: "30.00",
      },
    ],
    actionUrl: "https://shinybeauty.com/christmas-sale",
    endsAt: "2025-12-26T23:59:59.000Z",
    additionalMessage:
      "Free gift wrapping on all Christmas orders! Plus free shipping over $50.",
    socialLinks: {
      facebook: "https://facebook.com/shinybeauty",
      instagram: "https://instagram.com/shinybeauty",
      twitter: "https://twitter.com/shinybeauty",
    },
  };

  contentDataString.value = JSON.stringify(christmasExample, null, 2);
  formData.value.contentData = christmasExample;
};
</script>

