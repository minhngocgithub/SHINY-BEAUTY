<template>
  <div class="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Checkout
        </h1>
      </div>

      <!-- Stepper -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="flex items-center"
            :class="{ 'flex-1': index < steps.length - 1 }"
          >
            <div class="flex flex-col items-center">
              <div
                class="flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors rounded-full"
                :class="{
                  'bg-gray-900 dark:bg-white text-white dark:text-gray-900':
                    currentStep >= step.id,
                  'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400':
                    currentStep < step.id,
                }"
              >
                {{ step.id }}
              </div>
              <span
                class="mt-2 text-xs font-medium"
                :class="{
                  'text-gray-900 dark:text-white': currentStep >= step.id,
                  'text-gray-500 dark:text-gray-400': currentStep < step.id,
                }"
              >
                {{ step.label }}
              </span>
            </div>
            <div
              v-if="index < steps.length - 1"
              class="flex-1 h-0.5 mx-4"
              :class="{
                'bg-gray-900 dark:bg-white': currentStep > step.id,
                'bg-gray-200 dark:bg-gray-700': currentStep <= step.id,
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div
        class="p-6 mb-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
      >
        <!-- Step 1: Shipping -->
        <div v-if="currentStep === 1">
          <div
            class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Shipping Information
            </h2>

            <!-- Saved Addresses Selector -->
            <div
              v-if="userStore.addresses.length > 0"
              class="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Saved Addresses:
              </label>
              <select
                v-model="selectedAddressId"
                @change="handleAddressSelect"
                class="px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all cursor-pointer hover:border-rose-400"
              >
                <option :value="null" class="text-gray-500">
                  Enter new address
                </option>
                <option
                  v-for="(address, index) in userStore.addresses"
                  :key="address._id"
                  :value="address._id"
                  class="font-medium"
                >
                  {{ address.isDefault ? "⭐ " : "📍 " }}Location
                  {{ index + 1 }}: {{ address.fullName }} - {{ address.city }}
                </option>
              </select>
            </div>
          </div>

          <!-- Info Banner when address is selected -->
          <div
            v-if="selectedAddressId"
            class="p-4 mb-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800"
          >
            <div class="flex items-start gap-2">
              <svg
                class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <div>
                <p
                  class="text-sm font-medium text-green-800 dark:text-green-300"
                >
                  Using saved address
                </p>
                <p class="mt-1 text-xs text-green-700 dark:text-green-400">
                  You can edit the fields below if needed, or select "Enter new
                  address" to start fresh.
                </p>
              </div>
            </div>
          </div>

          <ShippingForm
            ref="shippingFormRef"
            v-model="shippingAddress"
            @validate="shippingValid = $event"
          />
        </div>

        <!-- Step 2: Payment -->
        <div v-if="currentStep === 2">
          <h2 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
            Payment Method
          </h2>
          <PaymentMethodSelector v-model="paymentMethod" />

          <!-- MoMo Payment Form -->
          <MoMoPaymentForm
            v-if="paymentMethod === 'momo'"
            @update:valid="momoFormValid = $event"
            @update:data="momoFormData = $event"
          />

          <!-- PayPal Payment Form -->
          <PayPalPaymentForm
            v-if="paymentMethod === 'paypal'"
            @update:valid="paypalFormValid = $event"
            @update:data="paypalFormData = $event"
          />

          <!-- VNPay Payment Form -->
          <VNPayPaymentForm
            v-if="paymentMethod === 'vnpay'"
            @update:valid="vnpayFormValid = $event"
            @update:data="vnpayFormData = $event"
          />
        </div>

        <!-- Step 3: Review -->
        <div v-if="currentStep === 3">
          <h2 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
            Review Your Order
          </h2>
          <OrderReview
            :shippingAddress="shippingAddress"
            :paymentMethod="paymentMethod"
            :cartItems="filteredCartItems"
            :summary="filteredSummary"
            :calculatedShipping="calculatedShipping"
            ref="orderReviewRef"
            @edit="handleEdit"
          />
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex gap-4">
        <button
          v-if="currentStep > 1"
          @click="previousStep"
          :disabled="loading"
          class="flex-1 py-3 font-medium text-gray-900 transition-colors border border-gray-300 rounded-lg dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Back
        </button>
        <button
          v-if="currentStep < 3"
          @click="nextStep"
          :disabled="!canProceed || loading"
          class="flex-1 py-3 font-medium text-white transition-colors bg-gray-900 rounded-lg dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50"
        >
          Continue
        </button>
        <button
          v-if="currentStep === 3"
          @click="placeOrder"
          :disabled="!canPlaceOrder || loading"
          class="flex-1 py-3 font-medium text-white transition-colors bg-gray-900 rounded-lg dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50"
        >
          {{ loading ? "Processing..." : "Place Order" }}
        </button>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="p-4 mt-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800"
      >
        <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
      </div>
    </div>

    <!-- Fireworks Success Animation -->
    <FireworksAnimation
      :show="showFireworks"
      message="Đơn hàng đã được tạo thành công!"
      :orderNumber="createdOrderId"
      @close="showFireworks = false"
      @view-order="router.push(`/orders/${createdOrderId}`)"
      @continue-shopping="router.push('/')"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../../store/cart.store";
