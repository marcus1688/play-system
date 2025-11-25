<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 flex items-center justify-center z-[999] bg-black/30 backdrop-blur-sm page-loading p-4 max-md:p-3"
    >
      <div class="flex flex-col items-center p-10 max-md:p-6">
        <div class="neon-loader mb-8 max-md:mb-6 max-md:scale-75">
          <div class="spinner-outer">
            <div class="spinner-inner"></div>
            <div class="spinner-center"></div>
          </div>
        </div>

        <div
          class="text-white text-xl font-medium tracking-wider mb-4 loading-text max-md:text-lg max-md:mb-3"
        >
          {{ $t("loading") }}
        </div>

        <div class="progress-container max-md:scale-90">
          <div class="progress-bar"></div>
        </div>
      </div></div
  ></Teleport>
</template>

<script setup></script>

<style scoped>
.neon-loader {
  position: relative;
  width: 100px;
  height: 100px;
}

.spinner-outer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #38bdf8;
  border-right-color: #818cf8;
  border-bottom-color: #c084fc;
  animation: spin 1.5s linear infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));
}

.spinner-inner {
  width: 70%;
  height: 70%;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #e879f9;
  border-left-color: #f472b6;
  animation: spin 2s linear infinite reverse;
}

.spinner-center {
  position: absolute;
  width: 30%;
  height: 30%;
  border-radius: 50%;
  background: radial-gradient(circle, #f0f9ff 0%, #38bdf8 100%);
  animation: pulse 1.5s ease-in-out infinite alternate;
  filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.6));
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.1);
    opacity: 1;
  }
}

.loading-text {
  position: relative;
  overflow: hidden;
  display: inline-block;
  letter-spacing: 0.15em;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 1) 50%,
    rgba(255, 255, 255, 0.8) 100%
  );
  background-size: 200% auto;
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  animation: shine 2s linear infinite;
}

@keyframes shine {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.progress-container {
  width: 200px;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.2);
  overflow: hidden;
  position: relative;
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 30%;
  background-color: white;
  animation: progress 1.2s infinite ease-in-out;
}

@keyframes progress {
  0% {
    left: -30%;
  }
  100% {
    left: 100%;
  }
}
</style>
