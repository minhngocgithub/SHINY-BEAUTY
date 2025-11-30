<template>
  <div
    class="availability-filter"
    role="group"
    aria-labelledby="availability-filter-label"
  >
    <div class="mb-4">
      <h3
        id="availability-filter-label"
        class="text-sm font-semibold text-gray-900"
      >
        Availability
      </h3>
    </div>

    <div>
      <label
        class="flex items-center gap-2.5 cursor-pointer group hover:bg-gray-50 p-2 rounded-md transition-colors"
      >
        <input
          type="checkbox"
          :checked="modelValue"
          @change="toggle"
          class="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          aria-label="Show only in-stock products"
        />
        <div class="flex items-center justify-between flex-1">
          <span
            class="text-sm text-gray-700 group-hover:text-gray-900 font-normal"
          >
            In Stock Only
          </span>
          <span
            class="inline-flex items-center px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md"
            aria-hidden="true"
          >
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            Available
          </span>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const toggle = () => {
  emit("update:modelValue", !props.modelValue);
};
</script>
