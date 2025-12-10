<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <canvas
        ref="fireworksCanvas"
        class="absolute inset-0 w-full h-full pointer-events-none"
      ></canvas>

      <div
        class="relative z-10 max-w-md p-8 text-center transform bg-white shadow-2xl rounded-3xl animate-scale-up"
        @click.stop
      >
        <!-- Success Icon -->
        <div
          class="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-bounce-in"
        >
          <svg
            class="w-12 h-12 text-white animate-check"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <!-- Thank You Message -->
        <h2
          class="mb-4 text-3xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text animate-slide-up"
        >
          Cảm ơn quý khách!
        </h2>

        <p
          class="mb-2 text-lg font-semibold text-gray-800 animate-slide-up animation-delay-100"
        >
          {{ message }}
        </p>

        <p
          class="mb-6 text-sm text-gray-600 animate-slide-up animation-delay-200"
        >
          Đơn hàng của bạn đã được đặt thành công. Chúng tôi sẽ xử lý và giao
          hàng trong thời gian sớm nhất.
        </p>

        <!-- Order Details -->
        <div
          class="p-4 mb-6 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 animate-slide-up animation-delay-300"
        >
          <p class="text-sm font-medium text-gray-700">Mã đơn hàng</p>
          <p
            class="text-xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text"
          >
            #{{ orderNumber }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 animate-slide-up animation-delay-400">
          <button
            @click="handleViewOrder"
            class="flex-1 px-6 py-3 font-medium text-white transition-all duration-200 shadow-lg rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 hover:shadow-xl"
          >
            Xem đơn hàng
          </button>
          <button
            @click="handleContinueShopping"
            class="flex-1 px-6 py-3 font-medium text-gray-700 transition-all duration-200 bg-white border-2 border-gray-300 shadow-lg rounded-xl hover:bg-gray-50 hover:border-gray-400"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "Đơn hàng đã được tạo thành công!",
  },
  orderNumber: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close", "view-order", "continue-shopping"]);

const fireworksCanvas = ref(null);
let animationId = null;
let fireworks = [];
let particles = [];

class Firework {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = canvas.height;
    this.targetY = Math.random() * canvas.height * 0.5;
    this.velocity = {
      x: (Math.random() - 0.5) * 2,
      y: Math.random() * -8 - 4,
    };
    this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    this.exploded = false;
  }

  update() {
    this.velocity.y += 0.1;
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    if (this.y <= this.targetY && !this.exploded) {
      this.explode();
      this.exploded = true;
    }
  }

  explode() {
    const particleCount = 80; // Increase particles for more spectacular effect
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(this.x, this.y, this.color));
    }
  }

  draw(ctx) {
    if (!this.exploded) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 4, 0, Math.PI * 2); // Larger firework trail
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.velocity = {
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8,
    };
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.015;
    this.color = color;
    this.size = Math.random() * 3 + 1;
  }

  update() {
    this.velocity.y += 0.1;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

const animate = () => {
  if (!fireworksCanvas.value) return;

  const ctx = fireworksCanvas.value.getContext("2d");
  // Clear canvas with semi-transparent black for trail effect
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.fillRect(0, 0, fireworksCanvas.value.width, fireworksCanvas.value.height);

  // Add new fireworks more frequently
  if (Math.random() < 0.15) {
    fireworks.push(new Firework(fireworksCanvas.value));
  }

  // Update and draw fireworks
  fireworks = fireworks.filter((firework) => {
    firework.update();
    firework.draw(ctx);
    return !firework.exploded || firework.y < fireworksCanvas.value.height;
  });

  // Update and draw particles
  particles = particles.filter((particle) => {
    particle.update();
    particle.draw(ctx);
    return particle.alpha > 0;
  });

  animationId = requestAnimationFrame(animate);
};

const startFireworks = () => {
  if (!fireworksCanvas.value) return;

  fireworksCanvas.value.width = window.innerWidth;
  fireworksCanvas.value.height = window.innerHeight;

  // Clear canvas with black background
  const ctx = fireworksCanvas.value.getContext("2d");
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, fireworksCanvas.value.width, fireworksCanvas.value.height);

  // Launch initial burst of fireworks
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      fireworks.push(new Firework(fireworksCanvas.value));
    }, i * 200);
  }

  animate();
};

const stopFireworks = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  fireworks = [];
  particles = [];
};

const handleClose = () => {
  emit("close");
};

const handleViewOrder = () => {
  emit("view-order");
};

const handleContinueShopping = () => {
  emit("continue-shopping");
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      startFireworks();
    } else {
      stopFireworks();
    }
  }
);

onMounted(() => {
  if (props.show) {
    startFireworks();
  }
});

onUnmounted(() => {
  stopFireworks();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scaleUp {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes checkDraw {
  0% {
    stroke-dashoffset: 50;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-scale-up {
  animation: scaleUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  animation-fill-mode: forwards;
}

.animate-bounce-in {
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s forwards;
}

.animate-check {
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
  animation: checkDraw 0.8s 0.6s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out forwards;
  opacity: 0;
}

.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}
</style>
