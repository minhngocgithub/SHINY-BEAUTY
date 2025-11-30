<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-2xl p-6 bg-white border border-gray-100 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto"
    >
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-xl font-semibold text-gray-800">
            {{ isEditMode ? "Edit Shipping Address" : "Add Shipping Address" }}
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            {{
              isEditMode
                ? "Update your delivery details"
                : "Fill in your delivery details"
            }}
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 transition-colors bg-white rounded-lg hover:text-gray-600"
        >
          <span class="text-2xl">×</span>
        </button>
      </div>

      <!-- Get Current Location Button -->
      <div class="mb-4">
        <button
          type="button"
          @click="handleGetCurrentLocation"
          :disabled="loadingLocation"
          class="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-blue-600 transition-all duration-200 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            v-if="!loadingLocation"
            class="w-5 h-5"
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
          <svg
            v-else
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
          {{
            loadingLocation
              ? "Getting your location..."
              : "📍 Use Current Location"
          }}
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Recipient Name & Phone -->
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              Recipient Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="addressForm.fullName"
              type="text"
              class="w-full px-4 py-3 transition-all border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              Phone Number <span class="text-red-500">*</span>
            </label>
            <input
              v-model="addressForm.phone"
              type="tel"
              pattern="[0-9]{9,11}"
              class="w-full px-4 py-3 transition-all border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              placeholder="0123456789"
              required
            />
          </div>
        </div>

        <!-- Street Address -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Street Address <span class="text-red-500">*</span>
          </label>
          <input
            v-model="addressForm.street"
            type="text"
            class="w-full px-4 py-3 transition-all border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
            placeholder="123 Main Street, Building A"
            required
          />
        </div>

        <!-- Ward, District, City -->
        <div class="grid gap-4 md:grid-cols-3">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              Ward
            </label>
            <input
              v-model="addressForm.ward"
              type="text"
              class="w-full px-4 py-3 transition-all border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              placeholder="Ward 1"
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              District <span class="text-red-500">*</span>
            </label>
            <input
              v-model="addressForm.district"
              type="text"
              class="w-full px-4 py-3 transition-all border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              placeholder="District 1"
              required
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              City <span class="text-red-500">*</span>
            </label>
            <input
              v-model="addressForm.city"
              type="text"
              class="w-full px-4 py-3 transition-all border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              placeholder="Ho Chi Minh"
              required
            />
          </div>
        </div>

        <!-- Postal Code -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Postal Code
          </label>
          <input
            v-model="addressForm.postalCode"
            type="text"
            class="w-full px-4 py-3 transition-all border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
            placeholder="700000"
          />
        </div>

        <!-- Country -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Country <span class="text-red-500">*</span>
          </label>
          <input
            v-model="addressForm.country"
            type="text"
            class="w-full px-4 py-3 transition-all border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
            placeholder="Vietnam"
            required
          />
        </div>

        <!-- Set as Default -->
        <div
          class="flex items-center gap-2 p-4 border border-gray-200 rounded-xl bg-gray-50"
        >
          <input
            v-model="addressForm.isDefault"
            type="checkbox"
            id="isDefault"
            class="w-5 h-5 border-gray-300 rounded text-rose-600 focus:ring-rose-500"
          />
          <label
            for="isDefault"
            class="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Set as default shipping address
          </label>
        </div>

        <!-- Info Note -->
        <div class="p-4 border border-blue-100 bg-blue-50 rounded-xl">
          <p class="text-sm text-blue-700">
            💡 This address will be saved when you place an order and will be
            available for future checkouts.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-6 py-3 font-medium text-gray-600 transition-all duration-200 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="flex-1 px-6 py-3 font-medium text-white transition-all duration-200 shadow-sm bg-gradient-to-r from-rose-400 to-violet-400 rounded-xl hover:from-rose-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{
              loading
                ? "Saving..."
                : isEditMode
                ? "Update Address"
                : "Save Address"
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useUserStore } from "../../store/user.store";
import { showErrorAlert, showSuccessAlert } from "../../../utils/sweetAlert";
import { getCurrentLocationWithAddress } from "../../service/location.service";

