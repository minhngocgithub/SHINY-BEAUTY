<template>
  <div class="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-white">
    <div class="container relative px-8 mx-auto mt-12">
      <div class="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
        <!-- Left Content -->
        <div class="relative z-10 space-y-6">
          <h1 class="text-5xl font-light leading-tight text-gray-800 lg:text-6xl">
            Glow Naturally With<br>
            <span class="font-serif text-6xl font-normal text-orange-400 lg:text-7xl">Glisty Skincare</span>
          </h1>
          
          <p class="max-w-md text-base leading-relaxed text-gray-600">
            Your Skin Deserves The Best. Discover Our All-Natural, Cruelty-Free Skincare Products.
          </p>

          <button class="flex items-center gap-3 px-6 py-3 text-sm font-medium text-white transition-all duration-300 bg-gray-800 rounded-full hover:bg-gray-900 hover:gap-4 group">
            <span>Shop Now</span>
            <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>

          <!-- Product Cards -->
          <div class="flex gap-4 pt-8">
            <div v-for="product in products" :key="product.name" class="relative group">
              <div class="w-24 h-32 overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-lg hover:-translate-y-2">
                <div class="h-20 overflow-hidden bg-gradient-to-br from-orange-50 to-pink-50">
                  <img :src="product.image" :alt="product.name" class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110">
                </div>
                <div class="p-2">
                  <p class="text-[10px] font-medium text-gray-800 text-center leading-tight">{{ product.name }}</p>
                </div>
              </div>
              <!-- Plus Icon -->
              <div class="absolute flex items-center justify-center w-6 h-6 transition-all duration-300 bg-white border-2 border-gray-800 rounded-full -top-2 -right-2 group-hover:bg-gray-800">
                <svg class="w-3 h-3 text-gray-800 transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Content - Image Collage -->
        <div class="relative">
          <!-- Decorative Wave Background -->
          <svg class="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,100 Q125,50 250,100 T500,100 L500,500 L0,500 Z" fill="#FED7AA" fill-opacity="0.3"/>
            <path d="M0,200 Q125,150 250,200 T500,200 L500,500 L0,500 Z" fill="#FCA5A5" fill-opacity="0.2"/>
          </svg>

          <!-- Image Grid -->
          <div class="relative grid grid-cols-3 gap-3 auto-rows-[140px]">
            <!-- Large Image - Top Left -->
            <div class="col-span-2 row-span-2 overflow-hidden bg-white shadow-lg rounded-3xl">
              <img src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&h=600&fit=crop" 
                   alt="Skincare" 
                   class="object-cover w-full h-full transition-transform duration-700 hover:scale-110">
            </div>

            <!-- Top Right -->
            <div class="overflow-hidden bg-orange-200 shadow-lg rounded-3xl">
              <img src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop" 
                   alt="Skin texture" 
                   class="object-cover w-full h-full transition-transform duration-700 hover:scale-110">
            </div>

            <!-- Middle Right -->
            <div class="overflow-hidden bg-white shadow-lg rounded-3xl">
              <img src="https://images.unsplash.com/photo-1612160808975-5a32872f2ec4?w=400&h=400&fit=crop" 
                   alt="Eye close-up" 
                   class="object-cover w-full h-full transition-transform duration-700 hover:scale-110">
            </div>

            <!-- Bottom Left -->
            <div class="overflow-hidden bg-orange-200 shadow-lg rounded-3xl">
              <img src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=400&fit=crop" 
                   alt="Lips" 
                   class="object-cover w-full h-full transition-transform duration-700 hover:scale-110">
            </div>

            <!-- Bottom Center -->
            <div class="overflow-hidden bg-white shadow-lg rounded-3xl">
              <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop" 
                   alt="Shoulder" 
                   class="object-cover w-full h-full transition-transform duration-700 hover:scale-110">
            </div>

            <!-- Bottom Right -->
            <div class="overflow-hidden bg-orange-200 shadow-lg rounded-3xl">
              <img src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop" 
                   alt="Hair" 
                   class="object-cover w-full h-full transition-transform duration-700 hover:scale-110">
            </div>
          </div>

          <!-- Decorative Circle -->
          <div class="absolute w-64 h-64 bg-orange-100 rounded-full opacity-40 -bottom-12 -right-12 blur-3xl"></div>
          <div class="absolute w-48 h-48 bg-pink-100 rounded-full opacity-40 -top-12 -left-12 blur-3xl"></div>
        </div>
      </div>
    </div>

    <!-- Background Decorative Wave -->
    <svg class="absolute bottom-0 left-0 w-full opacity-20" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FED7AA" fill-opacity="0.4" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,170.7C960,192,1056,224,1152,213.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    </svg>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const products = ref([
  {
    name: 'PureGlow Elixir',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop'
  },
  {
    name: 'RevitaLuxe Cream',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop'
  },
  {
    name: 'LumiCrest Serum',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&h=200&fit=crop'
  }
]);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&display=swap');

.font-serif {
  font-family: 'Crimson Text', serif;
}
</style>