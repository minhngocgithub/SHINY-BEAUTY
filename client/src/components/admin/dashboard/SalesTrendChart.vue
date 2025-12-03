<template>
  <div class="h-64">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  chartData: {
    type: Object,
    default: () => ({
      labels: [],
      datasets: [],
    }),
  },
});

const chartCanvas = ref(null);
let chartInstance = null;

const createChart = () => {
  if (!chartCanvas.value) return;

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext("2d");

  // Use provided data or fallback
  const hasData = props.chartData.labels?.length > 0;

  chartInstance = new Chart(ctx, {
    type: "line",
    data: hasData
      ? props.chartData
      : {
          labels: ["No Data"],
          datasets: [
            {
              label: "Revenue",
              data: [0],
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
            },
          ],
        },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: document.documentElement.classList.contains("dark")
              ? "#e5e7eb"
              : "#374151",
            usePointStyle: true,
            padding: 15,
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          titleColor: "#fff",
          bodyColor: "#fff",
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                if (context.datasetIndex === 0) {
                  label += "$" + context.parsed.y.toFixed(2);
                } else {
                  label += context.parsed.y + " orders";
                }
              }
              return label;
            },
          },
        },
      },
      scales: {
        y: {
          type: "linear",
          display: true,
          position: "left",
          beginAtZero: true,
          grid: {
            color: document.documentElement.classList.contains("dark")
              ? "#374151"
              : "#f3f4f6",
          },
          ticks: {
            color: document.documentElement.classList.contains("dark")
              ? "#9ca3af"
              : "#6b7280",
            callback: function (value) {
              return "$" + value;
            },
          },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: document.documentElement.classList.contains("dark")
              ? "#9ca3af"
              : "#6b7280",
          },
        },
        x: {
          grid: {
            color: document.documentElement.classList.contains("dark")
              ? "#374151"
              : "#f3f4f6",
          },
          ticks: {
            color: document.documentElement.classList.contains("dark")
              ? "#9ca3af"
              : "#6b7280",
          },
        },
      },
    },
  });
};

onMounted(() => {
  createChart();
});

watch(
  () => props.chartData,
  () => {
    createChart();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
