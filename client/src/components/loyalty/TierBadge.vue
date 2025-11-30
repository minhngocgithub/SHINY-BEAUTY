<template>
  <div
    class="inline-flex items-center gap-2 px-4 py-2 font-semibold transition-all rounded-full"
    :class="[sizeClasses, tierColors.badge, 'text-white shadow-sm']"
  >
    <span :class="iconSizeClass">{{ tierIcon }}</span>
    <span>{{ displayName }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { getTierIcon, getTierColor } from "../../service/loyalty.service";

const props = defineProps({
  tier: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "medium", // small, medium, large
    validator: (value) => ["small", "medium", "large"].includes(value),
  },
});

const tierIcon = computed(() => getTierIcon(props.tier));
const tierColors = computed(() => getTierColor(props.tier));

const displayName = computed(() => {
  const names = {
    NEW_CUSTOMER: "New",
    REGULAR: "Regular",
    VIP: "VIP",
    PLATINUM: "Platinum",
  };
  return names[props.tier] || "New";
});

const sizeClasses = computed(() => {
  const sizes = {
    small: "text-xs px-2 py-1",
    medium: "text-sm px-3 py-1.5",
    large: "text-base px-4 py-2",
  };
  return sizes[props.size];
});

const iconSizeClass = computed(() => {
  const sizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-xl",
  };
  return sizes[props.size];
});
</script>
