<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div
        class="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-500"
      ></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-6 text-center border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-xl"
    >
      <p class="mb-4 text-red-600 dark:text-red-400">{{ error }}</p>
      <button
        @click="loadDashboard"
        class="px-6 py-2 text-white transition-colors bg-red-500 rounded-xl hover:bg-red-600"
      >
        Try Again
      </button>
    </div>

    <div v-else-if="dashboard" class="space-y-6">
      <!-- Tier Card -->
      <TierCard
        :tier="currentTier"
        :points="points"
        :next-tier="nextTier"
        :progress="progressToNextTier"
        :current-spent="totalSpent"
        :current-orders="totalOrders"
        :member-since="memberSince"
      />

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatsCard
          title="Total Spent"
          :value="formatCurrency(totalSpent)"
          color="blue"
        />
        <StatsCard title="Total Orders" :value="totalOrders" color="green" />
        <StatsCard
          title="Available Points"
          :value="points"
          :subtitle="`≈ ${formatCurrency(pointsValue)}`"
          color="purple"
        />
      </div>

      <!-- Benefits Section -->
      <BenefitsCard
        v-if="benefits"
        :benefits="benefits"
        :tier="currentTier?.tier"
        :userBirthDate="authStore.user?.birthDate"
      />

      <!-- Points History -->
      <PointsHistory />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useLoyaltyStore } from "../../store/loyalty.store";
import { useAuthStore } from "../../store/auth.store";
import { formatCurrency } from "../../service/loyalty.service";
import TierCard from "../../components/loyalty/TierCard.vue";
import StatsCard from "../../components/loyalty/StatsCard.vue";
import BenefitsCard from "../../components/loyalty/BenefitsCard.vue";
import PointsHistory from "../../components/loyalty/PointsHistory.vue";

const authStore = useAuthStore();
const loyaltyStore = useLoyaltyStore();
const {
  dashboard,
  loading,
  error,
  currentTier,
  points,
  totalSpent,
  totalOrders,
  nextTier,
  benefits,
  progressToNextTier,
  memberSince,
  pointsValue,
} = storeToRefs(loyaltyStore);

const loadDashboard = async () => {
  try {
    await loyaltyStore.fetchDashboard();
    await loyaltyStore.fetchHistory(1);

    // Debug benefits
    console.log("=== LOYALTY BENEFITS DEBUG ===");
    console.log("Current Tier:", currentTier.value?.tier);
    console.log("Benefits Object:", benefits.value);
    console.log("birthdayGift:", benefits.value?.birthdayGift);
    console.log("earlyAccess:", benefits.value?.earlyAccess);
    console.log("exclusiveProducts:", benefits.value?.exclusiveProducts);
    console.log("conciergeService:", benefits.value?.conciergeService);
    console.log("User BirthDate:", authStore.user?.birthDate);
  } catch (err) {
    console.error("Failed to load loyalty dashboard:", err);
  }
};

onMounted(async () => {
  await loadDashboard();
});
</script>
