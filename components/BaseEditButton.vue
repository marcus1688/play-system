<template>
  <button
    @click="$emit('click')"
    class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 flex items-center gap-2 justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm"
  >
    <Icon icon="material-symbols:edit" class="w-5 h-5 max-md:w-4 max-md:h-4" />
    <span>{{ $t("edit") }}</span>
  </button>
</template>

<script setup>
import { Icon } from "@iconify/vue";

defineEmits(["click"]);
</script>
