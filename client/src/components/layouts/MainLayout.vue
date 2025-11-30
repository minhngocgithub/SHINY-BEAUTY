<template>
  <div class="flex flex-col min-h-screen bg-white">
    <Header />
    
    <main class="flex-1">
      <slot />
    </main>
    
    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/commons/Header.vue'
import Footer from '../components/commons/Footer.vue'
</script>