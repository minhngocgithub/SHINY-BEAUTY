<template>
  <div class="w-full min-h-screen bg-white">
    <!-- Header -->
    <Header />

    <!-- Hero Section -->
    <section class="relative z-0 w-full" data-aos="fade-down" data-aos-duration="1000">
      <ShopHero />
    </section>

    <!-- Collection Cards Section -->
    <section 
      class="relative z-0 w-full"
      data-aos="fade-up" 
      data-aos-duration="1000" 
      data-aos-delay="200"
    >
      <CollectionCards />
    </section>

    <!-- Category Grid Section -->
    <section 
      class="relative z-0 w-full"
      data-aos="fade-up" 
      data-aos-duration="1000" 
      data-aos-delay="400"
    >
      <CategoryGrid />
    </section>

    <!-- Trending Products Section -->
    <section 
      class="relative z-0 w-full"
      data-aos="fade-up" 
      data-aos-duration="1000" 
      data-aos-delay="600"
    >
      <TrendingProducts
        title="Trending This Week"
        subtitle="Discover what's hot right now"
        :limit="8"
      />
    </section>

    <!-- Floating Cart -->
    <FloatingCart @toggle-cart="handleToggleCart" />
  </div>
</template>

<script setup>
import { onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import Header from "../components/Header.vue";
import ShopHero from "../components/shop/ShopHero.vue";
import CollectionCards from "../components/shop/CollectionCards.vue";
import CategoryGrid from "../components/shop/CategoryGrid.vue";
import TrendingProducts from "../components/shop/TrendingProducts.vue";
import FloatingCart from "../components/FloatingCart.vue";
import { refreshAOS } from "../../utils/aos";

const router = useRouter();

const handleToggleCart = () => {
  router.push("/cart");
};

onMounted(async () => {
  await nextTick();
  setTimeout(() => {
    refreshAOS();
  }, 100);

  addStructuredData();
});

const addStructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Shop - SHINY BEAUTY",
    description:
      "Browse our premium beauty product collections: featured products, flash sales, trending items, and shop by category. Free shipping on orders over $50.",
    url: window.location.href,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: window.location.origin,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: window.location.href,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Product Collections",
      description: "Curated beauty product collections",
    },
  };

  let script = document.querySelector('script[type="application/ld+json"]');
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(structuredData);
};
</script>

<style scoped>
/* Ensure no conflicting styles */
section {
  max-width: 100%;
  overflow-x: hidden;
}
</style>