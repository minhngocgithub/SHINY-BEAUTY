<template>
  <div
    v-if="show"
    :class="`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${badgeClass}`"
  >
    <span v-if="icon" class="mr-1">{{ icon }}</span>
    {{ text }}
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) =>
      ["new", "bestseller", "sale", "flash", "limited", "custom"].includes(
        value
      ),
  },
  text: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "",
  },
  show: {
    type: Boolean,
    default: true,
  },
});

const badgeClass = computed(() => {
  const classes = {
    new: "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
    bestseller: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
    sale: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
    flash:
      "bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-pulse",
    limited: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    custom: "bg-gray-500 text-white",
  };
  return classes[props.type] || classes.custom;
});

const displayText = computed(() => {
  if (props.text) return props.text;

  const defaultTexts = {
    new: "New",
    bestseller: "Best Seller",
    sale: "Sale",
    flash: "Flash Sale",
    limited: "Limited",
    custom: "",
  };
  return defaultTexts[props.type] || "";
});

const displayIcon = computed(() => {
  if (props.icon) return props.icon;

  const defaultIcons = {
    new: "✨",
    bestseller: "⭐",
    sale: "🔥",
    flash: "⚡",
    limited: "🏷️",
    custom: "",
  };
  return defaultIcons[props.type] || "";
});
</script>






