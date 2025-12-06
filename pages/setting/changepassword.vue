<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("change_password") }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Form Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 max-md:p-4">
        <form @submit.prevent="handleSubmit" class="space-y-4 max-md:space-y-3">
          <!-- Current Password -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("current_password") }} *
            </label>
            <div class="relative">
              <input
                :type="showCurrentPassword ? 'text' : 'password'"
                v-model="form.currentPassword"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-md:p-2 max-md:text-sm"
                required
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 max-md:right-2"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <Icon
                  :icon="showCurrentPassword ? 'mdi:eye-off' : 'mdi:eye'"
                  class="max-md:w-5 max-md:h-5"
                />
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("new_password") }} *
            </label>
            <div class="relative">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                v-model="form.newPassword"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-md:p-2 max-md:text-sm"
                required
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 max-md:right-2"
                @click="showNewPassword = !showNewPassword"
              >
                <Icon
                  :icon="showNewPassword ? 'mdi:eye-off' : 'mdi:eye'"
                  class="max-md:w-5 max-md:h-5"
                />
              </button>
            </div>
          </div>

          <!-- Confirm New Password -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("confirm_new_password") }} *
            </label>
            <div class="relative">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="form.confirmPassword"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-md:p-2 max-md:text-sm"
                required
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 max-md:right-2"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <Icon
                  :icon="showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'"
                  class="max-md:w-5 max-md:h-5"
                />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end max-md:pt-2">
            <LoadingButton
              :loading="isLoading"
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
              :disabled="isLoading"
            >
              {{ $t("change_password_button") }}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const { post } = useApiEndpoint();
const isLoading = ref(false);
const isPageLoading = ref(false);
const form = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const { data } = await post("change-password", {
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword,
      confirmPassword: form.value.confirmPassword,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
      });
      form.value = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isLoading.value = false;
  }
};

useHead({
  title: "Play System | Change Password",
});
</script>
