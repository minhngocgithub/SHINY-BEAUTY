<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-50"
  >
    <div
      class="w-full max-w-4xl my-8 bg-white rounded-lg shadow-xl dark:bg-slate-800"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700"
      >
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
          {{ product ? "Edit Product" : "Add New Product" }}
        </h2>
        <button
          @click="$emit('close')"
          class="dark:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
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
      <form
        @submit.prevent="handleSubmit"
        class="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
      >
        <!-- Basic Information -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="md:col-span-2">
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Product Name *
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Category *
            </label>
            <select
              v-model="formData.category"
              required
              class="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">Select Category</option>
              <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div>
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Brand *
            </label>
            <input
              v-model="formData.brand"
              type="text"
              required
              class="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Enter brand name"
            />
          </div>

          <div>
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Price ($) *
            </label>
            <input
              v-model.number="formData.price"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="0.00"
            />
          </div>

          <div>
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Stock Quantity *
            </label>
            <input
              v-model.number="formData.countInstock"
              type="number"
              required
              min="0"
              class="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="0"
            />
          </div>

          <div class="md:col-span-2">
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Description *
            </label>
            <textarea
              v-model="formData.description"
              rows="4"
              required
              class="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Enter product description"
            ></textarea>
          </div>
        </div>

        <!-- Images Upload -->
        <div>
          <label
            class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Product Images
          </label>
          <div
            class="p-4 border-2 border-dashed rounded-lg border-slate-300 dark:border-slate-600"
          >
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*"
              @change="handleFileSelect"
              class="hidden"
            />

            <button
              type="button"
              @click="$refs.fileInput.click()"
              class="w-full px-4 py-3 transition-colors rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
            >
              📷 Click to upload images (max 5)
            </button>

            <!-- Image Previews -->
            <div
              v-if="imagePreviews.length > 0"
              class="grid grid-cols-5 gap-2 mt-4"
            >
              <div
                v-for="(preview, index) in imagePreviews"
                :key="index"
                class="relative group"
              >
                <img
                  :src="preview.url"
                  class="object-cover w-full h-20 rounded"
                  alt="Preview"
                />
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="absolute p-1 text-white transition-opacity bg-red-600 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
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
                <div
                  v-if="preview.isMain"
                  class="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded"
                >
                  Main
                </div>
                <button
                  v-else
                  type="button"
                  @click="setMainImage(index)"
                  class="absolute bottom-1 left-1 bg-slate-800 bg-opacity-75 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Set Main
                </button>
              </div>
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            Upload up to 5 images. First image will be main product image.
          </p>
        </div>

        <!-- Additional Settings -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Product Status
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div
              class="flex items-center p-3 border rounded-lg border-slate-200 dark:border-slate-700"
            >
              <input
                v-model="formData.isAvailable"
                type="checkbox"
                id="isAvailable"
                class="mr-2 rounded border-slate-300"
              />
              <label
                for="isAvailable"
                class="text-sm cursor-pointer text-slate-700 dark:text-slate-300"
              >
                Available for sale
              </label>
            </div>

            <div
              class="flex items-center p-3 border rounded-lg border-slate-200 dark:border-slate-700"
            >
              <input
                v-model="formData.featured"
                type="checkbox"
                id="featured"
                class="mr-2 rounded border-slate-300"
              />
              <label
                for="featured"
                class="text-sm cursor-pointer text-slate-700 dark:text-slate-300"
              >
                ⭐ Featured
              </label>
            </div>

            <div
              class="flex items-center p-3 border rounded-lg border-slate-200 dark:border-slate-700"
            >
              <input
                v-model="formData.isBestSeller"
                type="checkbox"
                id="isBestSeller"
                class="mr-2 rounded border-slate-300"
              />
              <label
                for="isBestSeller"
                class="text-sm cursor-pointer text-slate-700 dark:text-slate-300"
              >
                🔥 Best Seller
              </label>
            </div>

            <div
              class="flex items-center p-3 border rounded-lg border-slate-200 dark:border-slate-700"
            >
              <input
                v-model="formData.isOnSale"
                type="checkbox"
                id="isOnSale"
                class="mr-2 rounded border-slate-300"
              />
              <label
                for="isOnSale"
                class="text-sm cursor-pointer text-slate-700 dark:text-slate-300"
              >
                💰 On Sale
              </label>
            </div>

            <div
              class="flex items-center p-3 border rounded-lg border-slate-200 dark:border-slate-700"
            >
              <input
                v-model="formData.isNewProduct"
                type="checkbox"
                id="isNewProduct"
                class="mr-2 rounded border-slate-300"
              />
              <label
                for="isNewProduct"
                class="text-sm cursor-pointer text-slate-700 dark:text-slate-300"
              >
                🆕 New Product
              </label>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800"
        >
          <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
        </div>

        <!-- Actions -->
        <div
          class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700"
        >
          <button
            type="button"
            @click="$emit('close')"
            class="px-6 py-2 transition-colors border rounded-lg border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{
              saving
                ? "Saving..."
                : product
                ? "Update Product"
                : "Create Product"
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteConfirmAlert,
} from "../../../../utils/sweetAlert";
import {
  createProductApi,
  updateProductApi,
  uploadImagesApi,
  deleteProductImageApi,
} from "../../../service/product.service";

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "save"]);

