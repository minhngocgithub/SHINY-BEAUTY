<template>
  <div class="subcategory-tabs">
    <!-- Desktop Tabs -->
    <div class="hidden md:block border-b border-gray-200">
      <nav class="flex space-x-8" aria-label="Subcategories">
        <button
          v-for="tab in tabs"
          :key="tab._id"
          @click="$emit('select', tab)"
          class="relative py-4 px-1 font-medium text-sm transition-all duration-200"
          :class="getTabClass(tab)"
        >
          <span>{{ tab.name }}</span>
          <span v-if="tab.productCount" class="ml-1 text-xs opacity-75">
            ({{ tab.productCount }})
          </span>

          <!-- Active indicator -->
          <span
            v-if="isActive(tab)"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"
          ></span>
        </button>
      </nav>
    </div>

    <!-- Mobile Horizontal Scroll -->
    <div
      class="md:hidden overflow-x-auto scrollbar-hide border-b border-gray-200"
    >
      <nav class="flex space-x-4 px-4" aria-label="Subcategories">
        <button
          v-for="tab in tabs"
          :key="tab._id"
          @click="$emit('select', tab)"
          class="flex-shrink-0 py-3 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all"
          :class="getMobileTabClass(tab)"
        >
          {{ tab.name }}
          <span v-if="tab.productCount" class="ml-1 text-xs opacity-75">
            ({{ tab.productCount }})
          </span>
        </button>
      </nav>
    </div>

    <!-- Child Categories (if current tab has children) -->
    <div
      v-if="activeTab && activeTab.children && activeTab.children.length > 0"
      class="bg-gray-50 py-3 border-b border-gray-200"
    >
      <div class="container mx-auto px-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="child in activeTab.children"
            :key="child._id"
            @click="$emit('selectChild', child)"
            class="px-3 py-1.5 text-sm rounded-full border transition-all"
            :class="
              isChildActive(child)
                ? 'bg-pink-600 text-white border-pink-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-pink-600 hover:text-pink-600'
            "
          >
            {{ child.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  activeSlug: {
    type: String,
    default: null,
  },
  activeTab: {
    type: Object,
    default: null,
  },
});

defineEmits(["select", "selectChild"]);

const isActive = (tab) => {
  return props.activeSlug === tab.slug || props.activeTab?._id === tab._id;
};

const isChildActive = (child) => {
  return props.activeSlug === child.slug;
};

const getTabClass = (tab) => {
  if (isActive(tab)) {
    return "text-pink-600 border-b-2 border-pink-600";
  }
  return "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300";
};

const getMobileTabClass = (tab) => {
  if (isActive(tab)) {
    return "bg-pink-600 text-white";
  }
  return "bg-gray-100 text-gray-700 active:bg-gray-200";
};
</script>

<style scoped>
/* Hide scrollbar for mobile horizontal scroll */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Smooth tab transitions */
.subcategory-tabs button {
  transition: all 0.2s ease;
}
</style>
