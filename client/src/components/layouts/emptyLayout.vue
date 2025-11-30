<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-rose-100"
  >
    <!-- Logo / Branding -->
    <router-link
      to="/"
      class="flex items-center gap-2 mb-8 text-2xl font-bold tracking-wide transition text-rose-600 hover:text-rose-700"
    >
      <img
        src="../../assets/logo.png"
        alt="SHINY BEAUTY"
        class="object-contain w-10 h-10"
      />
      <span>SHINY BEAUTY</span>
    </router-link>

    <!-- Router view for auth pages -->
    <div
      class="w-full max-w-md px-8 py-10 bg-white border shadow-xl rounded-2xl border-rose-100"
    >
      <router-view />
    </div>

    <!-- Optional footer -->
    <footer class="mt-8 text-sm text-gray-500">
      <p>
        &copy; {{ new Date().getFullYear() }} SHINY BEAUTY. All rights reserved.
      </p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from "vue"
import { useSeo } from "../../composables/useSeo"

// Dùng hook SEO để đồng bộ tiêu đề meta
onMounted(() => {
  useSeo({
    title: "Authentication - SHINY BEAUTY",
    description: "Sign in or register to enjoy the best beauty deals",
    page: "auth",
  })
})
</script>

<style scoped>
/* Tùy chọn hiệu ứng nhẹ */
html,
body {
  background-color: #fffafc;
}
</style>