// Reactive state
const formData = ref({
  name: "",
  category: "",
  brand: "",
  price: 0,
  countInstock: 0,
  description: "",
  isAvailable: true,
  featured: false,
  isBestSeller: false,
  isOnSale: false,
  isNewProduct: false,
  images: [],
});

const fileInput = ref(null);
const selectedFiles = ref([]);
const imagePreviews = ref([]);
const saving = ref(false);
const error = ref(null);

// Methods
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);

  if (files.length + imagePreviews.value.length > 5) {
    error.value = "Maximum 5 images allowed";
    return;
  }

  files.forEach((file) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      error.value = `File ${file.name} is not an image`;
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error.value = `File ${file.name} is too large (max 5MB)`;
      return;
    }

    selectedFiles.value.push(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviews.value.push({
        url: e.target.result,
        file,
        isMain: imagePreviews.value.length === 0,
        existing: false,
      });
    };
    reader.readAsDataURL(file);
  });

  event.target.value = "";
  error.value = null;
};

const removeImage = async (index) => {
  const preview = imagePreviews.value[index];

  // If this is an existing image (persisted in DB), confirm and call API to delete
  if (preview.existing && preview._id && props.product) {
    try {
      const confirmed = await showDeleteConfirmAlert(
        "Delete image",
        "Delete now"
      );
      if (!confirmed) return;

      await deleteProductImageApi(props.product._id, preview._id);
      imagePreviews.value.splice(index, 1);
      await showSuccessAlert("Deleted", "Image has been deleted successfully");
      return;
    } catch (err) {
      console.error("Failed to delete product image:", err);
      await showErrorAlert(
        "Error",
        err.response?.data?.message || err.message || "Cannot delete image"
      );
      return;
    }
  }

  // Remove from selectedFiles if not existing image
  if (!preview.existing && preview.file) {
    const fileIndex = selectedFiles.value.indexOf(preview.file);
    if (fileIndex > -1) {
      selectedFiles.value.splice(fileIndex, 1);
    }
  }

  imagePreviews.value.splice(index, 1);

  // Set new main if removed was main
  if (preview.isMain && imagePreviews.value.length > 0) {
    imagePreviews.value[0].isMain = true;
  }
};

const setMainImage = (index) => {
  imagePreviews.value.forEach((preview, i) => {
    preview.isMain = i === index;
  });
};

