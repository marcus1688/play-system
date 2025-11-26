<template>
  <button
    @click="emit('click')"
    class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 flex items-center gap-2 transition-all justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm"
  >
    <Icon
      icon="material-symbols:search"
      class="w-5 h-5 max-md:w-4 max-md:h-4"
    />
    <span>{{ label || $t("search") }}</span>
  </button>
</template>

<script setup>
import { Icon } from "@iconify/vue";

defineProps({
  label: String,
});

const emit = defineEmits(["click"]);
</script>
