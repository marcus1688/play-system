<template>
  <div :class="['loading-container', { small, medium, large }]">
    <div class="spinner">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
    <div v-if="showText" class="loading-text">{{ text }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    default: () => "Loading...",
  },
  showText: {
    type: Boolean,
    default: false,
  },
  small: {
    type: Boolean,
    default: false,
  },
  medium: {
    type: Boolean,
    default: true,
  },
  large: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-text {
  margin-top: 10px;
  color: #4b5563; /* Gray-600 */
  font-size: 0.875rem;
}

.spinner {
  display: flex;
  gap: 4px;
}

.spinner > div {
  width: 12px;
  height: 12px;
  background-color: #4f46e5; /* Indigo-600 */
  border-radius: 100%;
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out both;
}

.small .spinner > div {
  width: 8px;
  height: 8px;
}

.medium .spinner > div {
  width: 12px;
  height: 12px;
}

.large .spinner > div {
  width: 16px;
  height: 16px;
}

.spinner .bounce1 {
  animation-delay: -0.32s;
}

.spinner .bounce2 {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>
```