const handleSubmit = async () => {
  try {
    saving.value = true;
    error.value = null;

    if (!formData.value.name?.trim()) {
      error.value = "Product name is required";
      return;
    }
    if (!formData.value.brand?.trim()) {
      error.value = "Brand is required";
      return;
    }
    if (!formData.value.description?.trim()) {
      error.value = "Description is required";
      return;
    }
    if (!formData.value.category) {
      error.value = "Category is required";
      return;
    }
    if (!formData.value.price || formData.value.price <= 0) {
      error.value = "Valid price is required";
      return;
    }
    if (
      formData.value.countInstock === undefined ||
      formData.value.countInstock < 0
    ) {
      error.value = "Stock quantity is required";
      return;
    }

    // Upload new images
    let uploadedImages = [];
    if (selectedFiles.value.length > 0) {
      try {
        const uploadResponse = await uploadImagesApi(selectedFiles.value);
        if (uploadResponse.data?.success && uploadResponse.data?.images) {
          uploadedImages = uploadResponse.data.images;
        } else if (uploadResponse.data?.images) {
          uploadedImages = uploadResponse.data.images;
        } else if (Array.isArray(uploadResponse.data)) {
          uploadedImages = uploadResponse.data;
        }
        // Validate uploaded images
        uploadedImages.forEach((img, i) => {
          if (!img.url && !img.secure_url) {
            console.error(`❌ Image ${i + 1} missing URL:`, img);
            throw new Error(`Image ${i + 1} upload incomplete - missing URL`);
          }
        });
      } catch (uploadError) {
        console.error("❌ Image upload failed:", uploadError);
        throw new Error(
          `Failed to upload images: ${
            uploadError.response?.data?.message || uploadError.message
          }`
        );
      }
    }

    // Combine existing and new images
    const existingImages = imagePreviews.value
      .filter((p) => p.existing)
      .map((p) => ({
        url: p.url,
        public_id: p.publicId, // ✅ Backend expects 'public_id' with underscore
        isMain: p.isMain,
      }));

    const newImages = uploadedImages.map((img, index) => {
      const imageUrl = img.url || img.secure_url;
      const imagePublicId = img.publicId || img.public_id || "";

      if (!imageUrl) {
        console.error(`❌ Image ${index + 1} has no URL:`, img);
        throw new Error(`Image ${index + 1} missing URL after upload`);
      }

      return {
        url: imageUrl,
        public_id: imagePublicId, 
        isMain:
          imagePreviews.value[existingImages.length + index]?.isMain || false,
      };
    });

    const allImages = [...existingImages, ...newImages];

    // Ensure at least one main image
    if (allImages.length > 0 && !allImages.some((img) => img.isMain)) {
      allImages[0].isMain = true;
    }

    // Prepare product data
    const productData = {
      name: formData.value.name.trim(),
      category: [formData.value.category], // Backend expects array
      brand: formData.value.brand.trim(),
      price: Number(formData.value.price),
      countInstock: Number(formData.value.countInstock),
      description: formData.value.description.trim(),
      isAvailable: formData.value.isAvailable,
      featured: formData.value.featured,
      isBestSeller: formData.value.isBestSeller,
      isOnSale: formData.value.isOnSale,
      isNewProduct: formData.value.isNewProduct,
      image: allImages, // ✅ Backend expects 'image' not 'images'
    };

    let response;
    if (props.product) {
      response = await updateProductApi(props.product._id, productData);
      await showSuccessAlert("Update Successfully", "Product updated!");
    } else {
      response = await createProductApi(productData);
      await showSuccessAlert(
        "Create New Product Successfully",
        "New Product added!"
      );
    }

    emit("save");
  } catch (err) {
    console.error("Save product error:", err);
    error.value =
      err.response?.data?.message || err.message || "Failed to save product";

    // Show detailed error if available
    if (err.response?.data?.errors) {
      error.value = err.response.data.errors.join(", ");
    }

    await showErrorAlert("Error", error.value);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (props.product) {
    // Extract category ID
    let categoryId = "";
    if (props.product.category) {
      if (Array.isArray(props.product.category)) {
        categoryId =
          props.product.category[0]?._id || props.product.category[0] || "";
      } else {
        categoryId = props.product.category._id || props.product.category || "";
      }
    }

    // Populate form data
    formData.value = {
      name: props.product.name || "",
      category: categoryId,
      brand: props.product.brand || "",
      price: props.product.price || 0,
      countInstock:
        props.product.countInstock || props.product.countInStock || 0,
      description: props.product.description || "",
      isAvailable: props.product.isAvailable !== false,
      featured: props.product.featured || false,
      isBestSeller: props.product.isBestSeller || false,
      isOnSale: props.product.isOnSale || false,
      isNewProduct: props.product.isNewProduct || false,
      images: props.product.images || [],
    };


    // Load existing images
    let rawImages = [];
    if (Array.isArray(props.product.image) && props.product.image.length > 0) {
      rawImages = props.product.image;
      imagePreviews.value = rawImages
        .filter(
          (img) =>
            img.url &&
            typeof img.url === "string" &&
            (img.url.startsWith("http://") || img.url.startsWith("https://"))
        )
        .map((img) => ({
          url: img.url,
          isMain: img.isMain,
          publicId: img.publicId || img.public_id,
          _id: img._id || img.id || null,
          existing: true,
        }));
    } else if (
      Array.isArray(props.product.images) &&
      props.product.images.length > 0
    ) {
      rawImages = props.product.images;
      imagePreviews.value = rawImages
        .filter(
          (img) =>
            typeof img === "string" &&
            !img.includes("placeholder") &&
            (img.startsWith("http://") || img.startsWith("https://"))
        )
        .map((img) => ({
          url: img,
          isMain: false,
          publicId: "",
          existing: true,
        }));
    } else {
      imagePreviews.value = [];
    }
  }
});
</script>