import { useOrderStore } from "../../store/order.store";
import { useUserStore } from "../../store/user.store";
import { storeToRefs } from "pinia";
import ShippingForm from "../../components/checkout/ShippingForm.vue";
import PaymentMethodSelector from "../../components/checkout/PaymentMethodSelector.vue";
import OrderReview from "../../components/checkout/OrderReview.vue";
import MoMoPaymentForm from "../../components/payment/MoMoPaymentForm.vue";
import PayPalPaymentForm from "../../components/payment/PayPalPaymentForm.vue";
import VNPayPaymentForm from "../../components/payment/VNPayPaymentForm.vue";
import FireworksAnimation from "../../components/payment/FireworksAnimation.vue";
import { calculateShippingFee } from "../../service/shipping.service";

const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const userStore = useUserStore();
const { cartItems, cartSummary, isEmpty } = storeToRefs(cartStore);
const selectedCartItemIds = ref([]);

try {
  const saved = sessionStorage.getItem("selectedCartItems");
  if (saved) {
    selectedCartItemIds.value = JSON.parse(saved);
  }
} catch (error) {
  console.warn("Failed to parse selectedCartItems:", error);
}

const filteredCartItems = computed(() => {
  // If no selection saved, show all items (backward compatibility)
  if (!selectedCartItemIds.value || selectedCartItemIds.value.length === 0) {
    console.log(
      "[CheckoutView] No selection, using all",
      cartItems.value.length,
      "items"
    );
    return cartItems.value;
  }
  // Filter to only selected items
  const filtered = cartItems.value.filter((item) =>
    selectedCartItemIds.value.includes(item._id)
  );
  console.log(
    "[CheckoutView] Filtered:",
    filtered.length,
    "of",
    cartItems.value.length,
    "items"
  );
  return filtered;
});

// Persist the filtered checkout items so other checkout pages (eg. CheckoutPayment)
// that read `sessionStorage.checkoutItems` receive the correct selection.
watch(
  filteredCartItems,
  (newItems) => {
    try {
      const toSave = (newItems || []).map((it) => ({
        _id: it._id,
        quantity: it.quantity,
        itemType: it.itemType,
        product: it.product || null,
        bundle: it.bundle || null,
        finalPrice: it.finalPrice,
        originalPrice: it.originalPrice,
      }));
      console.log(
        "[CheckoutView] Saving to sessionStorage:",
        toSave.length,
        "items"
      );
      sessionStorage.setItem("checkoutItems", JSON.stringify(toSave));
    } catch (err) {
      console.warn("Failed to persist checkoutItems:", err);
    }
  },
  { immediate: true, deep: true }
);

// Restore from sessionStorage or use defaults
const savedCheckoutState = sessionStorage.getItem("checkoutState");
const initialState = savedCheckoutState ? JSON.parse(savedCheckoutState) : null;

const currentStep = ref(initialState?.currentStep || 1);
const selectedAddressId = ref(initialState?.selectedAddressId || null);
const shippingAddress = ref(
  initialState?.shippingAddress || {
    fullName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    postalCode: "00000",
    country: "VN",
    note: "",
  }
);
const paymentMethod = ref(initialState?.paymentMethod || "cod");
const shippingValid = ref(initialState?.shippingValid || false);
const loading = ref(false);
const error = ref(null);
const calculatedShipping = ref(initialState?.calculatedShipping || null);

const shippingFormRef = ref(null);
const orderReviewRef = ref(null);

// Payment form validation
const momoFormValid = ref(false);
const momoFormData = ref({});
const paypalFormValid = ref(false);
const paypalFormData = ref({});
const vnpayFormValid = ref(false);
const vnpayFormData = ref({});

// Fireworks animation
const showFireworks = ref(false);
const createdOrderId = ref("");

