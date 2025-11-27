<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[400px] lg:min-w-[600px]">
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-orange-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ $t("change_password") }}
            </h2>
          </div>
        </div>

        <div class="p-4">
          <!-- Game Info -->
          <div
            class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 max-md:p-3 max-md:mb-3"
          >
            <div class="text-sm text-gray-500 max-md:text-xs">
              {{ $t("game_name") }}
            </div>
            <div class="font-semibold text-gray-800 max-md:text-sm">
              {{ game?.name }}
            </div>
          </div>

          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 max-md:space-y-3"
          >
            <!-- New Password -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("new_password") }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="formData.newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="$t('enter_new_password')"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10 max-md:px-3 max-md:py-1.5 max-md:text-sm"
                  required
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 lg:hover:text-gray-600"
                >
                  <Icon
                    :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'"
                    class="w-5 h-5 max-md:w-4 max-md:h-4"
                  />
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("confirm_password") }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="formData.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :placeholder="$t('confirm_new_password')"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10 max-md:px-3 max-md:py-1.5 max-md:text-sm"
                  required
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 lg:hover:text-gray-600"
                >
                  <Icon
                    :icon="showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'"
                    class="w-5 h-5 max-md:w-4 max-md:h-4"
                  />
                </button>
              </div>
            </div>

            <!-- Password Mismatch Warning -->
            <div
              v-if="formData.confirmPassword && !passwordsMatch"
              class="text-sm text-red-500 max-md:text-xs"
            >
              {{ $t("passwords_do_not_match") }}
            </div>
          </form>
        </div>

        <div
          class="p-6 border-t flex justify-end gap-3 max-md:p-4 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            @click="closeModal"
            :disabled="isLoading"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-100 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isLoading"
            @click="handleSubmit"
            :disabled="!isFormValid"
            class="px-4 py-2 bg-orange-600 text-white rounded-lg lg:hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("confirm") }}
          </LoadingButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  game: {
    type: Object,
    default: null,
  },
  userId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  if (!isLoading.value) {
    closeModal();
  }
});

const { post } = useApiEndpoint();
const isLoading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const formData = ref({
  newPassword: "",
  confirmPassword: "",
});

const passwordsMatch = computed(() => {
  return formData.value.newPassword === formData.value.confirmPassword;
});

const isFormValid = computed(() => {
  return (
    formData.value.newPassword.length >= 6 &&
    formData.value.confirmPassword.length >= 6 &&
    passwordsMatch.value
  );
});

const handleSubmit = async () => {
  if (!isFormValid.value) {
    if (!passwordsMatch.value) {
      await Swal.fire({
        icon: "warning",
        title: $t("warning"),
        text: $t("passwords_do_not_match"),
      });
      return;
    }
    if (formData.value.newPassword.length < 6) {
      await Swal.fire({
        icon: "warning",
        title: $t("warning"),
        text: $t("password_min_length"),
      });
      return;
    }
    return;
  }

  try {
    const result = await Swal.fire({
      title: $t("confirm_change_password"),
      text: $t("confirm_change_password_message"),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ea580c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });

    if (!result.isConfirmed) return;

    isLoading.value = true;

    const endpoint = `${props.game.changePasswordApi}/${props.userId}`;
    const { data } = await post(endpoint, {
      newpassword: formData.value.newPassword,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text:
          data.message?.[$locale.value] ||
          data.message?.en ||
          $t("password_changed_successfully"),
        timer: 1500,
      });
      emit("success");
      closeModal();
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text:
          data.message?.[$locale.value] ||
          data.message?.en ||
          $t("change_password_failed"),
      });
    }
  } catch (error) {
    console.error("Error changing password:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("change_password_failed"),
    });
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  formData.value = {
    newPassword: "",
    confirmPassword: "",
  };
  showPassword.value = false;
  showConfirmPassword.value = false;
  emit("update:show", false);
};
</script>
