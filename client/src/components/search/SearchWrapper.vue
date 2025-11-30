<template>
  <div class="relative w-[80%] lg:w-[500px]">
    <div class="h-[35px] border-[1px] flex rounded-md">
      <input
        v-model="keyword"
        type="text"
        placeholder="Search products, brands..."
        style="outline: none; border: none !important"
        class="h-full w-full border-0 bg-transparent rounded-md px-3"
        @keyup.enter="onSearch"
        @input="onInput"
        @focus="showSuggestions = true"
        @blur="hideSuggestions"
      />
      <button
        class="h-full bg-[#5a4098] cursor-pointer flex justify-center items-center rounded-tr rounded-br px-3 hover:bg-[#4a3078] transition-colors"
        @click="onSearch"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4 text-white"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <span class="px-2 text-white">Search</span>
      </button>
    </div>

    <!-- Autocomplete Suggestions Dropdown -->
    <div
      v-if="
        showSuggestions &&
        (suggestions.length > 0 || popularSearches.length > 0)
      "
      class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[400px] overflow-y-auto"
    >
      <!-- Search Suggestions -->
      <div v-if="suggestions.length > 0" class="py-2">
        <div class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
          Suggestions
        </div>
        <button
          v-for="(suggestion, index) in suggestions"
          :key="'suggestion-' + index"
          class="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 transition-colors"
          @mousedown.prevent="selectSuggestion(suggestion)"
        >
          <svg
            v-if="suggestion.type === 'product'"
            class="w-4 h-4 text-gray-400"
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
          <svg
            v-else
            class="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900">
              {{ suggestion.text }}
            </div>
            <div v-if="suggestion.brand" class="text-xs text-gray-500">
              {{ suggestion.brand }}
            </div>
          </div>
          <span class="text-xs text-gray-400">{{
            suggestion.type === "product" ? "Product" : "Brand"
          }}</span>
        </button>
      </div>

      <!-- Popular Searches -->
      <div
        v-if="!keyword && popularSearches.length > 0"
        class="py-2 border-t border-gray-100"
      >
        <div
          class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clip-rule="evenodd"
            />
          </svg>
          Popular Searches
        </div>
        <button
          v-for="(search, index) in popularSearches.slice(0, 5)"
          :key="'popular-' + index"
          class="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700 transition-colors"
          @mousedown.prevent="selectPopular(search)"
        >
          <svg
            class="w-4 h-4 text-orange-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
          {{ search }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

const router = useRouter();
const route = useRoute();

const keyword = ref(route.query?.keyword || "");
const suggestions = ref([]);
const popularSearches = ref([]);
const showSuggestions = ref(false);
const searchTimeout = ref(null);

// Fetch suggestions when user types
const onInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  if (keyword.value.trim().length < 2) {
    suggestions.value = [];
    return;
  }

  searchTimeout.value = setTimeout(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/product/search/suggestions`,
        {
          params: {
            q: keyword.value,
            limit: 8,
          },
        }
      );

      if (response.data.success) {
        suggestions.value = response.data.suggestions;
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
  }, 300); // Debounce 300ms
};

// Perform search
const onSearch = () => {
  if (!keyword.value.trim()) return;

  showSuggestions.value = false;
  router.push({
    name: "search",
    query: {
      keyword: keyword.value.trim(),
    },
  });
};

// Select a suggestion
const selectSuggestion = (suggestion) => {
  keyword.value = suggestion.text;
  onSearch();
};

// Select popular search
const selectPopular = (search) => {
  keyword.value = search;
  onSearch();
};

// Hide suggestions with delay to allow click
const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

// Load popular searches on mount
onMounted(async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/product/search/popular`,
      {
        params: { limit: 10 },
      }
    );

    if (response.data.success) {
      popularSearches.value = response.data.popular || [];
    }
  } catch (error) {
    console.error("Failed to fetch popular searches:", error);
  }
});

// Watch route changes to update keyword
watch(
  () => route.query.keyword,
  (newKeyword) => {
    keyword.value = newKeyword || "";
  }
);
</script>

<style scoped>
/* Custom scrollbar for suggestions */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>