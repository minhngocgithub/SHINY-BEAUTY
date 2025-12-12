<template>
  <div class="h-screen p-6 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Categories Management
        </h1>
        <p class="mt-2 text-slate-600 dark:text-slate-400">
          Organize your catalog with 3-level hierarchy (Level 0 → Level 1 → Level 2)
        </p>
      </div>
      <button
        @click="openCreateModal(null)"
        class="flex items-center gap-2 px-6 py-3 text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 hover:scale-105"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Root Category
      </button>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
      <div class="p-6 bg-white shadow-lg rounded-2xl dark:bg-slate-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-600 dark:text-slate-400">Total Categories</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-white">{{ totalCount }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-xl dark:bg-blue-900/30">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white shadow-lg rounded-2xl dark:bg-slate-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-600 dark:text-slate-400">Level 0 (Root)</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-white">{{ levelCounts[0] || 0 }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-xl dark:bg-green-900/30">
            <span class="text-2xl">🌳</span>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white shadow-lg rounded-2xl dark:bg-slate-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-600 dark:text-slate-400">Level 1</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-white">{{ levelCounts[1] || 0 }}</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-xl dark:bg-purple-900/30">
            <span class="text-2xl">🌿</span>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white shadow-lg rounded-2xl dark:bg-slate-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-600 dark:text-slate-400">Level 2</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-white">{{ levelCounts[2] || 0 }}</p>
          </div>
          <div class="p-3 bg-pink-100 rounded-xl dark:bg-pink-900/30">
            <span class="text-2xl">🍀</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"
      ></div>
    </div>

    <!-- Tree View -->
    <div v-else class="p-6 bg-white shadow-lg rounded-2xl dark:bg-slate-800">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Category Tree</h2>
        <div class="flex gap-2">
          <button @click="expandAll" class="px-4 py-2 text-sm text-blue-600 transition-colors border border-blue-600 rounded-lg hover:bg-blue-50">
            Expand All
          </button>
          <button @click="collapseAll" class="px-4 py-2 text-sm text-slate-600 transition-colors border border-slate-300 rounded-lg hover:bg-slate-50">
            Collapse All
          </button>
        </div>
      </div>

      <div v-if="treeCategories.length === 0" class="py-12 text-center">
        <svg class="w-16 h-16 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <p class="mt-4 text-lg text-slate-600 dark:text-slate-400">No categories yet</p>
        <button @click="openCreateModal(null)" class="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          Create First Category
        </button>
      </div>

      <div v-else class="space-y-2">
        <CategoryTreeItem
          v-for="category in treeCategories"
          :key="category._id"
          :category="category"
          :level="0"
          :expanded="expandedCategories"
          @toggle="toggleCategory"
          @edit="editCategory"
          @delete="deleteCategory"
          @add-child="openCreateModal"
          @toggle-status="toggleCategoryStatus"
        />
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      >
        <div
          class="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl dark:bg-slate-800 max-h-[90vh] overflow-y-auto"
        >
          <h3 class="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
            {{ editingCategory ? "Edit Category" : "Create Category" }}
          </h3>

          <!-- Parent Info -->
          <div v-if="parentCategory" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p class="text-sm text-slate-600 dark:text-slate-400">
              Creating subcategory under: <span class="font-semibold text-blue-600 dark:text-blue-400">{{ parentCategory.name }}</span>
            </p>
          </div>

          <div class="space-y-4">
            <!-- Name -->
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Electronics"
              />
            </div>

            <!-- Slug -->
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Slug <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.slug"
                type="text"
                class="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., electronics"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Category description..."
              ></textarea>
            </div>

            <!-- SEO Fields -->
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  SEO Title
                </label>
                <input
                  v-model="formData.seoTitle"
                  type="text"
                  class="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO optimized title"
                />
              </div>

              <div>
                <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  SEO Description
                </label>
                <textarea
                  v-model="formData.seoDescription"
                  rows="2"
                  class="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO meta description..."
                ></textarea>
              </div>
            </div>

            <!-- Display Order & Icon -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Display Order
                </label>
                <input
                  v-model.number="formData.displayOrder"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Icon (optional)
                </label>
                <input
                  v-model="formData.icon"
                  type="text"
                  class="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="icon-name"
                />
              </div>
            </div>

            <!-- Checkboxes -->
            <div class="flex gap-6">
              <div class="flex items-center">
                <input
                  v-model="formData.isActive"
                  type="checkbox"
                  class="w-4 h-4 mr-2 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active
                </label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="formData.showInMenu"
                  type="checkbox"
                  class="w-4 h-4 mr-2 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Show in Menu
                </label>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              @click="closeModal" 
              class="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              @click="saveCategory"
              class="px-6 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md"
            >
              {{ editingCategory ? "Update" : "Create" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from '../../service/category.service';
import CategoryTreeItem from '../../components/admin/CategoryTreeItem.vue';

const categories = ref([]);
const loading = ref(false);
const showModal = ref(false);
const editingCategory = ref(null);
const parentCategory = ref(null);
const expandedCategories = ref(new Set());

const formData = ref({
  name: '',
  slug: '',
  description: '',
  displayOrder: 0,
  isActive: true,
  showInMenu: true,
  icon: '',
  seoTitle: '',
  seoDescription: '',
});

// Statistics
const totalCount = computed(() => categories.value.length);
const levelCounts = computed(() => {
  const counts = {};
  categories.value.forEach(cat => {
    counts[cat.level] = (counts[cat.level] || 0) + 1;
  });
  return counts;
});

// Build tree structure
const treeCategories = computed(() => {
  const rootCategories = categories.value
    .filter(cat => cat.level === 0)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const buildChildren = (parentId, level) => {
    return categories.value
      .filter(cat => cat.parent === parentId && cat.level === level)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(cat => ({
        ...cat,
        children: buildChildren(cat._id, level + 1)
      }));
  };

  return rootCategories.map(cat => ({
    ...cat,
    children: buildChildren(cat._id, 1)
  }));
});

const fetchCategories = async () => {
  loading.value = true;
  try {
    const response = await getCategoriesApi();
    if (response.data.success) {
      categories.value = response.data.data || [];
    }
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    alert('Failed to load categories');
  } finally {
    loading.value = false;
  }
};

const openCreateModal = (parent) => {
  editingCategory.value = null;
  parentCategory.value = parent;
  formData.value = {
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
    isActive: true,
    showInMenu: true,
    icon: '',
    seoTitle: '',
    seoDescription: '',
  };
  showModal.value = true;
};

const editCategory = (category) => {
  editingCategory.value = category;
  parentCategory.value = category.parent 
    ? categories.value.find(c => c._id === category.parent)
    : null;
  formData.value = {
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    displayOrder: category.displayOrder || 0,
    isActive: category.isActive !== false,
    showInMenu: category.showInMenu !== false,
    icon: category.icon || '',
    seoTitle: category.seoTitle || '',
    seoDescription: category.seoDescription || '',
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingCategory.value = null;
  parentCategory.value = null;
};

const saveCategory = async () => {
  try {
    const data = { ...formData.value };
    if (parentCategory.value) {
      data.parent = parentCategory.value._id;
    }

    if (editingCategory.value) {
      await updateCategoryApi(editingCategory.value._id, data);
    } else {
      await createCategoryApi(data);
    }
    
    await fetchCategories();
    closeModal();
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to save category');
  }
};

const toggleCategoryStatus = async (category) => {
  try {
    await updateCategoryApi(category._id, { isActive: !category.isActive });
    category.isActive = !category.isActive;
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update category');
  }
};

const deleteCategory = async (id) => {
  if (!confirm('Delete this category? All subcategories will also be deleted.')) return;
  try {
    await deleteCategoryApi(id);
    await fetchCategories();
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete category');
  }
};

const toggleCategory = (categoryId) => {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId);
  } else {
    expandedCategories.value.add(categoryId);
  }
};

const expandAll = () => {
  categories.value.forEach(cat => expandedCategories.value.add(cat._id));
};

const collapseAll = () => {
  expandedCategories.value.clear();
};

onMounted(() => {
  fetchCategories();
});
</script>
