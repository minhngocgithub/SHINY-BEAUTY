<template>
  <div
    class="price-range-filter"
    role="group"
    aria-labelledby="price-filter-label"
  >
    <div class="flex items-center justify-between mb-4">
      <h3 id="price-filter-label" class="text-sm font-semibold text-gray-900">
        Price Range
      </h3>
      <button
        v-if="isFiltered"
        @click="reset"
        type="button"
        class="text-xs font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 rounded px-2 py-1"
        aria-label="Reset price filter"
      >
        Reset
      </button>
    </div>

    <div class="space-y-5">
      <!-- Price Inputs -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label
            for="price-min"
            class="block mb-1.5 text-xs font-medium text-gray-700"
            >Minimum</label
          >
          <div class="relative">
            <span
              class="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2 text-sm"
              aria-hidden="true"
              >$</span
            >
            <input
              id="price-min"
              v-model.number="localMin"
              type="number"
              :min="limits.min"
              :max="localMax"
              @change="handleChange"
              class="w-full py-2 pl-7 pr-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors bg-white"
              aria-label="Minimum price"
            />
          </div>
        </div>
        <div>
          <label
            for="price-max"
            class="block mb-1.5 text-xs font-medium text-gray-700"
            >Maximum</label
          >
          <div class="relative">
            <span
              class="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2 text-sm"
              aria-hidden="true"
              >$</span
            >
            <input
              id="price-max"
              v-model.number="localMax"
              type="number"
              :min="localMin"
              :max="limits.max"
              @change="handleChange"
              class="w-full py-2 pl-7 pr-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors bg-white"
              aria-label="Maximum price"
            />
          </div>
        </div>
      </div>

      <!-- Range Slider -->
      <div
        class="relative pt-2 pb-5"
        role="group"
        aria-label="Price range slider"
      >
        <div class="relative h-2 bg-gray-200 rounded-full">
          <div
            class="absolute h-2 bg-gray-700 rounded-full transition-all"
            :style="rangeStyle"
            aria-hidden="true"
          ></div>
        </div>
        <input
          v-model.number="localMin"
          type="range"
          :min="limits.min"
          :max="limits.max"
          :step="10"
          @input="handleChange"
          class="absolute top-0 w-full h-2 bg-transparent appearance-none pointer-events-none range-slider"
          aria-label="Minimum price slider"
        />
        <input
          v-model.number="localMax"
          type="range"
          :min="limits.min"
          :max="limits.max"
          :step="10"
          @input="handleChange"
          class="absolute top-0 w-full h-2 bg-transparent appearance-none pointer-events-none range-slider"
          aria-label="Maximum price slider"
        />
      </div>

      <!-- Quick Presets -->
      <div
        class="flex flex-wrap gap-2"
        role="group"
        aria-label="Price range presets"
      >
        <button
          v-for="preset in presets"
          :key="preset.label"
          type="button"
          @click="applyPreset(preset)"
          class="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:border-gray-500 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          :class="
            isPresetActive(preset)
              ? 'border-gray-700 bg-gray-100 text-gray-900'
              : 'text-gray-700'
          "
          :aria-pressed="isPresetActive(preset)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ min: 0, max: 1000 }),
  },
  limits: {
    type: Object,
    default: () => ({ min: 0, max: 1000 }),
  },
});

const emit = defineEmits(["update:modelValue"]);

const localMin = ref(props.modelValue.min);
const localMax = ref(props.modelValue.max);

const presets = [
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25-$50", min: 25, max: 50 },
  { label: "$50-$100", min: 50, max: 100 },
  { label: "Over $100", min: 100, max: props.limits.max },
];

const rangeStyle = computed(() => {
  const minPercent =
    ((localMin.value - props.limits.min) /
      (props.limits.max - props.limits.min)) *
    100;
  const maxPercent =
    ((localMax.value - props.limits.min) /
      (props.limits.max - props.limits.min)) *
    100;
  return {
    left: `${minPercent}%`,
    width: `${maxPercent - minPercent}%`,
  };
});

const isFiltered = computed(() => {
  return (
    localMin.value !== props.limits.min || localMax.value !== props.limits.max
  );
});

const handleChange = () => {
  // Ensure min is not greater than max
  if (localMin.value > localMax.value) {
    localMin.value = localMax.value;
  }
  emit("update:modelValue", { min: localMin.value, max: localMax.value });
};

const reset = () => {
  localMin.value = props.limits.min;
  localMax.value = props.limits.max;
  handleChange();
};

const applyPreset = (preset) => {
  localMin.value = preset.min;
  localMax.value = preset.max;
  handleChange();
};

const isPresetActive = (preset) => {
  return localMin.value === preset.min && localMax.value === preset.max;
};

watch(
  () => props.modelValue,
  (newVal) => {
    localMin.value = newVal.min;
    localMax.value = newVal.max;
  },
  { deep: true }
);
</script>

<style scoped>
.range-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #374151;
  cursor: pointer;
  pointer-events: all;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

.range-slider::-webkit-slider-thumb:hover {
  background: #1f2937;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

.range-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #374151;
  cursor: pointer;
  pointer-events: all;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

.range-slider::-moz-range-thumb:hover {
  background: #1f2937;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1;
}
</style>
