<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[800px] max-h-[90vh] overflow-y-auto max-w-full"
      >
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ initialData?._id ? $t("edit") : $t("create") }}
              {{ $t("review") }}
            </h2>
          </div>
        </div>

        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 max-md:space-y-3"
          >
            <div class="grid grid-cols-1 gap-4 max-md:gap-3">
              <div>
                <div>
                  <MultiLangInput
                    v-model="formData"
                    :language-config="[
                      {
                        code: 'en',
                        name: 'English',
                        field: 'titleEN',
                      },
                      { code: 'zh', name: '中文', field: 'titleCN' },
                      {
                        code: 'ms',
                        name: 'Melayu',
                        field: 'titleMS',
                      },
                    ]"
                    :label="$t(`title`)"
                  />
                </div>
              </div>

              <div>
                <div>
                  <MultiLangInput
                    v-model="formData"
                    :language-config="[
                      {
                        code: 'en',
                        name: 'English',
                        field: 'descriptionEN',
                      },
                      { code: 'zh', name: '中文', field: 'descriptionCN' },
                      {
                        code: 'ms',
                        name: 'Melayu',
                        field: 'descriptionMS',
                      },
                    ]"
                    :label="$t(`description`)"
                  />
                </div>
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                  >{{ $t("author") }}</label
                >
                <input
                  v-model="formData.author"
                  type="text"
                  required
                  class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                  >{{ $t("rating") }}</label
                >
                <CustomSelect v-model="formData.rating" required>
                  <option value="1">1</option>
                  <option value="1.5">1.5</option>
                  <option value="2">2</option>
                  <option value="2.5">2.5</option>
                  <option value="3">3</option>
                  <option value="3.5">3.5</option>
                  <option value="4">4</option>
                  <option value="4.5">4.5</option>
                  <option value="5">5</option>
                </CustomSelect>
              </div>
            </div>
          </form>
        </div>

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
            :loading="isButtonLoading"
            @click="handleSubmit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ initialData?._id ? $t("save") : $t("create") }}
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
const isButtonLoading = ref(false);
const formData = ref({
  titleEN: "",
  titleCN: "",
  titleMS: "",
  descriptionEN: "",
  descriptionCN: "",
  descriptionMS: "",
  rating: 5,
  author: "",
  isVisible: true,
});

const handleSubmit = async () => {
  isButtonLoading.value = true;
  try {
    const { data } = props.initialData?._id
      ? await put(`reviews/${props.initialData._id}`, formData.value)
      : await post("reviews/batch", { reviews: [formData.value] });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
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
    isButtonLoading.value = false;
  }
};

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      Object.keys(formData.value).forEach((key) => {
        formData.value[key] = newData[key] ?? "";
      });
    } else {
      Object.keys(formData.value).forEach((key) => {
        formData.value[key] =
          key === "rating" ? 5 : key === "isVisible" ? true : "";
      });
    }
  },
  { immediate: true }
);
</script>
