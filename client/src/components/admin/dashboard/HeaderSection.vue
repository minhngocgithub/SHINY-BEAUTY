<template>
  <div
    class="sticky top-0 z-40 bg-white border-b shadow-sm dark:bg-slate-900 border-slate-200 dark:border-slate-800"
  >
    <div class="flex items-center justify-between px-6 py-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400">
          Welcome back, {{ userName }}
        </p>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative hidden md:block">
          <input
            type="text"
            placeholder="Search products, orders..."
            class="py-2 pl-10 pr-4 transition bg-white border rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <svg
            class="absolute left-3 top-2.5 w-5 h-5 text-slate-400"
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
        </div>

        <button
          class="relative p-2 transition rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span
            class="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1"
          ></span>
        </button>

        <button
          @click="$emit('toggleDarkMode')"
          class="p-2 transition rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <svg
            v-if="!isDarkMode"
            class="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.657 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <div
          class="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800"
        >
          <Avatar
            :current-avatar="
              authStore.user?.avatar?.url || '@/assets/image/vue.svg'
            "
            :size="32"
          />

          <div class="hidden sm:block">
            <p class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ authStore.user?.name || "" }}
            </p>
            <p class="text-xs text-slate-600 dark:text-slate-400">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isDarkMode: Boolean,
  userName: String,
});
defineEmits(["toggleDarkMode"]);
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../store/auth.store";
import Avatar from "../../atoms/Avatar.vue";
const authStore = useAuthStore();
const router = useRouter();
</script>
