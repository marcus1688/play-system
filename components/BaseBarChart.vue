<template>
  <Bar :data="chartConfig" :options="options" class="h-[300px]" />
</template>

<script setup>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  labels: {
    type: Array,
    required: true,
  },
});
const chartConfig = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: "#4F46E5",
      minBarLength: 5,
    },
  ],
}));
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: false,
      },
    },
    x: {
      ticks: {
        display: false,
      },
      grid: {
        display: false,
      },
    },
  },
  datasets: {
    bar: {
      barPercentage: 0.5,
      categoryPercentage: 0.5,
    },
  },
};
</script>
