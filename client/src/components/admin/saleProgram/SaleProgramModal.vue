<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="$emit('close')"
  >
    <div
      class="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl dark:bg-gray-800"
    >
      <!-- Header -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b dark:bg-gray-800 dark:border-gray-700"
      >
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ isEdit ? "Edit Sale Program" : "Create Sale Program" }}
          </h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Configure your discount campaign with scheduling and targeting
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

      <!-- Error/Conflict Alert -->
      <div
        v-if="conflictError"
        class="p-4 mx-6 mt-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800"
      >
        <div class="flex items-start gap-3">
          <svg
            class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div class="flex-1">
            <h4 class="font-semibold text-red-800 dark:text-red-200">
              Product Conflict Detected
            </h4>
            <p class="mt-1 text-sm text-red-700 dark:text-red-300">
              {{ conflictError.message }}
            </p>
            <div v-if="conflictError.conflicts" class="mt-2 space-y-2 text-sm">
              <div
                v-for="conflict in conflictError.conflicts"
                :key="conflict.programId"
                class="p-2 bg-white rounded dark:bg-gray-800"
              >
                <p class="font-medium text-red-800 dark:text-red-200">
                  📦 {{ conflict.programTitle }}
                </p>
                <ul class="mt-1 ml-4 text-red-600 list-disc dark:text-red-400">
                  <li
                    v-for="product in conflict.conflictingProducts"
                    :key="product.id"
                  >
                    {{ product.name }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <button
            @click="conflictError = null"
            class="text-red-400 hover:text-red-600"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Basic Information -->
        <section>
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h3>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- Title -->
            <div class="md:col-span-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Program Title <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.title"
                type="text"
                required
                placeholder="e.g., Summer Sale 2024"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <!-- Short Description -->
            <div class="md:col-span-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >Short Description</label
              >
              <input
                v-model="formData.shortDescription"
                type="text"
                placeholder="Brief description for listing"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >Full Description</label
              >
              <textarea
                v-model="formData.description"
                rows="3"
                placeholder="Detailed description with terms and conditions"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              ></textarea>
            </div>

            <!-- Type -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Program Type <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.type"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Type</option>
                <option value="percentage_sale">Percentage Sale</option>
                <option value="fixed_amount_sale">Fixed Amount Sale</option>
                <option value="flash_sale">Flash Sale</option>
                <option value="free_sample">Free Sample</option>
                <option value="points_multiplier">Points Multiplier</option>
                <option value="bundle_offer">Bundle Offer</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
                <option value="spend_x_get_y">Spend X Get Y</option>
                <option value="free_shipping">Free Shipping</option>
                <option value="gift_with_purchase">Gift with Purchase</option>
              </select>
            </div>

            <!-- Status -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >Status</label
              >
              <select
                v-model="formData.status"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <!-- Banner Upload -->
            <div class="md:col-span-2">
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >Banner Image</label
              >
              <div class="flex items-center gap-4">
                <input
                  type="file"
                  @change="handleBannerUpload"
                  accept="image/*"
                  class="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <img
                  v-if="bannerPreview"
                  :src="bannerPreview"
                  class="object-cover w-20 h-20 rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Scheduling -->
        <section class="pt-6 border-t dark:border-gray-700">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Scheduling
          </h3>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Start Date <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.startDate"
                type="datetime-local"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >End Date</label
              >
              <input
                v-model="formData.endDate"
                type="datetime-local"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </section>

        <!-- Product Selection -->
        <section class="pt-6 border-t dark:border-gray-700">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Product Selection
          </h3>

          <!-- Selection Method -->
          <div class="mb-4">
            <label
              class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Selection Method
            </label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="selectionMethod"
                  type="radio"
                  value="auto"
                  class="w-4 h-4 text-indigo-600"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  Auto-populate by Category/Brand
                </span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="selectionMethod"
                  type="radio"
                  value="manual"
                  class="w-4 h-4 text-indigo-600"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  Select Specific Products
                </span>
              </label>
            </div>
          </div>

          <!-- Auto-populate Method -->
          <div v-if="selectionMethod === 'auto'" class="space-y-4">
            <!-- Categories -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Select Categories
                </label>
                <button
                  v-if="formData.conditions.categories?.length > 0"
                  @click="previewCategoryProducts"
                  type="button"
                  class="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400"
                >
                  Preview Products ({{
                    formData.conditions.categories.length
                  }}
                  categories)
                </button>
              </div>
              <div
                v-if="loadingCategories"
                class="text-sm text-gray-500 dark:text-gray-400"
              >
                Loading categories...
              </div>
              <div
                v-else-if="categories.length === 0"
                class="text-sm text-gray-500 dark:text-gray-400"
              >
                No categories found
              </div>
              <div
                v-else
                class="p-2 space-y-2 overflow-y-auto border border-gray-200 rounded-lg max-h-40 dark:border-gray-700"
              >
                <label
                  v-for="category in categories"
                  :key="category._id"
                  class="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    v-model="formData.conditions.categories"
                    :value="category._id"
                    type="checkbox"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    {{ category.name }}
                  </span>
                </label>
              </div>
            </div>

            <!-- Preview Products Section -->
            <div
              v-if="showCategoryPreview"
              class="p-4 border rounded-lg"
              :class="
                categoryPreviewProducts.length > 0
                  ? 'border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800'
                  : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'
              "
            >
              <div class="flex items-center justify-between mb-3">
                <h4
                  class="font-semibold"
                  :class="
                    categoryPreviewProducts.length > 0
                      ? 'text-indigo-900 dark:text-indigo-200'
                      : 'text-yellow-900 dark:text-yellow-200'
                  "
                >
                  <template v-if="categoryPreviewProducts.length > 0">
                    Available Products ({{ categoryPreviewProducts.length }})
                  </template>
                  <template v-else> ⚠️ No Available Products </template>
                </h4>
                <button
                  @click="showCategoryPreview = false"
                  type="button"
                  class="hover:text-gray-800 dark:hover:text-gray-200"
                  :class="
                    categoryPreviewProducts.length > 0
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  "
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    />
                  </svg>
                </button>
              </div>

              <div
                v-if="categoryPreviewProducts.length > 0"
                class="overflow-y-auto max-h-60"
              >
                <div class="space-y-2">
                  <div
                    v-for="product in categoryPreviewProducts"
                    :key="product._id"
                    class="flex items-center gap-3 p-2 bg-white rounded dark:bg-gray-800"
                  >
                    <img
                      :src="product.image?.[0]?.url || '/placeholder.jpg'"
                      class="object-cover w-12 h-12 rounded"
                    />
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-medium text-gray-900 truncate dark:text-white"
                      >
                        {{ product.name }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ product.brand }} - ${{ product.price }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-sm text-yellow-800 dark:text-yellow-200">
                <p class="font-medium mb-2">
                  All products in the selected categories are already in active
                  sale programs.
                </p>
                <p class="text-xs">Possible reasons:</p>
                <ul class="ml-4 mt-1 text-xs list-disc space-y-1">
                  <li>Products are in other active sale programs</li>
                  <li>No products exist in these categories</li>
                  <li>All products are out of stock</li>
                </ul>
                <p class="mt-2 text-xs font-medium">
                  💡 Tip: Try selecting different categories or use manual
                  product selection.
                </p>
              </div>
            </div>

            <!-- Brands -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Select Brands
              </label>
              <div
                v-if="loadingBrands"
                class="text-sm text-gray-500 dark:text-gray-400"
              >
                Loading brands...
              </div>
              <div
                v-else-if="brands.length === 0"
                class="text-sm text-gray-500 dark:text-gray-400"
              >
                No brands found
              </div>
              <div
                v-else
                class="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg dark:border-gray-700"
              >
                <label
                  v-for="brand in brands"
                  :key="brand"
                  class="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <input
                    v-model="formData.conditions.brands"
                    :value="brand"
                    type="checkbox"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    {{ brand }}
                  </span>
                </label>
              </div>
            </div>

            <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p class="text-sm text-blue-700 dark:text-blue-300">
                ℹ️ Products will be automatically populated based on selected
                categories/brands when you save
              </p>
            </div>
          </div>

          <!-- Manual Selection Method -->
          <div v-else class="space-y-4">
            <!-- Select Products Button -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Select Products
                </label>
                <button
                  @click="showProductSelector = true"
                  type="button"
                  class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
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
                  Browse Products
                </button>
              </div>

              <div
                v-if="selectedProducts.length === 0"
                class="p-8 text-center border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600"
              >
                <svg
                  class="w-12 h-12 mx-auto text-gray-400"
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
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  No products selected. Click "Browse Products" to add products.
                </p>
              </div>
            </div>

            <!-- Selected Products -->
            <div v-if="selectedProducts.length > 0">
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Selected Products ({{ selectedProducts.length }})
              </label>
              <div class="space-y-2 overflow-y-auto max-h-60">
                <div
                  v-for="product in selectedProducts"
                  :key="product._id"
                  class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <img
                    :src="product.image?.[0]?.url || '/placeholder-product.jpg'"
                    class="object-cover w-10 h-10 rounded"
                  />
                  <div class="flex-1">
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ product.name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ product.brand }} - ${{ product.price }}
                    </p>
                  </div>
                  <button
                    @click="removeProduct(product._id)"
                    type="button"
                    class="p-1 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Discount Configuration -->
        <section class="pt-6 border-t dark:border-gray-700">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Discount Configuration
          </h3>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- Percentage or Amount -->
            <div
              v-if="['percentage_sale', 'flash_sale'].includes(formData.type)"
            >
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Discount Percentage (%)
              </label>
              <input
                v-model.number="formData.benefits.discountPercentage"
                type="number"
                min="1"
                max="100"
                placeholder="e.g., 25"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div v-if="formData.type === 'fixed_amount_sale'">
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Discount Amount ($)
              </label>
              <input
                v-model.number="formData.benefits.discountAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 10.00"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Points Multiplier -->
            <div v-if="formData.type === 'points_multiplier'">
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Points Multiplier (x)
              </label>
              <input
                v-model.number="formData.benefits.pointsMultiplier"
                type="number"
                min="1"
                step="0.5"
                placeholder="e.g., 2.0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Buy X Get Y -->
            <div
              v-if="formData.type === 'buy_x_get_y'"
              class="grid grid-cols-2 gap-2"
            >
              <div>
                <label
                  class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Buy Quantity</label
                >
                <input
                  v-model.number="formData.benefits.buyQuantity"
                  type="number"
                  min="1"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label
                  class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Get Quantity</label
                >
                <input
                  v-model.number="formData.benefits.getQuantity"
                  type="number"
                  min="1"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <!-- Min Order Value -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Minimum Order Value ($)
              </label>
              <input
                v-model.number="formData.conditions.minOrderValue"
                type="number"
                min="0"
                step="0.01"
                placeholder="0 for no minimum"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Free Shipping -->
            <div
              v-if="formData.type === 'free_shipping'"
              class="flex items-center gap-2 pt-8"
            >
              <input
                v-model="formData.benefits.freeShipping"
                type="checkbox"
                class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >Enable Free Shipping</label
              >
            </div>
          </div>
        </section>

        <!-- Usage Limits -->
        <section class="pt-6 border-t dark:border-gray-700">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Usage Limits
          </h3>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Max Total Usage
              </label>
              <input
                v-model.number="formData.maxUsage"
                type="number"
                min="1"
                placeholder="0 for unlimited"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Max Usage Per User
              </label>
              <input
                v-model.number="formData.conditions.maxUsagePerUser"
                type="number"
                min="1"
                placeholder="0 for unlimited"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Promo Code -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Promo Code (Optional)
              </label>
              <input
                v-model="formData.conditions.requiredPromoCode"
                type="text"
                placeholder="e.g., SUMMER2024"
                class="w-full px-4 py-2 uppercase border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Active Toggle -->
            <div class="flex items-center gap-2 pt-8">
              <input
                v-model="formData.isActive"
                type="checkbox"
                class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >Activate Program</label
              >
            </div>
          </div>
        </section>

        <!-- Advanced Targeting -->
        <section class="pt-6 border-t dark:border-gray-700">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Advanced Targeting
          </h3>

          <div class="grid grid-cols-1 gap-4">
            <!-- Membership Tiers -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Membership Tiers (Optional)
              </label>
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="tier in ['bronze', 'silver', 'gold', 'platinum']"
                  :key="tier"
                  class="flex items-center gap-2"
                >
                  <input
                    v-model="formData.conditions.membershipTiers"
                    :value="tier"
                    type="checkbox"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span
                    class="text-sm text-gray-700 capitalize dark:text-gray-300"
                    >{{ tier }}</span
                  >
                </label>
              </div>
            </div>

            <!-- New Customers Only -->
            <div class="flex items-center gap-2">
              <input
                v-model="formData.targeting.newCustomersOnly"
                type="checkbox"
                class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >New Customers Only</label
              >
            </div>
          </div>
        </section>

        <!-- Actions -->
        <div
          class="flex items-center justify-end gap-4 pt-6 border-t dark:border-gray-700"
        >
          <button
            type="button"
            @click="$emit('close')"
            class="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{
              saving
                ? "Saving..."
                : isEdit
                ? "Update Program"
                : "Create Program"
            }}
          </button>
        </div>
      </form>
    </div>

    <!-- Product Selector Modal -->
    <ProductSelectorModal
      v-if="showProductSelector"
      :selectedProducts="
        selectedProducts.map((p) => (typeof p === 'object' ? p._id : p))
      "
      @close="showProductSelector = false"
      @select="handleProductsSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useSaleProgramStore } from "../../../store/saleProgram.store";