const steps = [
  { id: 1, label: "Shipping" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Review" },
];

const canProceed = computed(() => {
  if (currentStep.value === 1) return shippingValid.value;
  if (currentStep.value === 2) {
    if (!paymentMethod.value) return false;
    // Validate payment form if MoMo, PayPal or VNPay is selected
    if (paymentMethod.value === "momo") return momoFormValid.value;
    if (paymentMethod.value === "paypal") return paypalFormValid.value;
    if (paymentMethod.value === "vnpay") return vnpayFormValid.value;
    return true; // COD doesn't need validation
  }
  return false;
});

const canPlaceOrder = computed(() => {
  return orderReviewRef.value?.termsAccepted;
});

// Provide a summary that matches the filtered items. If the user selected
// all cart items we can use the backend `cartSummary`; otherwise pass an
// empty object so `OrderReview` recalculates pricing from `cartItems`.
const filteredSummary = computed(() => {
  try {
    if (!filteredCartItems.value || filteredCartItems.value.length === 0)
      return {};
    if (filteredCartItems.value.length === cartItems.value.length) {
      return cartSummary.value || {};
    }
    return {};
  } catch (err) {
    console.warn("[CheckoutView] filteredSummary error", err);
    return {};
  }
});

// Save checkout state to sessionStorage whenever it changes
// Debug payment method changes
watch(paymentMethod, (newVal) => {
  console.log("[CheckoutView] Payment method changed:", newVal);
  console.log("[CheckoutView] Momo form should show:", newVal === "momo");
  console.log("[CheckoutView] PayPal form should show:", newVal === "paypal");
  console.log("[CheckoutView] VNPay form should show:", newVal === "vnpay");
});

watch(
  [
    currentStep,
    selectedAddressId,
    shippingAddress,
    paymentMethod,
    shippingValid,
    calculatedShipping,
  ],
  () => {
    const checkoutState = {
      currentStep: currentStep.value,
      selectedAddressId: selectedAddressId.value,
      shippingAddress: shippingAddress.value,
      paymentMethod: paymentMethod.value,
      shippingValid: shippingValid.value,
      calculatedShipping: calculatedShipping.value,
    };
    sessionStorage.setItem("checkoutState", JSON.stringify(checkoutState));
  },
  { deep: true }
);

const nextStep = () => {
  if (currentStep.value === 1 && shippingFormRef.value) {
    if (!shippingFormRef.value.validate()) return;
  }

  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const handleEdit = (section) => {
  if (section === "shipping") currentStep.value = 1;
  if (section === "payment") currentStep.value = 2;
};

const handleAddressSelect = () => {
  if (!selectedAddressId.value) {
    shippingAddress.value = {
      fullName: "",
      phone: "",
      address: "",
      city: "",
      district: "",
      ward: "",
      postalCode: "00000",
      country: "VN",
      note: "",
    };
    calculatedShipping.value = null;
    return;
  }

  const selectedAddress = userStore.addresses.find(
    (addr) => addr._id === selectedAddressId.value
  );

  if (selectedAddress) {
    shippingAddress.value = {
      fullName: selectedAddress.fullName || "",
      phone: selectedAddress.phone || "",
      address: selectedAddress.street || selectedAddress.address || "",
      city: selectedAddress.city || "",
      district: selectedAddress.district || "",
      ward: selectedAddress.ward || "",
      postalCode: selectedAddress.postalCode || "00000",
      country: selectedAddress.country || "VN",
      note: selectedAddress.note || "",
    };

    if (shippingFormRef.value) {
      shippingFormRef.value.validate();
    }
  }
};
const loadSelectionFromStorage = () => {
  try {
    const saved = sessionStorage.getItem("selectedCartItems");
    if (saved) {
      selectedCartItemIds.value = JSON.parse(saved);
      console.log(
        "[CheckoutView] Loaded selection:",
        selectedCartItemIds.value.length
      );
    } else {
      console.warn("[CheckoutView] No selection in sessionStorage");
      selectedCartItemIds.value = [];
    }
  } catch (error) {
    console.warn("Failed to parse selectedCartItems:", error);
    selectedCartItemIds.value = [];
  }
};
watch(
  filteredCartItems,
  (newItems) => {
    try {
      const toSave = (newItems || [])
        .map((it) => {
          const qty = it.quantity || 1;
          const isProduct = it.itemType === "product" || it.product;
          const itemData = isProduct ? it.product : it.bundle;

          if (!itemData) {
            console.warn("[CheckoutView] Missing item data:", it);
            return null;
          }

          // ✅ Convert line totals to unit prices
          const unitFinalPrice = it.finalPrice
            ? it.finalPrice / qty
            : itemData.salePrice || itemData.bundlePrice || itemData.price || 0;

          const unitOriginalPrice = it.originalPrice
            ? it.originalPrice / qty
            : itemData.price || itemData.originalPrice || unitFinalPrice;

          return {
            _id: it._id,
            quantity: qty,
            itemType: it.itemType,
            product: it.product || null,
            bundle: it.bundle || null,
            finalPrice: unitFinalPrice,
            originalPrice: unitOriginalPrice,
            _meta: {
              name: itemData.name,
              itemType: it.itemType,
            },
          };
        })
        .filter((item) => item !== null);

      console.log(
        "[CheckoutView] Saving to sessionStorage:",
        toSave.length,
        "items"
      );
      sessionStorage.setItem("checkoutItems", JSON.stringify(toSave));
    } catch (err) {
      console.warn("Failed to persist checkoutItems:", err);
    }
  },
  { immediate: true, deep: true }
);

const handleStorageChange = (event) => {
  if (event.key === "selectedCartItems" && event.newValue) {
    try {
      const newSelection = JSON.parse(event.newValue);
      console.log(
        "[CheckoutView] Storage changed, updating selection:",
        newSelection.length
      );
      selectedCartItemIds.value = newSelection;
    } catch (err) {
      console.warn("[CheckoutView] Failed to parse storage change:", err);
    }
  }
};

const placeOrder = async () => {
  try {
    loading.value = true;
    error.value = null;
    if (shippingFormRef.value && !shippingFormRef.value.validate()) {
      error.value =
        "Please fill in all required shipping information correctly.";
      return;
    }
    const orderData = {
      orderItems: filteredCartItems.value.map((item) => {
        const isProduct = item.itemType === "product" || item.product;
        const itemData = isProduct ? item.product : item.bundle;

        if (!itemData) {
          throw new Error(`Invalid cart item: missing product/bundle data`);
        }
        const name = itemData.name || "Unknown Item";
        const image =
          itemData.image &&
          Array.isArray(itemData.image) &&
          itemData.image.length > 0
            ? itemData.image[0].url
            : "/placeholder.jpg";
        const price =
          item.finalPrice || itemData.salePrice || itemData.price || 0;
        const originalPrice =
          item.originalPrice ||
          itemData.price ||
          itemData.originalPrice ||
          price;

        return {
          name,
          quantity: item.quantity || 1,
          image,
          price,
          originalPrice,
          product: isProduct ? item.product?._id || itemData._id : undefined,
          bundle: !isProduct ? item.bundle?._id || itemData._id : undefined,
        };
      }),
      shippingAddress: {
        fullName: shippingAddress.value.fullName || "",
        address: shippingAddress.value.address || "",
        city: shippingAddress.value.city || "",
        district: shippingAddress.value.district || "",
        ward: shippingAddress.value.ward || "",
        postalCode: shippingAddress.value.postalCode || "00000",
        country: shippingAddress.value.country || "VN",
        phone: shippingAddress.value.phone || "",
      },
      paymentMethod: paymentMethod.value.toUpperCase(), // Map to backend enum: COD, VNPAY, MOMO, PAYPAL
      appliedPrograms: cartSummary.value?.applicablePrograms || [],
      note: shippingAddress.value.note || "",
    };

    const order = await orderStore.createOrder(orderData);

    // Clear cart after successful order
    await cartStore.clearCart();

    // Clear checkout state from sessionStorage
    sessionStorage.removeItem("checkoutState");
    sessionStorage.removeItem("selectedCartItems");

    // Show fireworks animation
    createdOrderId.value = order._id;
    showFireworks.value = true;
  } catch (err) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Failed to place order. Please try again.";
    error.value = errorMessage;
    console.error("Place order error:", err);

    if (err.response?.data) {
      console.error("Backend error details:", err.response.data);
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // ✅ Load selection FIRST before fetching cart
  loadSelectionFromStorage();

  await cartStore.fetchCart();

  if (isEmpty.value) {
    router.push("/cart");
    return;
  }

  try {
    await userStore.fetchAddresses();
    const defaultAddress = userStore.addresses.find((addr) => addr.isDefault);
    if (defaultAddress) {
      selectedAddressId.value = defaultAddress._id;
      handleAddressSelect();
    }
  } catch (err) {
    console.error("Failed to load addresses:", err);
  }

  // ✅ Listen for storage changes
  window.addEventListener("storage", handleStorageChange);
});
onBeforeUnmount(() => {
  window.removeEventListener("storage", handleStorageChange);
});
</script>
