<template>
  <button
    :disabled="loading"
    class="relative flex items-center justify-center overflow-hidden"
    v-bind="$attrs"
  >
    <span :class="{ 'opacity-0': loading }">
      <slot></slot>
    </span>
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="flex items-center space-x-1">
        <div class="bounce-dot"></div>
        <div class="bounce-dot animation-delay-200"></div>
        <div class="bounce-dot animation-delay-400"></div>
      </div>
    </div>
  </button>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.bounce-dot {
  width: 6px;
  height: 6px;
  background-color: white;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
}
</style>
