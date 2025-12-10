<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="$emit('close')"
  >
    <div
      class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl dark:bg-gray-800"
    >
      <!-- Header -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b dark:bg-gray-800 dark:border-gray-700"
      >
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ isEdit ? "Edit Sale Program" : "Create Sale Program" }}
          </h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Configure your discount campaign with scheduling and targeting
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Basic Information -->
        <section>
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h3>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- Title -->
            <div class="md:col-span-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Program Title <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.title"
                type="text"
                required
                placeholder="e.g., Summer Sale 2024"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <!-- Short Description -->
            <div class="md:col-span-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >Short Description</label
              >
              <input
                v-model="formData.shortDescription"
                type="text"
                placeholder="Brief description for listing"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >Full Description</label
              >
              <textarea
                v-model="formData.description"
                rows="3"
                placeholder="Detailed description with terms and conditions"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              ></textarea>
            </div>

            <!-- Type -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Program Type <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.type"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Type</option>
                <option value="percentage_sale">Percentage Sale</option>
                <option value="fixed_amount_sale">Fixed Amount Sale</option>
                <option value="flash_sale">Flash Sale</option>
                <option value="free_sample">Free Sample</option>
                <option value="points_multiplier">Points Multiplier</option>
                <option value="bundle_offer">Bundle Offer</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
                <option value="spend_x_get_y">Spend X Get Y</option>
                <option value="free_shipping">Free Shipping</option>
                <option value="gift_with_purchase">Gift with Purchase</option>
              </select>
            </div>

            <!-- Status -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >Status</label
              >
              <select
                v-model="formData.status"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <!-- Banner Upload -->
            <div class="md:col-span-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >Banner Image</label
              >
              <div class="flex items-center gap-4">
                <input
                  type="file"
                  @change="handleBannerUpload"
                  accept="image/*"
                  class="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <img
                  v-if="bannerPreview"
                  :src="bannerPreview"
                  class="object-cover w-20 h-20 rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Scheduling -->
        <section class="pt-6 border-t dark:border-gray-700">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Scheduling
          </h3>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Start Date <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.startDate"
                type="datetime-local"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >End Date</label
              >
              <input
                v-model="formData.endDate"
                type="datetime-local"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </section>

        <!-- Discount Configuration -->
        <section class="pt-6 border-t dark:border-gray-700">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Discount Configuration
          </h3>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- Percentage or Amount -->
            <div
              v-if="['percentage_sale', 'flash_sale'].includes(formData.type)"
            >
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Discount Percentage (%)
              </label>
              <input
                v-model.number="formData.benefits.discountPercentage"
                type="number"
                min="1"
                max="100"
                placeholder="e.g., 25"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div v-if="formData.type === 'fixed_amount_sale'">
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Discount Amount ($)
              </label>
              <input
                v-model.number="formData.benefits.discountAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 10.00"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Points Multiplier -->
            <div v-if="formData.type === 'points_multiplier'">
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Points Multiplier (x)
              </label>
              <input
                v-model.number="formData.benefits.pointsMultiplier"
                type="number"
                min="1"
                step="0.5"
                placeholder="e.g., 2.0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Buy X Get Y -->
            <div
              v-if="formData.type === 'buy_x_get_y'"
              class="grid grid-cols-2 gap-2"
            >
              <div>
                <label
                  class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Buy Quantity</label
                >
                <input
                  v-model.number="formData.benefits.buyQuantity"
                  type="number"
                  min="1"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label
                  class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Get Quantity</label
                >
                <input
                  v-model.number="formData.benefits.getQuantity"
                  type="number"
                  min="1"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <!-- Min Order Value -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Minimum Order Value ($)
              </label>
              <input
                v-model.number="formData.conditions.minOrderValue"
                type="number"
                min="0"
                step="0.01"
                placeholder="0 for no minimum"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Free Shipping -->
            <div
              v-if="formData.type === 'free_shipping'"
              class="flex items-center gap-2 pt-8"
            >
              <input
                v-model="formData.benefits.freeShipping"
                type="checkbox"
                class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >Enable Free Shipping</label
              >
            </div>
          </div>
        </section>

        <!-- Usage Limits -->
        <section class="pt-6 border-t dark:border-gray-700">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Usage Limits
          </h3>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Max Total Usage
              </label>
              <input
                v-model.number="formData.maxUsage"
                type="number"
                min="1"
                placeholder="0 for unlimited"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Max Usage Per User
              </label>
              <input
                v-model.number="formData.conditions.maxUsagePerUser"
                type="number"
                min="1"
                placeholder="0 for unlimited"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Promo Code -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Promo Code (Optional)
              </label>
              <input
                v-model="formData.conditions.requiredPromoCode"
                type="text"
                placeholder="e.g., SUMMER2024"
                class="w-full px-4 py-2 uppercase border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Active Toggle -->
            <div class="flex items-center gap-2 pt-8">
              <input
                v-model="formData.isActive"
                type="checkbox"
                class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >Activate Program</label
              >
            </div>
          </div>
        </section>

        <!-- Advanced Targeting -->
        <section class="pt-6 border-t dark:border-gray-700">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Advanced Targeting
          </h3>

          <div class="grid grid-cols-1 gap-4">
            <!-- Membership Tiers -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Membership Tiers (Optional)
              </label>
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="tier in ['bronze', 'silver', 'gold', 'platinum']"
                  :key="tier"
                  class="flex items-center gap-2"
                >
                  <input
                    v-model="formData.conditions.membershipTiers"
                    :value="tier"
                    type="checkbox"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span
                    class="text-sm text-gray-700 capitalize dark:text-gray-300"
                    >{{ tier }}</span
                  >
                </label>
              </div>
            </div>

            <!-- New Customers Only -->
            <div class="flex items-center gap-2">
              <input
                v-model="formData.targeting.newCustomersOnly"
                type="checkbox"
                class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >New Customers Only</label
              >
            </div>
          </div>
        </section>

        <!-- Actions -->
        <div
          class="flex items-center justify-end gap-4 pt-6 border-t dark:border-gray-700"
        >
          <button
            type="button"
            @click="$emit('close')"
            class="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{
              saving
                ? "Saving..."
                : isEdit
                ? "Update Program"
                : "Create Program"
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSaleProgramStore } from "../../../store/saleProgram.store";

