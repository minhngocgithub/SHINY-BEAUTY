<template>
  <div
    class="relative p-8 overflow-hidden transition-all duration-300 shadow-lg rounded-xl hover:shadow-2xl"
    :class="tierColors.bg"
  >
    <div class="absolute inset-0 opacity-10">
      <div
        class="absolute inset-0"
        style="
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(255, 255, 255, 0.1) 35px,
            rgba(255, 255, 255, 0.1) 70px
          );
        "
      ></div>
    </div>

    <div class="relative z-10">
      <!-- Tier Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="text-4xl">{{ tierIcon }}</span>
            <h2 class="text-3xl font-bold" :class="tierColors.text">
              {{ tier?.name }}
            </h2>
          </div>
          <p class="text-sm opacity-75" :class="tierColors.text">
            Member since {{ formatMemberDate }}
          </p>
        </div>

        <!-- Points Display -->
        <div class="text-right">
          <p class="mb-1 text-sm opacity-75" :class="tierColors.text">
            Available Points
          </p>
          <p class="text-4xl font-bold" :class="tierColors.text">
            {{ points.toLocaleString("en-US") }}
          </p>
          <p class="text-xs opacity-75" :class="tierColors.text">
            ≈ {{ formatCurrency(points * 1000) }}
          </p>
        </div>
      </div>

      <!-- Progress Bar (if not Platinum) -->
      <div v-if="nextTier" class="space-y-4">
        <div class="h-px bg-white/20"></div>

        <div>
          <div
            class="flex justify-between mb-2 text-sm"
            :class="tierColors.text"
          >
            <span>Progress to {{ nextTier.name }}</span>
            <span class="font-semibold"> {{ overallProgressPercent }}% </span>
          </div>

          <!-- Spending Progress -->
          <div class="mb-3">
            <div
              class="flex justify-between mb-1 text-xs"
              :class="tierColors.text"
            >
              <span>Spending: {{ formatCurrency(currentSpent) }}</span>
              <span
                >Need:
                {{ formatCurrency(progress?.requiredSpending || 0) }}</span
              >
            </div>
            <div class="w-full h-2 rounded-full bg-white/20">
              <div
                class="h-2 transition-all duration-500 rounded-full"
                :class="tierColors.badge"
                :style="{
                  width: `${Math.min(100, progress?.spendingProgress || 0)}%`,
                }"
              ></div>
            </div>
          </div>

          <!-- Orders Progress -->
          <div>
            <div
              class="flex justify-between mb-1 text-xs"
              :class="tierColors.text"
            >
              <span>Orders: {{ currentOrders }}</span>
              <span>Need: {{ progress?.requiredOrders || 0 }} more</span>
            </div>
            <div class="w-full h-2 rounded-full bg-white/20">
              <div
                class="h-2 transition-all duration-500 rounded-full"
                :class="tierColors.badge"
                :style="{
                  width: `${Math.min(100, progress?.ordersProgress || 0)}%`,
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Platinum Message -->
      <div v-else class="py-4 text-center">
        <p class="text-lg font-semibold" :class="tierColors.text">
          🎉 You've reached the highest tier! 🎉
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  getTierColor,
  getTierIcon,
  formatCurrency,
} from "../../service/loyalty.service";

const props = defineProps({
  tier: {
    type: Object,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  nextTier: {
    type: Object,
    default: null,
  },
  progress: {
    type: Object,
    default: null,
  },
  currentSpent: {
    type: Number,
    default: 0,
  },
  currentOrders: {
    type: Number,
    default: 0,
  },
  memberSince: {
    type: String,
    default: null,
  },
});

const tierColors = computed(() => getTierColor(props.tier?.tier));
const tierIcon = computed(() => getTierIcon(props.tier?.tier));

const formatMemberDate = computed(() => {
  if (!props.memberSince) return "N/A";
  return new Date(props.memberSince).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
});

const overallProgressPercent = computed(() => {
  if (!props.progress) return 0;
  const { spendingProgress, ordersProgress } = props.progress;
  return Math.min(100, Math.round((spendingProgress + ordersProgress) / 2));
});
</script>
