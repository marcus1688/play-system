<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[400px] shadow-lg max-w-full">
        <!-- Modal Header -->
        <div class="p-4 border-b max-md:p-3">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold max-md:text-base">
              {{ $t("update_password") }}
            </h3>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-4 max-md:p-3">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 max-md:space-y-3"
          >
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >
                {{ $t("new_password") }}
              </label>
              <input
                v-model="password"
                type="password"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                required
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >
                {{ $t("confirm_password") }}
              </label>
              <input
                v-model="confirmPassword"
                type="password"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                required
              />
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div
          class="p-4 border-t flex justify-end gap-3 max-md:p-3 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            @click="$emit('update:show', false)"
            class="px-4 py-2 text-gray-600 rounded lg:hover:bg-gray-100 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isButtonLoading"
            @click="handleSubmit"
            class="px-4 py-2 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("update") }}
          </LoadingButton>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  show: Boolean,
  userId: String,
});

const emit = defineEmits(["update:show", "updated"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const isButtonLoading = ref(false);
const password = ref("");
const confirmPassword = ref("");

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("passwords_do_not_match") || "Passwords do not match",
    });
    return;
  }
  isButtonLoading.value = true;
  try {
    const { put } = useApiEndpoint();
    const { data } = await put(`agent/${props.userId}/password`, {
      password: password.value,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("updated");
      emit("update:show", false);
      password.value = "";
      confirmPassword.value = "";
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value = false;
  }
};
</script>