import { getCategoriesApi } from "../../../service/category.service";
import { getAllProductsApi } from "../../../service/product.service";
import ProductSelectorModal from "../bundles/ProductSelectorModal.vue";

const props = defineProps({
  program: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "saved"]);

const saleProgramStore = useSaleProgramStore();
const isEdit = computed(() => !!props.program);
const saving = ref(false);
const bannerPreview = ref(null);
const bannerFile = ref(null);
const conflictError = ref(null);

// Product selection
const selectionMethod = ref("auto"); // 'auto' or 'manual'
const categories = ref([]);
const brands = ref([]);
const loadingCategories = ref(false);
const loadingBrands = ref(false);
const productSearchQuery = ref("");
const searchResults = ref([]);
const selectedProducts = ref([]);
const searchTimeout = ref(null);
const showCategoryPreview = ref(false);
const categoryPreviewProducts = ref([]);
const showProductSelector = ref(false);

const formData = ref({
  title: "",
  shortDescription: "",
  description: "",
  type: "",
  status: "draft",
  startDate: "",
  endDate: "",
  isActive: false,
  maxUsage: 0,
  autoPopulateProducts: true,
  conditions: {
    minOrderValue: 0,
    maxUsagePerUser: 0,
    requiredPromoCode: "",
    membershipTiers: [],
    applicableProducts: [],
    categories: [],
    brands: [],
  },
  benefits: {
    discountPercentage: null,
    discountAmount: null,
    pointsMultiplier: null,
    buyQuantity: null,
    getQuantity: null,
    freeShipping: false,
  },
  targeting: {
    newCustomersOnly: false,
  },
});

