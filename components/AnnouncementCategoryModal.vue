<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[500px] max-w-full">
        <!-- Modal Header -->
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ initialData?._id ? $t("edit") : $t("create") }}
              {{ $t("category") }}
            </h2>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 max-md:space-y-3"
          >
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("category_name") }}
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div
          class="p-6 border-t flex justify-end gap-3 max-md:p-4 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            type="button"
            @click="$emit('update:show', false)"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isLoading"
            @click="handleSubmit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ initialData?._id ? $t("save_changes") : $t("create") }}
          </LoadingButton>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  initialData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const { post, put } = useApiEndpoint();
const isLoading = ref(false);

const formData = ref({
  name: "",
});

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const { data } = await post("categories", formData.value);

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      formData.value = { name: "" };
      emit("success");
      emit("update:show", false);
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

watch(
  () => props.initialData,
  (newData) => {
    formData.value = {
      name: newData?.name || "",
    };
  },
  { immediate: true }
);
</script>
