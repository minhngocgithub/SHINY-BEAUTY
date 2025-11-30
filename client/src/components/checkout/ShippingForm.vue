<template>
  <div class="space-y-6">
    <div>
      <label
        class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Full Name *
      </label>
      <input
        v-model="formData.fullName"
        type="text"
        placeholder="Enter your full name"
        class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
        :class="{ 'border-red-500': errors.fullName }"
        autocomplete="name"
      />
      <p
        v-if="errors.fullName"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ errors.fullName }}
      </p>
    </div>

    <div>
      <label
        class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Phone Number *
      </label>
      <input
        v-model="formData.phone"
        type="tel"
        placeholder="0123456789"
        class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
        :class="{ 'border-red-500': errors.phone }"
        autocomplete="tel"
      />
      <p
        v-if="errors.phone"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ errors.phone }}
      </p>
    </div>

    <div class="relative">
      <label
        class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Address *
      </label>
      <input
        v-model="formData.address"
        type="text"
        placeholder="Street address, apartment, suite, etc."
        class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white relative z-10"
        :class="{ 'border-red-500': errors.address }"
        autocomplete="street-address"
      />
      <p
        v-if="errors.address"
        class="mt-1 text-sm text-red-600 dark:text-red-400"
      >
        {{ errors.address }}
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <label
          class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          City/Province *
        </label>
        <select
          v-model="formData.city"
          class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
          :class="{ 'border-red-500': errors.city }"
          :disabled="loadingProvinces"
        >
          <option value="">
            {{ loadingProvinces ? "Loading..." : "Select city/province" }}
          </option>
          <optgroup v-if="!loadingProvinces" label="Miền Bắc">
            <option
              v-for="province in northernProvinces"
              :key="province.name"
              :value="province.name"
            >
              {{ province.name }} ({{ province.distance }}km -
              {{ formatFee(province.estimatedFee) }})
            </option>
          </optgroup>
          <optgroup v-if="!loadingProvinces" label="Miền Trung">
            <option
              v-for="province in centralProvinces"
              :key="province.name"
              :value="province.name"
            >
              {{ province.name }} ({{ province.distance }}km -
              {{ formatFee(province.estimatedFee) }})
            </option>
          </optgroup>
          <optgroup v-if="!loadingProvinces" label="Miền Nam">
            <option
              v-for="province in southernProvinces"
              :key="province.name"
              :value="province.name"
            >
              {{ province.name }} ({{ province.distance }}km -
              {{ formatFee(province.estimatedFee) }})
            </option>
          </optgroup>
        </select>
        <p
          v-if="errors.city"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ errors.city }}
        </p>
        <!-- Shipping Info Preview -->
        <div
          v-if="selectedProvinceInfo"
          class="p-2 mt-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"
        >
          <p class="text-xs text-blue-700 dark:text-blue-300">
            📍 Distance: {{ selectedProvinceInfo.distance }}km • Fee:
            {{ formatFee(selectedProvinceInfo.estimatedFee) }} • Zone:
            {{ selectedProvinceInfo.zone }}
          </p>
        </div>
      </div>

      <div>
        <label
          class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          District *
        </label>
        <select
          v-model="formData.district"
          class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
          :class="{ 'border-red-500': errors.district }"
          :disabled="!formData.city || loadingDistricts"
        >
          <option value="">
            {{
              loadingDistricts
                ? "Loading districts..."
                : !formData.city
                ? "Select city first"
                : "Select district"
            }}
          </option>
          <option
            v-for="district in vnDistricts"
            :key="district.code"
            :value="district.name"
          >
            {{ district.name }}
          </option>
        </select>
        <p
          v-if="errors.district"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ errors.district }}
        </p>
      </div>

      <div>
        <label
          class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Ward *
        </label>
        <select
          v-model="formData.ward"
          class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
          :class="{ 'border-red-500': errors.ward }"
          :disabled="!formData.district || loadingWards"
        >
          <option value="">
            {{
              loadingWards
                ? "Loading wards..."
                : !formData.district
                ? "Select district first"
                : "Select ward"
            }}
          </option>
          <option v-for="ward in vnWards" :key="ward.code" :value="ward.name">
            {{ ward.name }}
          </option>
        </select>
        <p
          v-if="errors.ward"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ errors.ward }}
        </p>
      </div>
    </div>

    <div>
      <label
        class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Delivery Notes (Optional)
      </label>
      <textarea
        v-model="formData.note"
        rows="3"
        placeholder="Add delivery instructions..."
        class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white resize-none"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref, computed, onMounted } from "vue";
