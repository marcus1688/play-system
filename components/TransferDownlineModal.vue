<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[500px] p-6 max-w-full max-md:p-4">
        <div class="flex items-center justify-between mb-6 max-md:mb-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ $t("transfer_downline") }}
            </h2>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 max-md:space-y-3">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("username") }}
            </label>
            <input
              v-model="formData.username"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              :placeholder="$t('enter_username')"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("new_agent_username") }}
            </label>
            <input
              v-model="formData.newAgentUsername"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              :placeholder="$t('enter_new_agent_username')"
            />
          </div>

          <div
            class="flex justify-end gap-3 pt-4 max-md:flex-col-reverse max-md:gap-2 max-md:pt-3"
          >
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              {{ $t("cancel") }}
            </button>
            <LoadingButton
              :loading="isLoading"
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              {{ $t("transfer") }}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div></Teleport
  >
</template>

<script setup>
const props = defineProps({
  show: Boolean,
});
const emit = defineEmits(["update:show", "userUpdated"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const { publicPost } = useApiEndpoint();
const isLoading = ref(false);
const formData = ref({
  username: "",
  newAgentUsername: "",
});

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const { data } = await publicPost("transfer-referral", formData.value);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });

      emit("userUpdated");
      closeModal();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error transferring downline:", error);
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

const closeModal = () => {
  formData.value = {
    username: "",
    newAgentUsername: "",
  };
  emit("update:show", false);
};

watch(
  () => props.show,
  (newValue) => {
    if (!newValue) {
      formData.value = {
        username: "",
        newAgentUsername: "",
      };
    }
  }
);
</script>
