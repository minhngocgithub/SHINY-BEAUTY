<template>
  <div
    class="p-6 mt-4 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50"
  >
    <div class="flex items-center gap-3 mb-4">
      <div
        class="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
      >
        <span class="text-2xl">🏦</span>
      </div>
      <div>
        <h3 class="text-lg font-bold text-gray-800">VNPay Payment</h3>
        <p class="text-sm text-gray-600">Thanh toán qua cổng VNPay</p>
      </div>
    </div>

    <div class="mb-4">
      <div class="flex gap-2">
        <button
          @click="paymentType = 'qr'"
          class="flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg"
          :class="
            paymentType === 'qr'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          "
        >
          QR Code
        </button>
        <button
          @click="paymentType = 'card'"
          class="flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg"
          :class="
            paymentType === 'card'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          "
        >
          Thẻ ATM/Visa
        </button>
      </div>
    </div>

    <!-- QR Code Payment -->
    <div v-if="paymentType === 'qr'" class="space-y-4">
      <div
        class="p-4 text-center border-2 border-blue-300 border-dashed rounded-lg bg-blue-50/50"
      >
        <!-- QR Code Placeholder -->
        <div
          class="flex items-center justify-center w-48 h-48 mx-auto mb-3 bg-white border-2 border-blue-200 rounded-lg"
        >
          <svg
            class="w-40 h-40 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        </div>
        <p class="text-sm font-semibold text-blue-800">
          Quét mã QR để thanh toán
        </p>
        <p class="mt-1 text-xs text-blue-600">Mở app VNPay và quét mã QR này</p>
      </div>

      <div
        class="flex items-center gap-2 p-3 border border-blue-200 rounded-lg bg-blue-50"
      >
        <input
          v-model="formData.qrConfirmed"
          type="checkbox"
          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label class="text-sm text-gray-700">
          Tôi đã quét mã QR và xác nhận thanh toán
        </label>
      </div>
      <p v-if="errors.qrConfirmed" class="mt-1 text-xs text-red-600">
        {{ errors.qrConfirmed }}
      </p>
    </div>

    <!-- Card Payment -->
    <div v-else class="space-y-4">
      <!-- Bank Selection -->
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">
          Ngân hàng *
        </label>
        <select
          v-model="formData.bankCode"
          @change="validateBankCode"
          class="w-full px-4 py-3 transition-all duration-200 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="
            errors.bankCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
          "
        >
          <option value="">-- Chọn ngân hàng --</option>
          <option value="VIETCOMBANK">Vietcombank</option>
          <option value="VIETINBANK">VietinBank</option>
          <option value="BIDV">BIDV</option>
          <option value="AGRIBANK">Agribank</option>
          <option value="TECHCOMBANK">Techcombank</option>
          <option value="MBBANK">MB Bank</option>
          <option value="ACB">ACB</option>
          <option value="SACOMBANK">Sacombank</option>
          <option value="VPBank">VPBank</option>
          <option value="TPBank">TPBank</option>
        </select>
        <p v-if="errors.bankCode" class="mt-1 text-xs text-red-600">
          {{ errors.bankCode }}
        </p>
      </div>

      <!-- Card Number -->
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">
          Số thẻ *
        </label>
        <input
          v-model="formData.cardNumber"
          @input="formatCardNumber"
          type="text"
          placeholder="9704 0000 0000 0018"
          maxlength="19"
          class="w-full px-4 py-3 transition-all duration-200 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="
            errors.cardNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
          "
        />
        <p v-if="errors.cardNumber" class="mt-1 text-xs text-red-600">
          {{ errors.cardNumber }}
        </p>
      </div>

      <!-- Cardholder Name -->
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">
          Tên chủ thẻ *
        </label>
        <input
          v-model="formData.cardholderName"
          @input="validateCardholderName"
          type="text"
          placeholder="NGUYEN VAN A"
          class="w-full px-4 py-3 transition-all duration-200 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="
            errors.cardholderName
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300'
          "
        />
        <p v-if="errors.cardholderName" class="mt-1 text-xs text-red-600">
          {{ errors.cardholderName }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <!-- Expiry Date -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Ngày hết hạn *
          </label>
          <input
            v-model="formData.expiryDate"
            @input="formatExpiryDate"
            type="text"
            placeholder="MM/YY"
            maxlength="5"
            class="w-full px-4 py-3 transition-all duration-200 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="
              errors.expiryDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
            "
          />
          <p v-if="errors.expiryDate" class="mt-1 text-xs text-red-600">
            {{ errors.expiryDate }}
          </p>
        </div>

        <!-- CVV -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            CVV *
          </label>
          <input
            v-model="formData.cvv"
            @input="validateCVV"
            type="text"
            placeholder="123"
            maxlength="3"
            class="w-full px-4 py-3 transition-all duration-200 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="errors.cvv ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.cvv" class="mt-1 text-xs text-red-600">
            {{ errors.cvv }}
          </p>
        </div>
      </div>
    </div>

    <!-- Demo Info -->
    <div class="p-3 mt-4 border-l-4 border-blue-500 rounded-lg bg-blue-50">
      <div class="flex items-start gap-2">
        <svg
          class="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="text-xs text-blue-800">
          <p class="font-semibold">Demo Mode</p>
          <p class="mt-1" v-if="paymentType === 'qr'">
            Chỉ cần tick vào checkbox xác nhận để tiếp tục
          </p>
          <p class="mt-1" v-else>
            Bank: Bất kỳ | Card: 9704 0000 0000 0018 | Expiry: 12/25 | CVV: 123
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const emit = defineEmits(["update:valid", "update:data"]);

const paymentType = ref("qr"); // 'qr' or 'card'

const formData = ref({
  // QR Payment
  qrConfirmed: false,

  // Card Payment
  bankCode: "",
  cardNumber: "",
  cardholderName: "",
  expiryDate: "",
  cvv: "",
});

const errors = ref({});

// QR Payment validation
const validateQRConfirmed = () => {
  if (!formData.value.qrConfirmed) {
    errors.value.qrConfirmed = "Vui lòng xác nhận đã thanh toán";
    return false;
  }
  delete errors.value.qrConfirmed;
  return true;
};

// Card Payment validations
const validateBankCode = () => {
  if (!formData.value.bankCode) {
    errors.value.bankCode = "Vui lòng chọn ngân hàng";
    return false;
  }
  delete errors.value.bankCode;
  return true;
};

const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\s/g, "");
  value = value.replace(/\D/g, "");
  value = value.substring(0, 16);
  formData.value.cardNumber = value.match(/.{1,4}/g)?.join(" ") || value;

  if (!value) {
    errors.value.cardNumber = "Số thẻ là bắt buộc";
  } else if (value.length < 16) {
    errors.value.cardNumber = "Số thẻ phải có 16 chữ số";
  } else {
    delete errors.value.cardNumber;
  }
};

