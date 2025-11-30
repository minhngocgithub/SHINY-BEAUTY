<template>
  <div class="h-screen p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
          Categories Management
        </h1>
        <p class="mt-1 text-slate-600 dark:text-slate-400">
          Organize your product catalog
        </p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Category
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"
      ></div>
    </div>

    <!-- Categories Grid -->
    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="category in categories"
        :key="category._id"
        class="overflow-hidden bg-white rounded-lg shadow dark:bg-slate-800"
      >
        <!-- Category Image -->
        <div v-if="category.image" class="h-48 overflow-hidden">
          <img
            :src="category.image"
            :alt="category.name"
            class="object-cover w-full h-full"
          />
        </div>
        <div
          v-else
          class="h-48 bg-gradient-to-br from-blue-500 to-purple-600"
        ></div>

        <!-- Category Info -->
        <div class="p-6">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">
                {{ category.name }}
              </h3>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {{ category.slug }}
              </p>
            </div>
            <span
              :class="
                category.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              "
              class="px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ category.isActive ? "Active" : "Inactive" }}
            </span>
          </div>

          <p
            class="mb-4 text-sm text-slate-600 dark:text-slate-400 line-clamp-2"
          >
            {{ category.description || "Chưa có mô tả" }}
          </p>

          <div
            class="flex items-center justify-between mb-4 text-sm text-slate-500"
          >
            <span>{{ category.productCount || 0 }} products</span>
            <span>{{ category.subCategories?.length || 0 }} subcategories</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              @click="editCategory(category)"
              class="flex-1 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              @click="toggleCategoryStatus(category)"
              class="px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {{ category.isActive ? "Deactivate" : "Activate" }}
            </button>
            <button
              @click="deleteCategory(category._id)"
              class="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="categories.length === 0"
        class="py-12 text-center col-span-full"
      >
        <svg
          class="w-12 h-12 mx-auto text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <p class="mt-4 text-slate-600 dark:text-slate-400">No categories yet</p>
        <button
          @click="showCreateModal = true"
          class="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Create First Category
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingCategory"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div
        class="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-slate-800"
      >
        <h3 class="mb-4 text-xl font-bold text-slate-900 dark:text-white">
          {{ editingCategory ? "Edit Category" : "Create Category" }}
        </h3>

        <div class="space-y-4">
          <div>
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
              >Name</label
            >
            <input
              v-model="formData.name"
              type="text"
              class="w-full px-4 py-2 bg-white border rounded-lg dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
              >Description</label
            >
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full px-4 py-2 bg-white border rounded-lg dark:bg-slate-700 text-slate-900 dark:text-white"
            ></textarea>
          </div>

          <div class="flex items-center">
            <input
              v-model="formData.isActive"
              type="checkbox"
              class="mr-2 rounded border-slate-300"
            />
            <label class="text-sm text-slate-700 dark:text-slate-300"
              >Active</label
            >
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="closeModal" class="px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            @click="saveCategory"
            class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {{ editingCategory ? "Update" : "Create" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "../../service/category.service";

// Reactive state
const categories = ref([]);
const loading = ref(false);
const showCreateModal = ref(false);
const editingCategory = ref(null);
const formData = ref({
  name: "",
  description: "",
  isActive: true,
});

// Methods
const fetchCategories = async () => {
  loading.value = true;
  try {
    const response = await getCategoriesApi();
    console.log("Categories response:", response.data);

    if (response.data.success) {
      categories.value = response.data.data || [];
    } else {
      categories.value = [];
    }
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    categories.value = [];
  } finally {
    loading.value = false;
  }
};

const editCategory = (category) => {
  editingCategory.value = category;
  formData.value = {
    name: category.name,
    description: category.description || "",
    isActive: category.isActive !== false,
  };
};

const closeModal = () => {
  showCreateModal.value = false;
  editingCategory.value = null;
  formData.value = { name: "", description: "", isActive: true };
};

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      await updateCategoryApi(editingCategory.value._id, formData.value);
    } else {
      await createCategoryApi(formData.value);
    }
    await fetchCategories();
    closeModal();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to save category");
  }
};

const toggleCategoryStatus = async (category) => {
  try {
    await updateCategoryApi(category._id, { isActive: !category.isActive });
    category.isActive = !category.isActive;
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update category");
  }
};

const deleteCategory = async (id) => {
  if (!confirm("Delete this category? Products will be uncategorized.")) return;
  try {
    await deleteCategoryApi(id);
    await fetchCategories();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete category");
  }
};

// Lifecycle
onMounted(() => {
  fetchCategories();
});
</script>
