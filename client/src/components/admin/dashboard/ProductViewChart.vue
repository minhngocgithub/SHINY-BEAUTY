<template>
  <div class="h-64">
    <canvas v-if="hasData" ref="chartCanvas"></canvas>
    <div v-else class="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
      <div class="text-center">
        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p class="text-sm">Product view tracking coming soon</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  chartData: {
    type: Object,
    default: null
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const hasData = computed(() => {
  return props.chartData && 
         props.chartData.thisWeek && 
         props.chartData.lastWeek &&
         (props.chartData.thisWeek.length > 0 || props.chartData.lastWeek.length > 0)
})

onMounted(() => {
  if (hasData.value && chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
          {
            label: 'This Week',
            data: props.chartData.thisWeek || [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#8b5cf6',
          },
          {
            label: 'Last Week',
            data: props.chartData.lastWeek || [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#ef4444',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    })
  }
})
</script>
