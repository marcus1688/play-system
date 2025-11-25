<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[900px] max-h-[90vh] overflow-y-auto max-w-full"
      >
        <!-- Modal Header -->
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ initialData?._id ? $t("edit") : $t("create") }}
              {{ $t("announcement") }}
            </h2>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-6 max-md:space-y-4"
          >
            <!-- Titles -->
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
            </div>

            <!-- Content -->
            <div class="grid grid-cols-1 gap-4 max-md:gap-3">
              <div>
                <div>
                  <MultiLangInput
                    v-model="formData"
                    :language-config="[
                      {
                        code: 'en',
                        name: 'English',
                        field: 'contentEN',
                      },
                      { code: 'zh', name: '中文', field: 'contentCN' },
                      {
                        code: 'ms',
                        name: 'Melayu',
                        field: 'contentMS',
                      },
                    ]"
                    :label="$t(`content`)"
                  />
                </div>
              </div>
            </div>

            <!-- Category -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("category") }}
              </label>
              <CustomSelect v-model="formData.category" required>
                <option value="">{{ $t("select_category") }}</option>
                <option
                  v-for="category in categories"
                  :key="category._id"
                  :value="category.name"
                >
                  {{ category.name }}
                </option>
              </CustomSelect>
            </div>

            <!-- Visibility -->
            <div class="flex items-center gap-2">
              <BaseToggleSwitch v-model="formData.isVisible" />
              <span class="text-sm text-gray-600 max-md:text-xs">
                {{ formData.isVisible ? $t("visible") : $t("hidden") }}
              </span>
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
  categories: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const { post, put } = useApiEndpoint();
const isLoading = ref(false);

const defaultFormState = {
  titleEN: "",
  titleCN: "",
  titleMS: "",
  contentEN: "",
  contentCN: "",
  contentMS: "",
  category: "",
  isVisible: true,
};

const formData = ref({
  titleEN: "",
  titleCN: "",
  titleMS: "",
  contentEN: "",
  contentCN: "",
  contentMS: "",
  category: "",
  isVisible: true,
});

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const { data } = props.initialData?._id
      ? await put(`announcements/${props.initialData._id}`, formData.value)
      : await post("announcements", formData.value);

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      formData.value = { ...defaultFormState };
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
      titleEN: newData?.titleEN || "",
      titleCN: newData?.titleCN || "",
      titleMS: newData?.titleMS || "",
      contentEN: newData?.contentEN || "",
      contentCN: newData?.contentCN || "",
      contentMS: newData?.contentMS || "",
      category: newData?.category || "",
      isVisible: newData?.isVisible ?? true,
    };
  },
  { immediate: true }
);
</script>
