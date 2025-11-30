<template>
  <div class="rating-filter" role="group" aria-labelledby="rating-filter-label">
    <div class="flex items-center justify-between mb-4">
      <h3 id="rating-filter-label" class="text-sm font-semibold text-gray-900">
        Customer Rating
      </h3>
      <button
        v-if="modelValue > 0"
        @click="reset"
        type="button"
        class="text-xs font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 rounded px-2 py-1"
        aria-label="Clear rating filter"
      >
        Clear
      </button>
    </div>

    <div class="space-y-1" role="radiogroup">
      <label
        v-for="rating in ratings"
        :key="rating.value"
        class="flex items-center gap-2.5 cursor-pointer group hover:bg-gray-50 p-2 rounded-md transition-colors"
      >
        <input
          type="radio"
          :value="rating.value"
          :checked="modelValue === rating.value"
          @change="selectRating(rating.value)"
          class="w-4 h-4 text-gray-700 border-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          :aria-label="rating.label"
        />
        <div class="flex items-center gap-2 flex-1">
          <div class="flex items-center" aria-hidden="true">
            <svg
              v-for="star in 5"
              :key="star"
              class="w-4 h-4"
              :class="star <= rating.value ? 'text-amber-400' : 'text-gray-300'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          </div>
          <span
            class="text-sm text-gray-700 group-hover:text-gray-900 font-normal"
          >
            {{ rating.label }}
          </span>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:modelValue"]);

const ratings = [
  { value: 4, label: "4 Stars & Up" },
  { value: 3, label: "3 Stars & Up" },
  { value: 2, label: "2 Stars & Up" },
  { value: 1, label: "1 Star & Up" },
];

const selectRating = (value) => {
  // Toggle off if clicking the same rating
  if (props.modelValue === value) {
    emit("update:modelValue", 0);
  } else {
    emit("update:modelValue", value);
  }
};

const reset = () => {
  emit("update:modelValue", 0);
};
</script>
