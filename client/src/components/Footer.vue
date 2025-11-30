<template>
  <footer class="text-gray-300 bg-gray-900">
    <!-- Main Footer Content -->
    <div class="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <!-- Brand Section -->
        <div>
          <h3 class="mb-4 font-serif text-xl font-bold text-white">Luxe Beauty</h3>
          <p class="mb-4 text-sm leading-relaxed">
            Discover premium cosmetics crafted with the finest ingredients for your natural beauty.
          </p>
          <div class="flex gap-4">
            <a href="#" class="transition hover:text-rose-500">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" class="transition hover:text-rose-500">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 002.856-3.51 10 10 0 01-2.856.17 10 10 0 00-7.737-4.247 10 10 0 00-10 10 10 10 0 00.1 2.1 10 10 0 00-7.737 4.247 10 10 0 002.856 3.51 10 10 0 01-2.856-.17 10 10 0 007.737 4.247 10 10 0 01-10 10 10 10 0 00-.1-2.1 10 10 0 007.737-4.247 10 10 0 00-2.856-3.51z"/></svg>
            </a>
            <a href="#" class="transition hover:text-rose-500">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect fill="none" height="24" width="24"/><path d="M7 11v8.17c0 .45.54.67.85.35l5.79-5.79c.2-.2.2-.51 0-.71l-5.79-5.79c-.31-.31-.85-.09-.85.36V13h-1V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-4h1z"/></svg>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="mb-4 font-semibold text-white">Quick Links</h4>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/shop" class="transition hover:text-rose-500">Shop All Products</router-link></li>
            <li><router-link to="/sale" class="transition hover:text-rose-500">Sale & Offers</router-link></li>
            <li><router-link to="/new-arrivals" class="transition hover:text-rose-500">New Arrivals</router-link></li>
            <li><router-link to="/best-sellers" class="transition hover:text-rose-500">Best Sellers</router-link></li>
          </ul>
        </div>

        <!-- Customer Service -->
        <div>
          <h4 class="mb-4 font-semibold text-white">Customer Service</h4>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/contact" class="transition hover:text-rose-500">Contact Us</router-link></li>
            <li><router-link to="/faq" class="transition hover:text-rose-500">FAQ</router-link></li>
            <li><router-link to="/shipping" class="transition hover:text-rose-500">Shipping Info</router-link></li>
            <li><router-link to="/returns" class="transition hover:text-rose-500">Returns & Exchanges</router-link></li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h4 class="mb-4 font-semibold text-white">Newsletter</h4>
          <p class="mb-4 text-sm">Subscribe to get special offers and updates.</p>
          <form @submit.prevent="handleNewsletterSubscribe" class="space-y-2">
            <input
              v-model="newsletterEmail"
              type="email"
              placeholder="Your email"
              class="w-full px-4 py-2 text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-rose-500"
              required
            />
            <button
              type="submit"
              class="w-full px-4 py-2 font-medium text-white transition rounded bg-rose-600 hover:bg-rose-700"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Bottom Footer -->
    <div class="px-4 py-8 mx-auto border-t border-gray-800 max-w-7xl sm:px-6 lg:px-8">
      <div class="flex flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between">
        <p>&copy; 2025 Luxe Beauty. All rights reserved.</p>
        <div class="flex gap-6">
          <router-link to="/privacy" class="transition hover:text-rose-500">Privacy Policy</router-link>
          <router-link to="/terms" class="transition hover:text-rose-500">Terms of Service</router-link>
          <router-link to="/cookies" class="transition hover:text-rose-500">Cookie Policy</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'

const newsletterEmail = ref('')

const handleNewsletterSubscribe = async () => {
  if (newsletterEmail.value) {
    console.log('Subscribing:', newsletterEmail.value)
    // TODO: Call newsletter subscription API
    newsletterEmail.value = ''
  }
}
</script>