// Watch selection method
watch(selectionMethod, (newMethod) => {
  if (newMethod === "auto") {
    formData.value.autoPopulateProducts = true;
    formData.value.conditions.applicableProducts = [];
    selectedProducts.value = [];
  } else {
    formData.value.autoPopulateProducts = false;
    formData.value.conditions.categories = [];
    formData.value.conditions.brands = [];
  }
});

const handleBannerUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    bannerFile.value = file;
    bannerPreview.value = URL.createObjectURL(file);
  }
};

// Load categories
const loadCategories = async () => {
  try {
    loadingCategories.value = true;
    const response = await getCategoriesApi();
    console.log("📦 Categories response:", response.data);

    // Match AdminProductsView structure
    if (response.data.success) {
      categories.value = response.data.data || [];
    } else {
      categories.value = response.data.categories || [];
    }

    console.log("✅ Loaded categories:", categories.value.length);
  } catch (error) {
    console.error("❌ Error loading categories:", error);
  } finally {
    loadingCategories.value = false;
  }
};

// Load brands
const loadBrands = async () => {
  try {
    loadingBrands.value = true;
    const response = await getAllProductsApi({ page: 1, limit: 1000 });
    console.log("📦 Products response for brands:", response.data);

    // Match AdminProductsView structure - products are in response.data.data.products
    const products =
      response.data.data?.products || response.data.products || [];
    console.log("📦 Found products:", products.length);

    const uniqueBrands = [...new Set(products.map((p) => p.brand))].filter(
      Boolean
    );
    brands.value = uniqueBrands.sort();
    console.log("✅ Loaded brands:", brands.value.length, brands.value);
  } catch (error) {
    console.error("❌ Error loading brands:", error);
  } finally {
    loadingBrands.value = false;
  }
};