const formatExpiryDate = (event) => {
  let value = event.target.value.replace(/\D/g, "");
  if (value.length >= 2) {
    value = value.substring(0, 2) + "/" + value.substring(2, 4);
  }
  formData.value.expiryDate = value;

  if (!value) {
    errors.value.expiryDate = "Ngày hết hạn là bắt buộc";
  } else if (value.length < 5) {
    errors.value.expiryDate = "Định dạng không hợp lệ";
  } else {
    delete errors.value.expiryDate;
  }
};

const validateCVV = () => {
  const cvv = formData.value.cvv.replace(/\D/g, "");
  formData.value.cvv = cvv;

  if (!cvv) {
    errors.value.cvv = "CVV là bắt buộc";
    return false;
  }
  if (cvv.length < 3) {
    errors.value.cvv = "CVV phải có 3 chữ số";
    return false;
  }
  delete errors.value.cvv;
  return true;
};

const validateCardholderName = () => {
  const name = formData.value.cardholderName;
  if (!name) {
    errors.value.cardholderName = "Tên chủ thẻ là bắt buộc";
    return false;
  }
  delete errors.value.cardholderName;
  return true;
};

const isValid = computed(() => {
  if (paymentType.value === "qr") {
    return formData.value.qrConfirmed;
  } else {
    const cardValid =
      formData.value.cardNumber.replace(/\s/g, "").length === 16;
    const expiryValid = formData.value.expiryDate.length === 5;
    const cvvValid = formData.value.cvv.length === 3;
    const nameValid = !!formData.value.cardholderName;
    const bankValid = !!formData.value.bankCode;
    return (
      cardValid &&
      expiryValid &&
      cvvValid &&
      nameValid &&
      bankValid &&
      Object.keys(errors.value).length === 0
    );
  }
});

watch(
  [() => formData.value, isValid, paymentType],
  () => {
    emit("update:valid", isValid.value);
    emit("update:data", { ...formData.value, paymentType: paymentType.value });
  },
  { deep: true }
);

// Reset validation when switching payment type
watch(paymentType, () => {
  errors.value = {};
  formData.value = {
    qrConfirmed: false,
    bankCode: "",
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  };
});
</script>