const props = defineProps({
  editMode: {
    type: Boolean,
    default: false,
  },
  addressData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "address-added", "address-updated"]);
const userStore = useUserStore();

const loading = ref(false);
const loadingLocation = ref(false);
const isEditMode = computed(() => props.editMode && props.addressData);

const addressForm = ref({
  fullName: "",
  phone: "",
  street: "",
  ward: "",
  district: "",
  city: "",
  postalCode: "",
  country: "Vietnam",
  addressType: "home",
  isDefault: false,
  note: "",
});

// Watch for addressData changes to populate form in edit mode
watch(
  () => props.addressData,
  (newData) => {
    if (newData && props.editMode) {
      addressForm.value = {
        fullName: newData.fullName || "",
        phone: newData.phone || "",
        street: newData.street || "",
        ward: newData.ward || "",
        district: newData.district || "",
        city: newData.city || "",
        postalCode: newData.postalCode || "",
        country: newData.country || "Vietnam",
        addressType: newData.addressType || "home",
        isDefault: newData.isDefault || false,
        note: newData.note || "",
      };
    }
  },
  { immediate: true }
);

// ==================== GET CURRENT LOCATION ====================
const handleGetCurrentLocation = async () => {
  try {
    loadingLocation.value = true;

    // Get position and address
    const { position, address } = await getCurrentLocationWithAddress();

    // Fill in the form with detected address
    addressForm.value.street = address.street || addressForm.value.street;
    addressForm.value.ward = address.ward || addressForm.value.ward;
    addressForm.value.district = address.district || addressForm.value.district;
    addressForm.value.city = address.city || addressForm.value.city;
    addressForm.value.country = address.country || addressForm.value.country;
    addressForm.value.postalCode =
      address.postalCode || addressForm.value.postalCode;

    showSuccessAlert(
      "Location Detected! 📍",
      `We found your address. Please verify and complete the remaining fields.`
    );
  } catch (error) {
    console.error("Location error:", error);
    showErrorAlert(
      "Location Error",
      error.message ||
        "Unable to get your current location. Please enter address manually."
    );
  } finally {
    loadingLocation.value = false;
  }
};

// Form validation
const isFormValid = computed(() => {
  return (
    addressForm.value.fullName.trim() !== "" &&
    addressForm.value.phone.trim() !== "" &&
    /^[0-9]{9,11}$/.test(addressForm.value.phone) &&
    addressForm.value.street.trim() !== "" &&
    addressForm.value.district.trim() !== "" &&
    addressForm.value.city.trim() !== "" &&
    addressForm.value.country.trim() !== ""
  );
});

const handleSubmit = async () => {
  if (!isFormValid.value) {
    showErrorAlert(
      "Validation Error",
      "Please fill in all required fields correctly"
    );
    return;
  }

  try {
    loading.value = true;

    if (isEditMode.value) {
      // Update existing address
      await userStore.updateAddress(props.addressData._id, addressForm.value);
      showSuccessAlert("Success!", "Address updated successfully");
      emit("address-updated");
    } else {
      // Add new address
      await userStore.addAddress(addressForm.value);
      showSuccessAlert("Success!", "Address added successfully");
      emit("address-added");
    }

    emit("close");
  } catch (error) {
    console.error(
      isEditMode.value ? "Update address error:" : "Add address error:",
      error
    );
    showErrorAlert(
      "Error",
      userStore.error ||
        `Failed to ${isEditMode.value ? "update" : "add"} address`
    );
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
input:focus {
  outline: none;
}

/* Custom scrollbar */
div::-webkit-scrollbar {
  width: 8px;
}

div::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

div::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

div::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