// Search products with debounce
const searchProducts = () => {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(async () => {
    if (productSearchQuery.value.trim().length < 2) {
      searchResults.value = [];
      return;
    }

    try {
      const params = {
        search: productSearchQuery.value,
        limit: 20,
        isOnSale: false, // Only show products not in any sale program
      };

      // If in auto mode and categories selected, filter by those categories
      if (
        selectionMethod.value === "auto" &&
        formData.value.conditions.categories?.length > 0
      ) {
        // For multiple categories, we'll filter client-side after fetching
        // Backend doesn't support multiple categories in single query
        params.category = formData.value.conditions.categories[0];
      }

      const response = await getAllProductsApi(params);
      let results = response.data.data?.products || [];

      // If multiple categories selected, filter client-side
      if (
        selectionMethod.value === "auto" &&
        formData.value.conditions.categories?.length > 1
      ) {
        results = results.filter((product) => {
          const productCategories = Array.isArray(product.category)
            ? product.category.map((c) => c._id || c)
            : [product.category?._id || product.category];

          return formData.value.conditions.categories.some((catId) =>
            productCategories.includes(catId)
          );
        });
      }

      console.log("🔍 Search results (non-sale only):", results.length);
      searchResults.value = results;
    } catch (error) {
      console.error("Error searching products:", error);
    }
  }, 300);
};