const props = defineProps({
  program: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "saved"]);

const saleProgramStore = useSaleProgramStore();
const isEdit = computed(() => !!props.program);
const saving = ref(false);
const bannerPreview = ref(null);
const bannerFile = ref(null);

const formData = ref({
  title: "",
  shortDescription: "",
  description: "",
  type: "",
  status: "draft",
  startDate: "",
  endDate: "",
  isActive: false,
  maxUsage: 0,
  conditions: {
    minOrderValue: 0,
    maxUsagePerUser: 0,
    requiredPromoCode: "",
    membershipTiers: [],
    applicableProducts: [],
    categories: [],
  },
  benefits: {
    discountPercentage: null,
    discountAmount: null,
    pointsMultiplier: null,
    buyQuantity: null,
    getQuantity: null,
    freeShipping: false,
  },
  targeting: {
    newCustomersOnly: false,
  },
});

const handleBannerUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    bannerFile.value = file;
    bannerPreview.value = URL.createObjectURL(file);
  }
};

const handleSubmit = async () => {
  try {
    saving.value = true;

    const data = new FormData();

    // Append form fields
    Object.keys(formData.value).forEach((key) => {
      if (key === "conditions" || key === "benefits" || key === "targeting") {
        data.append(key, JSON.stringify(formData.value[key]));
      } else {
        data.append(key, formData.value[key]);
      }
    });

    // Append banner if uploaded
    if (bannerFile.value) {
      data.append("banner", bannerFile.value);
    }

    if (isEdit.value) {
      await saleProgramStore.updateSaleProgram(props.program._id, data);
    } else {
      await saleProgramStore.createSaleProgram(data);
    }

    emit("saved");
  } catch (error) {
    console.error("Error saving sale program:", error);
    alert("Failed to save sale program");
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (props.program) {
    // Populate form with existing program data
    formData.value = {
      title: props.program.title || "",
      shortDescription: props.program.shortDescription || "",
      description: props.program.description || "",
      type: props.program.type || "",
      status: props.program.status || "draft",
      startDate: props.program.startDate
        ? new Date(props.program.startDate).toISOString().slice(0, 16)
        : "",
      endDate: props.program.endDate
        ? new Date(props.program.endDate).toISOString().slice(0, 16)
        : "",
      isActive: props.program.isActive || false,
      maxUsage: props.program.maxUsage || 0,
      conditions: {
        ...formData.value.conditions,
        ...props.program.conditions,
      },
      benefits: {
        ...formData.value.benefits,
        ...props.program.benefits,
      },
      targeting: {
        ...formData.value.targeting,
        ...props.program.targeting,
      },
    };

    if (props.program.bannerImage) {
      bannerPreview.value = props.program.bannerImage;
    }
  }
});
</script>
