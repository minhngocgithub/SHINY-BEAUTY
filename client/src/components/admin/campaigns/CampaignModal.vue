<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEdit ? "Edit Campaign" : "Create New Campaign" }}</h2>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Basic Information -->
          <div class="form-section">
            <h3 class="section-title">Basic Information</h3>

            <div class="form-group">
              <label class="form-label">Campaign Name *</label>
              <input
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="e.g., Summer Sale 2024"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select
                  v-model="formData.category"
                  class="form-select"
                  required
                >
                  <option value="">Select category</option>
                  <option value="promotional">Promotional</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="flash_sale">Flash Sale</option>
                  <option value="new_product">New Product</option>
                  <option value="abandoned_cart">Abandoned Cart</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="birthday_offer">Birthday Offer</option>
                  <option value="loyalty_reward">Loyalty Reward</option>
                  <option value="price_drop">Price Drop</option>
                  <option value="back_in_stock">Back in Stock</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Template</label>
                <select v-model="formData.template" class="form-select">
                  <option value="generic">Generic</option>
                  <option value="flashSale">Flash Sale</option>
                  <option value="newProduct">New Product</option>
                  <option value="priceDrop">Price Drop</option>
                  <option value="backInStock">Back in Stock</option>
                  <option value="abandonedCart">Abandoned Cart</option>
                  <option value="birthdayOffer">Birthday Offer</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email Subject *</label>
              <input
                v-model="formData.subject"
                type="text"
                class="form-input"
                placeholder="e.g., 🔥 50% Off Summer Collection - Limited Time!"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Preview Text</label>
              <input
                v-model="formData.previewText"
                type="text"
                class="form-input"
                placeholder="Short preview text shown in email clients"
              />
            </div>
          </div>

          <!-- Target Audience -->
          <div class="form-section">
            <h3 class="section-title">Target Audience</h3>

            <div class="form-group">
              <label class="form-label">Audience Type *</label>
              <select
                v-model="formData.targetAudience.type"
                class="form-select"
                required
              >
                <option value="all">All Users</option>
                <option value="segments">Specific Segments</option>
                <option value="specific_users">Specific Users</option>
              </select>
            </div>

            <div
              v-if="formData.targetAudience.type === 'segments'"
              class="form-group"
            >
              <label class="form-label">Segments</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    value="vip"
                    v-model="formData.targetAudience.segments"
                  />
                  <span>VIP Customers</span>
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    value="new_customers"
                    v-model="formData.targetAudience.segments"
                  />
                  <span>New Customers</span>
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    value="inactive_customers"
                    v-model="formData.targetAudience.segments"
                  />
                  <span>Inactive Customers</span>
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    value="high_spenders"
                    v-model="formData.targetAudience.segments"
                  />
                  <span>High Spenders</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Exclude Previous Recipients</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="formData.excludePreviousRecipients"
                  />
                  <span
                    >Don't send to users who received this campaign before</span
                  >
                </label>
              </div>
            </div>
          </div>

          <!-- Email Content -->
          <div class="form-section">
            <h3 class="section-title">Email Content</h3>

            <div class="form-group">
              <label class="form-label">Content Data (JSON)</label>
              <textarea
                v-model="contentDataString"
                class="form-textarea"
                rows="8"
                placeholder='{"title": "Summer Sale", "message": "50% off all items", "ctaText": "Shop Now", "ctaLink": "https://..."}'
              ></textarea>
              <p class="form-hint">
                Template variables depend on selected template. Common: title,
                message, ctaText, ctaLink, productName, discount, etc.
              </p>
            </div>
          </div>

          <!-- Scheduling -->
          <div class="form-section">
            <h3 class="section-title">Scheduling</h3>

            <div class="form-group">
              <label class="form-label">Send Timing</label>
              <select v-model="sendTiming" class="form-select">
                <option value="now">Send Immediately</option>
                <option value="schedule">Schedule for Later</option>
              </select>
            </div>

            <div v-if="sendTiming === 'schedule'" class="form-group">
              <label class="form-label">Scheduled Date & Time</label>
              <input
                v-model="formData.scheduledAt"
                type="datetime-local"
                class="form-input"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-footer">
            <button type="button" @click="$emit('close')" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              {{
                isEdit
                  ? "Update Campaign"
                  : sendTiming === "now"
                  ? "Create & Send"
                  : "Create Campaign"
              }}
            </button>
          </div>
        </form>
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

  // Remove scheduledAt if sending now
  if (sendTiming.value === "now") {
    formData.value.scheduledAt = null;
  }

  emit("save", formData.value);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f3f4f6;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  font-family: "Courier New", monospace;
  resize: vertical;
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f9fafb;
}

.btn-primary,
.btn-secondary {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
}
</style>
