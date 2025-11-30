<template>
  <div class="space-y-3 sale-program-badges">
    <div
      v-for="program in displayPrograms"
      :key="program._id"
      class="p-4 border-2 rounded-lg"
      :class="getProgramClass(program.type)"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-2xl">{{ getProgramIcon(program.type) }}</span>
          <div>
            <h4 class="font-bold text-gray-900">{{ program.name }}</h4>
            <p class="text-sm text-gray-600">{{ program.description }}</p>
          </div>
        </div>

        <div v-if="program.benefits?.discountPercentage" class="text-right">
          <div class="text-2xl font-bold text-red-600">
            {{ program.benefits.discountPercentage }}%
          </div>
          <div class="text-xs text-gray-500">OFF</div>
        </div>
      </div>

      <!-- Countdown if applicable -->
      <Countdown
        v-if="program.endDate"
        :end-date="program.endDate"
        :compact="true"
      />

      <!-- Program Details -->
      <div
        v-if="
          program.applicableCategories?.length ||
          program.applicableBrands?.length
        "
        class="mt-3 text-xs text-gray-500"
      >
        <div v-if="program.applicableCategories?.length" class="mb-1">
          <span class="font-semibold">Categories:</span>
          {{ program.applicableCategories.length }} selected
        </div>
        <div v-if="program.applicableBrands?.length">
          <span class="font-semibold">Brands:</span>
          {{ program.applicableBrands.length }} selected
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="displayPrograms.length === 0"
      class="py-8 text-center text-gray-500"
    >
      <svg
        class="w-12 h-12 mx-auto mb-2 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
        />
      </svg>
      <p class="text-sm">No active sale programs</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import Countdown from "../atoms/Countdown.vue";
import { useSaleProgramStore } from "../../store/saleProgram.store";

const props = defineProps({
  salePrograms: {
    type: Array,
    default: () => [],
  },
  product: {
    type: Object,
    default: null,
  },
  showAll: {
    type: Boolean,
    default: false,
  },
});

// Store
const saleProgramStore = useSaleProgramStore();

// Computed
const displayPrograms = computed(() => {
  if (props.showAll) {
    return saleProgramStore.activePrograms;
  }

  if (props.product) {
    const productProgram = saleProgramStore.getProgramForProduct(props.product);
    return productProgram ? [productProgram] : [];
  }

  return props.salePrograms || [];
});

// Methods
function getProgramClass(type) {
  const classes = {
    flash_sale:
      "bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-300",
    seasonal: "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300",
    clearance: "bg-gradient-to-r from-red-50 to-pink-50 border-red-300",
    bundle: "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300",
    percentage: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300",
    fixed_amount:
      "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300",
  };
  return classes[type] || "bg-gray-50 border-gray-300";
}

function getProgramIcon(type) {
  const icons = {
    flash_sale: "⚡",
    seasonal: "🎉",
    clearance: "🔥",
    bundle: "📦",
    percentage: "💰",
    fixed_amount: "💵",
  };
  return icons[type] || "💰";
}

// Lifecycle
onMounted(async () => {
  if (props.showAll || props.product) {
    await saleProgramStore.fetchActivePrograms();
  }
});
</script>