import { getProvinces } from "../../service/shipping.service";
import axios from "axios";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue", "validate"]);

const formData = reactive({
  fullName: props.modelValue.fullName || "",
  phone: props.modelValue.phone || "",
  address: props.modelValue.address || "",
  city: props.modelValue.city || "",
  district: props.modelValue.district || "",
  ward: props.modelValue.ward || "",
  postalCode: props.modelValue.postalCode || "00000",
  country: props.modelValue.country || "VN",
  note: props.modelValue.note || "",
});

const errors = reactive({
  fullName: "",
  phone: "",
  address: "",
  city: "",
  district: "",
  ward: "",
  postalCode: "",
  country: "",
});

// Vietnam Provinces API Data
const shippingProvinces = ref([]);
const loadingProvinces = ref(true);
const vnProvinces = ref([]); // From Vietnam Open API
const vnDistricts = ref([]);
const vnWards = ref([]);
const loadingDistricts = ref(false);
const loadingWards = ref(false);
const selectedProvinceCode = ref(null);
const selectedDistrictCode = ref(null);

// Load Vietnam provinces with shipping info on mount
onMounted(async () => {
  try {
    // Load shipping provinces from backend (63 provinces with fees)
    const provinces = await getProvinces();
    shippingProvinces.value = provinces;

    // Load full Vietnam provinces from Open API (with codes for district/ward lookup)
    const response = await axios.get("https://provinces.open-api.vn/api/p/");
    vnProvinces.value = response.data;

    loadingProvinces.value = false;
  } catch (error) {
    console.error("Error loading provinces:", error);
    loadingProvinces.value = false;
  }
});

// Computed: Group provinces by region
const northernProvinces = computed(() => {
  return shippingProvinces.value.filter((p) =>
    ["local", "nearby", "north", "north_far"].includes(p.zone)
  );
});

const centralProvinces = computed(() => {
  return shippingProvinces.value.filter((p) => p.zone === "central");
});

const southernProvinces = computed(() => {
  return shippingProvinces.value.filter((p) => p.zone === "south");
});

// Computed: Get selected province info
const selectedProvinceInfo = computed(() => {
  if (!formData.city) return null;
  return shippingProvinces.value.find((p) => p.name === formData.city);
});

// Format fee for display
const formatFee = (fee) => {
  return fee === 0 ? "FREE" : `$${fee.toFixed(2)}`;
};

// Watch city change → Load districts
watch(
  () => formData.city,
  async (newCity) => {
    if (!newCity) {
      vnDistricts.value = [];
      vnWards.value = [];
      formData.district = "";
      formData.ward = "";
      selectedProvinceCode.value = null;
      selectedDistrictCode.value = null;
      return;
    }

    // Find province code from Vietnam API
    const vnProvince = vnProvinces.value.find(
      (p) =>
        p.name === newCity ||
        p.name.includes(newCity) ||
        newCity.includes(p.name)
    );

    if (vnProvince) {
      selectedProvinceCode.value = vnProvince.code;

      // Load districts for this province
      try {
        loadingDistricts.value = true;
        const response = await axios.get(
          `https://provinces.open-api.vn/api/p/${vnProvince.code}?depth=2`
        );
        vnDistricts.value = response.data.districts || [];
        loadingDistricts.value = false;

        // Reset district and ward when city changes
        formData.district = "";
        formData.ward = "";
        vnWards.value = [];
        selectedDistrictCode.value = null;
      } catch (error) {
        console.error("Error loading districts:", error);
        loadingDistricts.value = false;
        vnDistricts.value = [];
      }
    } else {
      // City not found in Vietnam API
      console.warn(`Province "${newCity}" not found in Vietnam API`);
      vnDistricts.value = [];
      vnWards.value = [];
      selectedProvinceCode.value = null;
    }
  }
);

// Watch district change → Load wards
watch(
  () => formData.district,
  async (newDistrict) => {
    if (!newDistrict || !selectedProvinceCode.value) {
      vnWards.value = [];
      formData.ward = "";
      selectedDistrictCode.value = null;
      return;
    }

    // Find district code
    const vnDistrict = vnDistricts.value.find(
      (d) =>
        d.name === newDistrict ||
        d.name.includes(newDistrict) ||
        newDistrict.includes(d.name)
    );

    if (vnDistrict) {
      selectedDistrictCode.value = vnDistrict.code;

      // Load wards for this district
      try {
        loadingWards.value = true;
        const response = await axios.get(
          `https://provinces.open-api.vn/api/d/${vnDistrict.code}?depth=2`
        );
        vnWards.value = response.data.wards || [];
        loadingWards.value = false;

        // Reset ward when district changes
        formData.ward = "";
      } catch (error) {
        console.error("Error loading wards:", error);
        loadingWards.value = false;
        vnWards.value = [];
      }
    } else {
      // District not found
      console.warn(`District "${newDistrict}" not found`);
      vnWards.value = [];
      selectedDistrictCode.value = null;
    }
  }
);

