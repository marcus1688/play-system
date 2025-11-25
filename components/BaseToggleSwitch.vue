<template>
  <div class="flex items-center">
    <label class="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        :checked="modelValue"
        @input="$emit('update:modelValue', $event.target.checked)"
        class="sr-only peer"
      />
      <div
        class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"
      ></div>
    </label>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["update:modelValue"]);
</script>
