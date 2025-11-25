<template>
  <div class="relative">
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      class="w-full px-4 py-2 border rounded-lg bg-white appearance-none cursor-pointer transition-colors lg:hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-md:px-2 max-md:py-1.5 max-md:text-sm"
    >
      <slot></slot>
    </select>
    <div
      class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none max-md:px-1.5"
    >
      <Icon
        icon="heroicons:chevron-down"
        class="h-5 w-5 text-gray-400 max-md:h-4 max-md:w-4"
      />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});
defineEmits(["update:modelValue"]);
</script>
