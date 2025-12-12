<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl"
    >
      <!-- Header -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-700"
      >
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
          {{ isEdit ? "Edit Bundle" : "Create New Bundle" }}
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 transition-colors rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
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

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Basic Info -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            Basic Information
          </h3>

          <!-- Name -->
          <div>
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Bundle Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="Enter bundle name"
            />
          </div>

          <!-- Description -->
          <div>
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
              placeholder="Enter bundle description"
            ></textarea>
          </div>

          <!-- Image Upload -->
          <div>
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Bundle Image
            </label>
            <div class="flex items-center gap-4">
              <div
                v-if="imagePreview"
                class="relative w-24 h-24 border rounded-lg border-slate-300 dark:border-slate-600"
              >
                <img
                  :src="imagePreview"
                  alt="Preview"
                  class="object-cover w-full h-full rounded-lg"
                />
                <button
                  @click="removeImage"
                  type="button"
                  class="absolute top-0 right-0 p-1 text-white transition-colors bg-red-500 rounded-tr-lg rounded-bl-lg hover:bg-red-600"
                >
                  <svg
                    class="w-4 h-4"
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
              <label
                class="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700"
              >
                <input
                  @change="handleImageUpload"
                  type="file"
                  accept="image/*"
                  class="hidden"
                />
                {{ imagePreview ? "Change Image" : "Upload Image" }}
              </label>
            </div>
          </div>
        </div>

        <!-- Products Selection -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
              Products <span class="text-red-500">*</span>
            </h3>
            <button
              @click="showProductSelector = true"
              type="button"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <svg
                class="w-4 h-4"
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
              Add Products
            </button>
          </div>

          <!-- Selected Products -->
          <div
            v-if="form.items.length === 0"
            class="p-8 text-center border-2 border-dashed rounded-lg border-slate-300 dark:border-slate-600"
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
              No products selected
            </p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(item, index) in form.items"
              :key="index"
              class="flex items-center gap-4 p-4 border rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50"
            >
              <div
                class="flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-100 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <img
                  v-if="getProductImage(item.product)"
                  :src="getProductImage(item.product)"
                  :alt="item.product.name"
                  class="object-cover w-full h-full"
                />
                <div
                  v-else
                  class="flex items-center justify-center w-full h-full bg-slate-200 dark:bg-slate-600"
                >
                  <svg
                    class="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <p
                  class="font-semibold text-slate-900 dark:text-white line-clamp-1"
                >
                  {{ getProductName(item.product) }}
                </p>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                  ${{ getProductPrice(item.product) }} × {{ item.quantity }}
                </p>
                <p
                  v-if="!item.product || typeof item.product === 'string'"
                  class="text-xs text-red-500 mt-1"
                >
                  ⚠️ Product data not loaded (ID: {{ item.product }})
                </p>
              </div>
              <input
                v-model.number="item.quantity"
                type="number"
                min="1"
                @input="updatePricing"
                class="w-20 px-3 py-2 text-center bg-white border rounded-lg outline-none border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <button
                @click="removeProduct(index)"
                type="button"
                class="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Pricing -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            Pricing
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <!-- Original Price (calculated) -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Original Price (Auto)
              </label>
              <div
                class="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                ${{ originalPrice.toFixed(2) }}
              </div>
            </div>

            <!-- Discount Percentage -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Discount % <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="form.discountPercentage"
                @input="updateBundlePrice"
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="0.00"
              />
            </div>

            <!-- Bundle Price (calculated) -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Bundle Price (Auto)
              </label>
              <div
                class="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700"
              >
                <span
                  class="text-lg font-bold text-green-600 dark:text-green-400"
                >
                  ${{ form.bundlePrice.toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- Savings -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Customer Saves
              </label>
              <div
                class="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-green-50 dark:bg-green-900/20"
              >
                <span class="font-bold text-green-600 dark:text-green-400">
                  ${{ (originalPrice - form.bundlePrice).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="flex items-center gap-3">
          <input
            v-model="form.isActive"
            type="checkbox"
            id="isActive"
            class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            for="isActive"
            class="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Active (Bundle visible to customers)
          </label>
        </div>

        <!-- Actions -->
        <div
          class="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700"
        >
          <button
            @click="$emit('close')"
            type="button"
            class="px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving || form.items.length === 0"
            class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              v-if="saving"
              class="w-4 h-4 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{
              saving ? "Saving..." : isEdit ? "Update Bundle" : "Create Bundle"
            }}
          </button>
        </div>
      </form>
    </div>

    <!-- Product Selector Modal -->
    <ProductSelectorModal
      v-if="showProductSelector"
      :selectedProducts="form.items.map((i) => i.product._id)"
      @close="showProductSelector = false"
      @select="handleProductsSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  createBundleApi,
  updateBundleApi,
  uploadBundleImageApi,
} from "../../../service/bundle.service";
import ProductSelectorModal from "./ProductSelectorModal.vue";

const props = defineProps({
  bundle: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "save"]);

const isEdit = computed(() => !!props.bundle);

const form = ref({
  name: "",
  description: "",
  items: [],
  bundlePrice: 0,
  originalPrice: 0,
  discountPercentage: 0,
  isActive: true,
  image: null,
});

const imagePreview = ref(null);
const imageFile = ref(null);
const saving = ref(false);
const showProductSelector = ref(false);

const originalPrice = computed(() => {
  return form.value.items.reduce((sum, item) => {
    const product = item.product;
    const price =
      typeof product === "object" && product !== null
        ? product.currentPrice || product.price || 0
        : 0;
    return sum + price * item.quantity;
  }, 0);
});

watch(
  () => props.bundle,
  (newBundle) => {
    if (!newBundle) return;

    // Debug logging
    console.log("BundleModal received bundle:", newBundle);
    console.log("Bundle items:", newBundle.items);
    if (newBundle.items && newBundle.items.length > 0) {
      console.log("First item product:", newBundle.items[0].product);
      console.log(
        "Is product an object?",
        typeof newBundle.items[0].product === "object"
      );
    }

    form.value = {
      name: newBundle.name || "",
      description: newBundle.description || "",
      items: (newBundle.items || []).map((item) => ({
        product: item.product,
        quantity: item.quantity || 1,
      })),
      bundlePrice: newBundle.bundlePrice || 0,
      originalPrice: newBundle.originalPrice || 0,
      discountPercentage: newBundle.discountPercentage || 0,
      isActive: newBundle.isActive ?? true,
      image: newBundle.image || null,
    };

    if (newBundle.image) {
      if (Array.isArray(newBundle.image) && newBundle.image.length > 0) {
        imagePreview.value = newBundle.image[0].url;
      } else if (typeof newBundle.image === "string") {
        imagePreview.value = newBundle.image;
      } else if (newBundle.image?.url) {
        imagePreview.value = newBundle.image.url;
      }
    }
  },
  { immediate: true }
);

const updatePricing = () => {
  form.value.originalPrice = originalPrice.value;
  updateBundlePrice();
};

const updateBundlePrice = () => {
  const discount = form.value.discountPercentage || 0;

  // Ensure discount is within valid range
  if (discount < 0) {
    form.value.discountPercentage = 0;
  } else if (discount > 100) {
    form.value.discountPercentage = 100;
  }

  const validDiscount = Math.max(0, Math.min(100, discount));
  form.value.bundlePrice = Number(
    (originalPrice.value * (1 - validDiscount / 100)).toFixed(2)
  );
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  imageFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => (imagePreview.value = e.target.result);
  reader.readAsDataURL(file);
};

const removeImage = () => {
  imagePreview.value = null;
  imageFile.value = null;
  form.value.image = null;
};

const handleProductsSelected = (products) => {
  console.log("📦 Products selected:", products);

  products.forEach((product) => {
    // Get product ID safely whether it's an object or string
    const productId = typeof product === "object" ? product._id : product;

    const exists = form.value.items.find((i) => {
      const existingId =
        typeof i.product === "object" ? i.product._id : i.product;
      return existingId === productId;
    });

    if (!exists) {
      form.value.items.push({ product, quantity: 1 });
      console.log("✅ Added product:", product.name || product);
    } else {
      console.log("⚠️ Product already exists:", product.name || product);
    }
  });

  console.log("📋 Total items after selection:", form.value.items.length);
  updatePricing();
  showProductSelector.value = false;
};

const removeProduct = (index) => {
  form.value.items.splice(index, 1);
  updatePricing();
};

const getProductImage = (product) => {
  if (!product || typeof product === "string") return null;

  // Try image array first (standard field)
  if (
    product.image &&
    Array.isArray(product.image) &&
    product.image.length > 0
  ) {
    return product.image[0].url || product.image[0];
  }

  // Try images array (alternative field)
  if (
    product.images &&
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    return product.images[0].url || product.images[0];
  }

  // Try image as object or string
  if (product.image?.url) return product.image.url;
  if (typeof product.image === "string") return product.image;

  return null;
};

const getProductName = (product) => {
  if (!product || typeof product === "string") return "Product (Not Loaded)";
  return product.name || "Unnamed Product";
};

const getProductPrice = (product) => {
  if (!product || typeof product === "string") return "0.00";
  const price = product.currentPrice || product.price || 0;
  return typeof price === "number" ? price.toFixed(2) : "0.00";
};

const handleSubmit = async () => {
  if (form.value.items.length === 0) {
    alert("Please select at least one product");
    return;
  }

  // Validate pricing
  if (form.value.bundlePrice > originalPrice.value) {
    alert("Bundle price cannot be greater than original price");
    return;
  }

  if (
    form.value.discountPercentage < 0 ||
    form.value.discountPercentage > 100
  ) {
    alert("Discount percentage must be between 0% and 100%");
    return;
  }

  let bundleData = null;

  try {
    saving.value = true;

    // Upload image nếu có file mới
    let imageData = form.value.image;

    if (imageFile.value) {
      const formData = new FormData();
      formData.append("image", imageFile.value);

      const uploadResponse = await uploadBundleImageApi(formData);

      if (uploadResponse.data.success) {
        imageData = [uploadResponse.data.image]; // backend trả object → convert sang array
      }
    } else if (imagePreview.value && !form.value.image) {
      imageData = [{ url: imagePreview.value, public_id: null }];
    }

    bundleData = {
      name: form.value.name,
      description: form.value.description,
      items: form.value.items.map((i) => ({
        product: typeof i.product === "string" ? i.product : i.product._id,
        quantity: i.quantity,
      })),
      bundlePrice: Number(form.value.bundlePrice.toFixed(2)),
      originalPrice: Number(originalPrice.value.toFixed(2)),
      discountPercentage: Number(form.value.discountPercentage.toFixed(2)),
      isActive: form.value.isActive,
      image: imageData,
    };

    console.log("📦 Bundle Data to Submit:", bundleData);
    console.log("💰 Pricing Details:", {
      originalPrice: bundleData.originalPrice,
      bundlePrice: bundleData.bundlePrice,
      discountPercentage: bundleData.discountPercentage,
      isValid: bundleData.bundlePrice <= bundleData.originalPrice,
    });

    // SAVE
    if (isEdit.value) {
      await updateBundleApi(props.bundle._id, bundleData);
    } else {
      await createBundleApi(bundleData);
    }

    emit("save");
  } catch (error) {
    console.error("Bundle save error:", error);

    const inactive = error.response?.data?.inactiveProducts;
    if (inactive?.length > 0) {
      const names = inactive.map((p) => p.name).join("\n- ");

      const confirmActivate = confirm(
        `The following products are unavailable:\n\n- ${names}\n\nActivate now?`
      );

      if (confirmActivate) {
        try {
          const { toggleAvailabilityApi } = await import(
            "../../../service/product.service.js"
          );

          for (const p of inactive) {
            try {
              await toggleAvailabilityApi(p.id);
            } catch (err) {
              console.error("Activation failed:", err);
            }
          }

          alert("Products activated. Retrying save...");

          if (isEdit.value) {
            await updateBundleApi(props.bundle._id, bundleData);
          } else {
            await createBundleApi(bundleData);
          }

          emit("save");
          return;
        } catch (err) {
          alert("Failed to activate products. Please try manually.");
        }
      }
    }

    alert(
      error.response?.data?.message || error.message || "Failed to save bundle"
    );
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (props.bundle) updatePricing();
});
</script>
