<template>
  <div class="min-h-screen p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <!-- Header -->
    <div class="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-4xl font-bold text-slate-900 dark:text-white">Coupons</h1>
        <p class="mt-2 text-slate-600 dark:text-slate-400">Create and manage discount coupons</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center justify-center w-full gap-2 px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 sm:w-auto"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Coupon
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
      <div class="p-4 bg-white rounded-lg shadow-sm dark:bg-slate-800">
        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Coupons</p>
        <p class="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{{ stats.total }}</p>
      </div>
      <div class="p-4 bg-white rounded-lg shadow-sm dark:bg-slate-800">
        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Active</p>
        <p class="mt-1 text-3xl font-bold text-green-600">{{ stats.active }}</p>
      </div>
      <div class="p-4 bg-white rounded-lg shadow-sm dark:bg-slate-800">
        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Times Used</p>
        <p class="mt-1 text-3xl font-bold text-blue-600">{{ stats.used }}</p>
      </div>
      <div class="p-4 bg-white rounded-lg shadow-sm dark:bg-slate-800">
        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Saved</p>
        <p class="mt-1 text-3xl font-bold text-purple-600">${{ stats.totalSaved.toFixed(2) }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search coupons by code..."
        class="flex-1 px-4 py-2 bg-white border rounded-lg dark:bg-slate-800 dark:border-slate-700"
        @input="debouncedSearch"
      />
      <select
        v-model="typeFilter"
        class="px-4 py-2 bg-white border rounded-lg dark:bg-slate-800 dark:border-slate-700"
      >
        <option value="">All Types</option>
        <option value="percentage">Percentage</option>
        <option value="fixed">Fixed Amount</option>
      </select>
      <select
        v-model="statusFilter"
        class="px-4 py-2 bg-white border rounded-lg dark:bg-slate-800 dark:border-slate-700"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="expired">Expired</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
    </div>

    <!-- Coupons Table -->
    <div v-else-if="filteredCoupons.length > 0" class="overflow-x-auto bg-white rounded-lg shadow-sm dark:bg-slate-800">
      <table class="w-full">
        <thead class="bg-slate-50 dark:bg-slate-700">
          <tr>
            <th class="px-6 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300">Code</th>
            <th class="px-6 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300">Discount</th>
            <th class="px-6 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300">Min Purchase</th>
            <th class="px-6 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300">Status</th>
            <th class="px-6 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300">Usage</th>
            <th class="px-6 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300">Valid Until</th>
            <th class="px-6 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr
            v-for="coupon in filteredCoupons"
            :key="coupon._id"
            class="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <td class="px-6 py-4">
              <code class="px-2 py-1 font-mono text-sm rounded bg-slate-100 dark:bg-slate-700">{{ coupon.code }}</code>
            </td>
            <td class="px-6 py-4 font-semibold">
              <span v-if="coupon.discountType === 'percentage'">{{ coupon.discountValue }}%</span>
              <span v-else>${{ coupon.discountValue }}</span>
            </td>
            <td class="px-6 py-4">${{ coupon.minPurchase || 0 }}</td>
            <td class="px-6 py-4">
              <span
                :class="getCouponStatusClass(coupon)"
                class="px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ getCouponStatus(coupon) }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm">
              <div class="flex items-center gap-2">
                <span>{{ coupon.usedCount || 0 }}</span>
                <span v-if="coupon.usageLimit" class="text-slate-500">/ {{ coupon.usageLimit }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm">{{ formatDate(coupon.endDate) }}</td>
            <td class="px-6 py-4">
              <div class="flex gap-2">
                <button
                  @click="copyCode(coupon.code)"
                  class="px-2 py-1 text-xs text-blue-600 rounded hover:bg-blue-50"
                  title="Copy code"
                >
                  Copy
                </button>
                <button
                  @click="editCoupon(coupon)"
                  class="px-2 py-1 text-xs text-blue-600 rounded hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  @click="deleteCoupon(coupon._id)"
                  class="px-2 py-1 text-xs text-red-600 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="py-12 text-center bg-white rounded-lg dark:bg-slate-800">
      <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="mb-4 text-slate-600 dark:text-slate-400">No coupons found</p>
      <button
        @click="showCreateModal = true"
        class="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Create First Coupon
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingCoupon"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div class="w-full max-w-lg p-6 bg-white rounded-lg dark:bg-slate-800">
        <h3 class="mb-6 text-xl font-bold text-slate-900 dark:text-white">
          {{ editingCoupon ? 'Edit Coupon' : 'Create Coupon' }}
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block mb-2 text-sm font-medium">Code</label>
            <input v-model="formData.code" type="text" class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 text-sm font-medium">Type</label>
              <select v-model="formData.discountType" class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium">Value</label>
              <input v-model.number="formData.discountValue" type="number" class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 text-sm font-medium">Min Purchase</label>
              <input v-model.number="formData.minPurchase" type="number" class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700" />
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium">Usage Limit</label>
              <input v-model.number="formData.usageLimit" type="number" class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 text-sm font-medium">Start Date</label>
              <input v-model="formData.startDate" type="date" class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700" />
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium">End Date</label>
              <input v-model="formData.endDate" type="date" class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700" />
            </div>
          </div>

          <div class="flex items-center">
            <input v-model="formData.isActive" type="checkbox" class="mr-2 rounded" />
            <label class="text-sm">Active</label>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="closeModal" class="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
          <button @click="saveCoupon" class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            {{ editingCoupon ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axiosApiInstance from '../../../utils/api';

const BASE_COUPON_API = '/coupon';

// State
const coupons = ref([]);
const loading = ref(false);
const showCreateModal = ref(false);
const editingCoupon = ref(null);
const searchQuery = ref('');
const typeFilter = ref('');
const statusFilter = ref('');
let searchTimeout = null;

const formData = ref({
  code: '',
  discountType: 'percentage',
  discountValue: 10,
  minPurchase: 0,
  usageLimit: null,
  startDate: '',
  endDate: '',
  isActive: true,
});

// Computed
const stats = computed(() => {
  const now = new Date();
  return {
    total: coupons.value.length,
    active: coupons.value.filter((c) => c.isActive && new Date(c.endDate) > now).length,
    used: coupons.value.reduce((sum, c) => sum + (c.usedCount || 0), 0),
    totalSaved: coupons.value.reduce((sum, c) => sum + (c.totalSaved || 0), 0),
  };
});

const filteredCoupons = computed(() => {
  return coupons.value.filter((c) => {
    const matchSearch = !searchQuery.value || c.code.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchType = !typeFilter.value || c.discountType === typeFilter.value;
    const matchStatus = !statusFilter.value || (statusFilter.value === 'active' ? c.isActive : !c.isActive);
    return matchSearch && matchType && matchStatus;
  });
});

// Methods
const fetchCoupons = async () => {
  loading.value = true;
  try {
    const response = await axiosApiInstance.get(`${BASE_COUPON_API}/admin/all`);
    coupons.value = response.data.data || response.data.coupons || [];
  } catch (err) {
    console.error('Failed to fetch coupons:', err);
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchCoupons, 500);
};

const getCouponStatus = (coupon) => {
  const now = new Date();
  const endDate = new Date(coupon.endDate);
  if (!coupon.isActive) return 'Inactive';
  if (endDate < now) return 'Expired';
  return 'Active';
};

const getCouponStatusClass = (coupon) => {
  const status = getCouponStatus(coupon);
  return {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-gray-100 text-gray-800',
    Expired: 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const copyCode = (code) => {
  navigator.clipboard.writeText(code);
  alert('Code copied!');
};

const editCoupon = (coupon) => {
  editingCoupon.value = coupon;
  formData.value = { ...coupon };
};

const closeModal = () => {
  showCreateModal.value = false;
  editingCoupon.value = null;
  formData.value = {
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 0,
    usageLimit: null,
    startDate: '',
    endDate: '',
    isActive: true,
  };
};

const saveCoupon = async () => {
  if (!formData.value.code) {
    alert('Coupon code is required');
    return;
  }

  try {
    if (editingCoupon.value) {
      await axiosApiInstance.put(`${BASE_COUPON_API}/${editingCoupon.value._id}`, formData.value);
    } else {
      await axiosApiInstance.post(BASE_COUPON_API, formData.value);
    }
    await fetchCoupons();
    closeModal();
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to save coupon');
  }
};

const deleteCoupon = async (id) => {
  if (!confirm('Delete this coupon?')) return;
  try {
    await axiosApiInstance.delete(`${BASE_COUPON_API}/${id}`);
    await fetchCoupons();
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete coupon');
  }
};

// Lifecycle
onMounted(() => {
  fetchCoupons();
});
</script>