// Preview products from selected categories
const previewCategoryProducts = async () => {
  if (!formData.value.conditions.categories?.length) {
    return;
  }

  try {
    showCategoryPreview.value = true;
    categoryPreviewProducts.value = [];

    console.log(
      `🔍 Previewing products from ${formData.value.conditions.categories.length} categories:`,
      formData.value.conditions.categories
    );

    // Fetch products for each selected category
    const allProducts = [];

    for (const categoryId of formData.value.conditions.categories) {
      console.log(`  📦 Fetching category: ${categoryId}`);
      const response = await getAllProductsApi({
        category: categoryId,
        isOnSale: false,
        limit: 100,
      });

      const products = response.data.data?.products || [];
      console.log(`    ✅ Found ${products.length} available products`);
      allProducts.push(...products);
    }

    // Remove duplicates (products might belong to multiple categories)
    const uniqueProducts = Array.from(
      new Map(allProducts.map((p) => [p._id, p])).values()
    );

    categoryPreviewProducts.value = uniqueProducts;
    console.log(
      `📋 Preview: ${uniqueProducts.length} available products from ${formData.value.conditions.categories.length} categories`
    );

    if (uniqueProducts.length === 0) {
      console.warn(
        "⚠️ No available products found! All products in these categories may already be in active sale programs."
      );
    }
  } catch (error) {
    console.error("❌ Error previewing category products:", error);
  }
};

// Add product to selection
const addProduct = (product) => {
  if (!selectedProducts.value.find((p) => p._id === product._id)) {
    selectedProducts.value.push(product);
    formData.value.conditions.applicableProducts.push(product._id);
  }
  searchResults.value = [];
  productSearchQuery.value = "";
};

