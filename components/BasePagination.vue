<template>
  <div
    class="flex items-center justify-end px-6 py-3 border-t max-md:px-4 max-md:py-2 max-md:justify-center"
  >
    <div
      class="flex items-center space-x-2 max-md:space-x-1 flex-wrap max-md:justify-center max-md:gap-1"
    >
      <!-- Previous Button -->
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 lg:hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed max-md:px-2 max-md:py-1 max-md:text-xs"
      >
        <Icon icon="ooui:previous-ltr" class="w-4 h-auto max-md:w-3" />
      </button>

      <!-- First Page -->
      <button
        v-if="showFirstPage"
        @click="goToPage(1)"
        class="px-3 py-1 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 lg:hover:bg-gray-50 max-md:px-2 max-md:py-1 max-md:text-xs"
      >
        1
      </button>
      <span
        v-if="showFirstPage && currentPage > range + 2"
        class="max-md:text-xs"
        >...</span
      >

      <!-- Page Numbers -->
      <button
        v-for="page in pageNumbers"
        :key="page"
        @click="goToPage(page)"
        :class="[
          'px-3 py-1 rounded-md text-sm font-medium max-md:px-2 max-md:py-1 max-md:text-xs',
          currentPage === page
            ? 'bg-indigo-600 text-white'
            : 'bg-white border border-gray-300 text-gray-700 lg:hover:bg-gray-50',
        ]"
      >
        {{ page }}
      </button>

      <!-- Last Page -->
      <span
        v-if="showLastPage && currentPage < totalPages - range - 1"
        class="max-md:text-xs"
        >...</span
      >
      <button
        v-if="showLastPage"
        @click="goToPage(totalPages)"
        class="px-3 py-1 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 lg:hover:bg-gray-50 max-md:px-2 max-md:py-1 max-md:text-xs"
      >
        {{ totalPages }}
      </button>

      <!-- Next Button -->
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 lg:hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed max-md:px-2 max-md:py-1 max-md:text-xs"
      >
        <Icon icon="ooui:next-ltr" class="w-4 h-auto max-md:w-3" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  range: {
    type: Number,
    default: 2,
  },
});

const emit = defineEmits(["update:modelValue"]);

const currentPage = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    currentPage.value = page;
  }
};

const pageNumbers = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - props.range);
  const end = Math.min(props.totalPages, currentPage.value + props.range);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const showFirstPage = computed(() => currentPage.value > props.range + 1);
const showLastPage = computed(
  () => currentPage.value < props.totalPages - props.range
);
</script>
