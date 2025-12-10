<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="$emit('close')"
  >
    <div
      class="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white rounded-xl shadow-2xl dark:bg-gray-800"
    >
      <!-- Header -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b dark:bg-gray-800 dark:border-gray-700"
      >
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Manage Products - {{ program?.title }}
          </h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Select products to include in this sale program
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="flex h-[calc(90vh-120px)]">
        <!-- Available Products -->
        <div class="flex-1 p-6 overflow-y-auto border-r dark:border-gray-700">
          <div class="mb-4">
            <h3
              class="mb-3 text-lg font-semibold text-gray-900 dark:text-white"
            >
              Available Products
            </h3>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div v-if="loading" class="py-10 text-center">
            <div
              class="inline-block w-8 h-8 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"
            ></div>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="product in filteredAvailableProducts"
              :key="product._id"
              @click="addProduct(product)"
              class="flex items-center gap-3 p-3 transition-colors border border-gray-200 rounded-lg cursor-pointer dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              <img
                :src="product.images?.[0] || '/placeholder.png'"
                :alt="product.name"
                class="object-cover w-12 h-12 rounded-lg"
              />
              <div class="flex-1">
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ product.name }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  ${{ product.price }}
                </p>
              </div>
              <svg
                class="w-5 h-5 text-gray-400"
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
            </div>

            <div
              v-if="!filteredAvailableProducts.length"
              class="py-10 text-center text-gray-500 dark:text-gray-400"
            >
              No products available
            </div>
          </div>
        </div>

        <!-- Selected Products -->
        <div class="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div class="mb-4">
            <h3
              class="mb-3 text-lg font-semibold text-gray-900 dark:text-white"
            >
              Selected Products ({{ selectedProducts.length }})
            </h3>
          </div>

          <div class="space-y-2">
            <div
              v-for="product in selectedProducts"
              :key="product._id"
              class="flex items-center gap-3 p-3 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <img
                :src="product.images?.[0] || '/placeholder.png'"
                :alt="product.name"
                class="object-cover w-12 h-12 rounded-lg"
              />
              <div class="flex-1">
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ product.name }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  ${{ product.price }}
                </p>
              </div>
              <button
                @click="removeProduct(product)"
                class="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div
              v-if="!selectedProducts.length"
              class="py-10 text-center text-gray-500 dark:text-gray-400"
            >
              No products selected yet
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div
        class="sticky bottom-0 flex items-center justify-between p-6 bg-white border-t dark:bg-gray-800 dark:border-gray-700"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ selectedProducts.length }} product(s) selected
        </p>
        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            class="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="saveProducts"
            :disabled="saving"
            class="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ saving ? "Saving..." : "Save Products" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSaleProgramStore } from "../../../store/saleProgram.store";
import { getAllProductsApi } from "../../../service/product.service";

const props = defineProps({
  program: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "updated"]);

const saleProgramStore = useSaleProgramStore();
const allProducts = ref([]);
const selectedProducts = ref([]);
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref("");

const filteredAvailableProducts = computed(() => {
  const selectedIds = new Set(selectedProducts.value.map((p) => p._id));

  return allProducts.value
    .filter((p) => !selectedIds.has(p._id))
    .filter((p) => {
      if (!searchQuery.value) return true;
      return p.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    });
});

const addProduct = (product) => {
  if (!selectedProducts.value.find((p) => p._id === product._id)) {
    selectedProducts.value.push(product);
  }
};

const removeProduct = (product) => {
  selectedProducts.value = selectedProducts.value.filter(
    (p) => p._id !== product._id
  );
};

const saveProducts = async () => {
  try {
    saving.value = true;
    const productIds = selectedProducts.value.map((p) => p._id);

    await saleProgramStore.syncProducts(props.program._id, { productIds });

    emit("updated");
    emit("close");
  } catch (error) {
    console.error("Error saving products:", error);
    alert("Failed to save products");
  } finally {
    saving.value = false;
  }
};

const fetchProducts = async () => {
  try {
    loading.value = true;
    const response = await getAllProductsApi();

    if (response.data.success) {
      allProducts.value = response.data.products || [];

      // Pre-select products that are already in the program
      if (props.program.conditions?.applicableProducts?.length) {
        selectedProducts.value = allProducts.value.filter((p) =>
          props.program.conditions.applicableProducts.includes(p._id)
        );
      }
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProducts();
});
</script>
