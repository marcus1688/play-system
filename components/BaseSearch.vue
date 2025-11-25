<template>
  <div class="relative inline-block max-md:w-full">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      :placeholder="$t('search')"
      class="pl-10 pr-4 py-2 border rounded-lg w-64 text-sm lg:focus:outline-none lg:focus:ring-2 lg:focus:ring-indigo-500 max-md:w-full max-md:pl-9 max-md:pr-3 max-md:py-1.5 max-md:text-xs"
      @keyup.enter="$emit('search')"
    />
    <Icon
      icon="material-symbols:search"
      class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 max-md:left-2.5 max-md:w-4 max-md:h-4"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "search"]);
</script>