// Watch for external changes to modelValue (when address is selected)
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      formData.fullName = newValue.fullName || "";
      formData.phone = newValue.phone || "";
      formData.address = newValue.address || "";
      formData.city = newValue.city || "";
      formData.district = newValue.district || "";
      formData.ward = newValue.ward || "";
      formData.postalCode = newValue.postalCode || "00000";
      formData.country = newValue.country || "VN";
      formData.note = newValue.note || "";
      
      // Re-validate after syncing data
      const isValid = validate();
      emit("validate", isValid);
    }
  },
  { deep: true }
);

const validate = () => {
  let isValid = true;

  // Reset errors
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  if (!formData.fullName.trim()) {
    errors.fullName = "Full name is required";
    isValid = false;
  }

  if (!formData.phone.trim()) {
    errors.phone = "Phone number is required";
    isValid = false;
  } else if (!/^[0-9]{9,11}$/.test(formData.phone)) {
    errors.phone = "Invalid phone number format";
    isValid = false;
  }

  if (!formData.address.trim()) {
    errors.address = "Address is required";
    isValid = false;
  }

  if (!formData.city) {
    errors.city = "City is required";
    isValid = false;
  } else {
    // Validate city exists in shipping provinces
    const cityExists = shippingProvinces.value.some(
      (p) => p.name === formData.city
    );
    if (!cityExists) {
      errors.city = "City/Province does not exist in Vietnam";
      isValid = false;
    }
  }

  if (!formData.district.trim()) {
    errors.district = "District is required";
    isValid = false;
  } else if (selectedProvinceCode.value && vnDistricts.value.length > 0) {
    // Validate district exists in the selected province
    const districtExists = vnDistricts.value.some(
      (d) =>
        d.name === formData.district ||
        d.name.includes(formData.district) ||
        formData.district.includes(d.name)
    );
    if (!districtExists) {
      errors.district = `District "${formData.district}" does not exist in ${formData.city}`;
      isValid = false;
    }
  }

  if (!formData.ward.trim()) {
    errors.ward = "Ward is required";
    isValid = false;
  } else if (selectedDistrictCode.value && vnWards.value.length > 0) {
    // Validate ward exists in the selected district
    const wardExists = vnWards.value.some(
      (w) =>
        w.name === formData.ward ||
        w.name.includes(formData.ward) ||
        formData.ward.includes(w.name)
    );
    if (!wardExists) {
      errors.ward = `Ward "${formData.ward}" does not exist in ${formData.district}`;
      isValid = false;
    }
  }

  return isValid;
};

// Helper function to check validation without resetting errors (for auto-validation)
const checkValidation = () => {
  if (!formData.fullName.trim()) return false;
  if (!formData.phone.trim() || !/^[0-9]{9,11}$/.test(formData.phone)) return false;
  if (!formData.address.trim()) return false;
  if (!formData.city) return false;
  if (!formData.district.trim()) return false;
  if (!formData.ward.trim()) return false;
  
  // Check city exists in shipping provinces
  if (formData.city && shippingProvinces.value.length > 0) {
    const cityExists = shippingProvinces.value.some(
      (p) => p.name === formData.city
    );
    if (!cityExists) return false;
  }
  
  return true;
};

// Auto-validate when form data changes and emit validation status
watch(
  formData,
  () => {
    emit("update:modelValue", { ...formData });
    // Auto-validate and emit validation status (without resetting errors)
    const isValid = checkValidation();
    emit("validate", isValid);
  },
  { deep: true, immediate: true }
);

// Watch for external changes and re-validate
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      formData.fullName = newValue.fullName || "";
      formData.phone = newValue.phone || "";
      formData.address = newValue.address || "";
      formData.city = newValue.city || "";
      formData.district = newValue.district || "";
      formData.ward = newValue.ward || "";
      formData.postalCode = newValue.postalCode || "00000";
      formData.country = newValue.country || "VN";
      formData.note = newValue.note || "";
      
      // Re-validate after syncing data
      const isValid = checkValidation();
      emit("validate", isValid);
    }
  },
  { deep: true }
);

defineExpose({ validate });
</script>