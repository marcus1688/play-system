<template>
  <button
    @click="handleClick"
    class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg lg:hover:bg-gray-200 flex items-center gap-2 transition-all justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
  >
    <Icon
      icon="material-symbols:refresh"
      class="w-5 h-5 max-md:w-4 max-md:h-4"
    />
    <span>{{ label }}</span>
  </button>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  label: {
    type: String,
    default: () => $t("reset"),
  },
});

const emit = defineEmits(["click"]);

const handleClick = () => {
  emit("click");
};
</script>

<style scoped>
button {
  transition: background-color 0.3s ease;
}
</style>
