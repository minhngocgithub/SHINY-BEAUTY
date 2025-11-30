<template>
  <aside
    class="fixed top-0 left-0 w-64 h-screen overflow-y-auto transition-all bg-white border-r dark:bg-slate-900 border-slate-200 dark:border-slate-800"
    :class="sidebarClass"
  >
    <div
      class="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800"
    >
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"
        ></div>
        <span class="font-bold text-slate-900 dark:text-white">Cosmetic</span>
      </div>
      <button
        @click="handleToggle"
        class="lg:hidden text-slate-600 dark:text-slate-400"
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

    <nav class="p-4">
      <div v-for="item in menuItems" :key="item.path" class="mb-2">
        <router-link
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition',
            isActive(item.path)
              ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          ]"
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
              d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4V3"
            />
          </svg>
          <span>{{ item.label }}</span>
          <span
            v-if="item.badge"
            class="ml-auto px-2 py-0.5 text-xs font-semibold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full"
            >{{ item.badge }}</span
          >
        </router-link>
      </div>
    </nav>

    <div class="my-4 border-t border-slate-200 dark:border-slate-800"></div>

    <nav class="p-4">
      <p
        class="mb-3 text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400"
      >
        Tools
      </p>
      <div class="space-y-2">
        <a
          href="#"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition"
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31 2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Settings</span>
        </a>
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 font-medium transition"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { logoutAccountApi } from "../../service/auth.service";

const props = defineProps({
  collapsed: Boolean,
});
const emit = defineEmits(["toggle"]);

const menuItems = [
  { path: "/admin", label: "Dashboard", icon: "HomeIcon" },
  { path: "/admin/products", label: "Products", icon: "ShoppingBagIcon" },
  { path: "/admin/bundles", label: "Bundles", icon: "ShoppingBagIcon" },
  {
    path: "/admin/orders",
    label: "Orders",
    icon: "ShoppingCartIcon",
    badge: "0",
  },
  { path: "/admin/users", label: "Users", icon: "UsersIcon" },
  { path: "/admin/categories", label: "Categories", icon: "TagIcon" },
  { path: "/admin/reviews", label: "Reviews", icon: "StarIcon" },
];

const router = useRouter();
const route = useRoute();

const sidebarClass = computed(() =>
  props.collapsed ? "-translate-x-full lg:translate-x-0" : ""
);

function handleToggle() {
  emit("toggle");
}

function isActive(path) {
  return route.path === path;
}

async function handleLogout() {
  try {
    await logoutAccountApi();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  } catch (error) {
    console.error("[v0] Logout error:", error);
  }
}
</script>
