<template>
  <section class="w-full min-h-screen bg-gradient-to-b from-rose-50 to-white">
    <Header />
    <div class="pt-4 pb-8">
      <Slider />
    </div>
    <div class="pb-12">
      <FlashSaleProduct />
    </div>
  </section>
</template>

<script>
import Header from '../components/Header.vue';
import Slider from '../components/Slider.vue'
import FlashSaleProduct from '../components/FlashSaleProduct.vue'

export default {
  name: 'HomeView',
  components: {
    Header,
    Slider,
    FlashSaleProduct,
  },
  setup() {
    return {

    }
  }
}
</script>

<style scoped>
section {
  transition: all 0.3s ease-in-out;
}
</style>