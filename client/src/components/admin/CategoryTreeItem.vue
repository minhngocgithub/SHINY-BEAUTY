<template>
  <div class="category-tree-item">
    <div
      class="flex items-center gap-3 p-4 transition-all border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
      :class="[
        getLevelClass(level),
        category.isActive ? 'border-slate-200 dark:border-slate-700' : 'border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-900/10'
      ]"
      :style="{ marginLeft: `${level * 24}px` }"
    >
      <!-- Toggle Button -->
      <button
        v-if="category.children && category.children.length > 0"
        @click="$emit('toggle', category._id)"
        class="p-1 transition-transform rounded hover:bg-slate-200 dark:hover:bg-slate-600"
      >
        <svg
          class="w-4 h-4 transition-transform"
          :class="{ 'rotate-90': expanded.has(category._id) }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div v-else class="w-6"></div>

      <!-- Level Indicator -->
      <div class="flex items-center justify-center w-8 h-8 text-sm font-bold rounded-lg" :class="getLevelBadgeClass(level)">
        L{{ level }}
      </div>

      <!-- Icon -->
      <div v-if="category.icon" class="text-2xl">{{ category.icon }}</div>

      <!-- Category Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="text-base font-semibold truncate text-slate-900 dark:text-white">
            {{ category.name }}
          </h3>
          <span
            v-if="!category.isActive"
            class="px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full dark:bg-red-900/30 dark:text-red-400"
          >
            Inactive
          </span>
          <span
            v-if="!category.showInMenu"
            class="px-2 py-0.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-full dark:bg-orange-900/30 dark:text-orange-400"
          >
            Hidden
          </span>
        </div>
        <div class="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
          <span>{{ category.slug }}</span>
          <span v-if="category.productCount">{{ category.productCount }} products</span>
          <span v-if="category.children && category.children.length > 0">{{ category.children.length }} subcategories</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <button
          v-if="level < 2"
          @click="$emit('add-child', category)"
          class="p-2 text-green-600 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30"
          title="Add subcategory"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <button
          @click="$emit('toggle-status', category)"
          class="p-2 transition-colors rounded-lg"
          :class="category.isActive ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'"
          :title="category.isActive ? 'Deactivate' : 'Activate'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="category.isActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button
          @click="$emit('edit', category)"
          class="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
          title="Edit"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button
          @click="$emit('delete', category._id)"
          class="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
          title="Delete"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Children -->
    <div v-if="expanded.has(category._id) && category.children && category.children.length > 0" class="mt-2 space-y-2">
      <CategoryTreeItem
        v-for="child in category.children"
        :key="child._id"
        :category="child"
        :level="level + 1"
        :expanded="expanded"
        @toggle="$emit('toggle', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @add-child="$emit('add-child', $event)"
        @toggle-status="$emit('toggle-status', $event)"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  category: { type: Object, required: true },
  level: { type: Number, required: true },
  expanded: { type: Set, required: true }
});

defineEmits(['toggle', 'edit', 'delete', 'add-child', 'toggle-status']);

const getLevelClass = (level) => {
  const classes = {
    0: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    1: 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    2: 'bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20'
  };
  return classes[level] || 'bg-gray-50 dark:bg-gray-800';
};

const getLevelBadgeClass = (level) => {
  const classes = {
    0: 'bg-blue-600 text-white',
    1: 'bg-purple-600 text-white',
    2: 'bg-pink-600 text-white'
  };
  return classes[level] || 'bg-gray-600 text-white';
};
</script>

<style scoped>
.category-tree-item {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