// Handle products selected from ProductSelectorModal
const handleProductsSelected = (products) => {
  console.log("📦 Products selected:", products);

  products.forEach((product) => {
    const productId = typeof product === "object" ? product._id : product;

    const exists = selectedProducts.value.find((p) => {
      const existingId = typeof p === "object" ? p._id : p;
      return existingId === productId;
    });

    if (!exists) {
      selectedProducts.value.push(product);
      formData.value.conditions.applicableProducts.push(productId);
      console.log("✅ Added product:", product.name || product);
    } else {
      console.log("⚠️ Product already exists:", product.name || product);
    }
  });

  console.log("📋 Total selected products:", selectedProducts.value.length);
  showProductSelector.value = false;
};

// Remove product from selection
const removeProduct = (productId) => {
  selectedProducts.value = selectedProducts.value.filter(
    (p) => p._id !== productId
  );
  formData.value.conditions.applicableProducts =
    formData.value.conditions.applicableProducts.filter(
      (id) => id !== productId
    );
};

const handleSubmit = async () => {
  try {
    saving.value = true;
    conflictError.value = null;

    const data = new FormData();

    // Append form fields
    Object.keys(formData.value).forEach((key) => {
      if (key === "conditions" || key === "benefits" || key === "targeting") {
        data.append(key, JSON.stringify(formData.value[key]));
      } else {
        data.append(key, formData.value[key]);
      }
    });

    // Append banner if uploaded
    if (bannerFile.value) {
      data.append("banner", bannerFile.value);
    }

    if (isEdit.value) {
      await saleProgramStore.updateSaleProgram(props.program._id, data);
    } else {
      await saleProgramStore.createSaleProgram(data);
    }

    emit("saved");
  } catch (error) {
    console.error("Error saving sale program:", error);

    // Check if it's a conflict error (409)
    if (error.response?.status === 409 && error.response?.data?.conflicts) {
      conflictError.value = {
        message: error.response.data.message,
        conflicts: error.response.data.conflicts,
        conflictingProducts: error.response.data.conflictingProducts,
      };
    } else {
      alert(
        "Failed to save sale program: " +
          (error.response?.data?.message || error.message)
      );
    }
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  // Load categories and brands
  await Promise.all([loadCategories(), loadBrands()]);

  if (props.program) {
    // Populate form with existing program data
    formData.value = {
      title: props.program.title || "",
      shortDescription: props.program.shortDescription || "",
      description: props.program.description || "",
      type: props.program.type || "",
      status: props.program.status || "draft",
      startDate: props.program.startDate
        ? new Date(props.program.startDate).toISOString().slice(0, 16)
        : "",
      endDate: props.program.endDate
        ? new Date(props.program.endDate).toISOString().slice(0, 16)
        : "",
      isActive: props.program.isActive || false,
      maxUsage: props.program.maxUsage || 0,
      autoPopulateProducts: true,
      conditions: {
        ...formData.value.conditions,
        ...props.program.conditions,
        categories:
          props.program.conditions?.categories?.map((c) =>
            typeof c === "object" ? c._id : c
          ) || [],
        brands: props.program.conditions?.brands || [],
        applicableProducts:
          props.program.conditions?.applicableProducts?.map((p) =>
            typeof p === "object" ? p._id : p
          ) || [],
      },
      benefits: {
        ...formData.value.benefits,
        ...props.program.benefits,
      },
      targeting: {
        ...formData.value.targeting,
        ...props.program.targeting,
      },
    };

    if (props.program.bannerImage) {
      bannerPreview.value = props.program.bannerImage;
    }

    // Determine selection method based on existing data
    if (
      formData.value.conditions.applicableProducts.length > 0 &&
      formData.value.conditions.categories.length === 0 &&
      formData.value.conditions.brands.length === 0
    ) {
      selectionMethod.value = "manual";
      // Load selected products details if editing
      if (formData.value.conditions.applicableProducts.length > 0) {
        try {
          const response = await getAllProductsApi({
            ids: formData.value.conditions.applicableProducts.join(","),
          });
          selectedProducts.value = response.data.data?.products || [];
        } catch (error) {
          console.error("Error loading selected products:", error);
        }
      }
    }
  }
});
</script>
