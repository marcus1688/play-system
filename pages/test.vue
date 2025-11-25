<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4"
  >
    <div class="max-w-2xl w-full px-8 py-12 bg-white rounded-2xl shadow-xl">
      <div class="text-center">
        <!-- Decorative Element -->
        <div class="relative mb-8">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-32 h-32 bg-indigo-100 rounded-full opacity-50"></div>
          </div>
          <div class="relative">
            <span class="text-8xl font-bold text-indigo-600">
              {{ error?.statusCode === 404 ? "404" : error?.statusCode }}
            </span>
          </div>
        </div>

        <!-- Error Message -->
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          {{
            error?.statusCode === 404
              ? "Page Not Found"
              : error?.message || "Something went wrong"
          }}
        </h1>

        <!-- Description -->
        <p class="text-lg text-gray-600 mb-8">
          {{
            error?.statusCode === 404
              ? "The page you're looking for doesn't exist or has been moved."
              : "We apologize for the inconvenience. Please try again later."
          }}
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="handleError"
            class="group relative px-6 py-3 bg-indigo-600 text-white rounded-lg overflow-hidden transition-all duration-300 lg:hover:bg-indigo-700"
          >
            <span class="relative z-10 flex items-center justify-center gap-2">
              <Icon icon="heroicons:home" class="w-5 h-5" />
              Back to Home
            </span>
            <div
              class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </button>

          <button
            @click="() => window.history.back()"
            class="group px-6 py-3 bg-gray-100 text-gray-700 rounded-lg lg:hover:bg-gray-200 transition-all duration-300"
          >
            <span class="flex items-center justify-center gap-2">
              <Icon icon="heroicons:arrow-left" class="w-5 h-5" />
              Go Back
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

// 使用 useError 获取错误信息
const error = useError();

const handleError = () => {
  clearError();
  navigateTo("/");
};
</script>

<style scoped>
.bg-gradient-overlay {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
}
</style>
