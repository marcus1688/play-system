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
              {{ $t("blog") }}
            </h2>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-6 max-md:space-y-4"
          >
            <!-- Image Upload -->
            <div>
              <span class="text-red-500 text-xs max-md:text-[10px]"
                >**{{ $t("image_size_limit") }}**</span
              >
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("blog_image") }}</label
              >
              <div
                class="mt-1 flex items-center gap-4 max-md:gap-2 max-md:flex-col max-md:items-start"
              >
                <input
                  type="file"
                  accept="image/*"
                  @change="handleImageChange"
                  class="w-full max-md:text-sm"
                />
                <img
                  v-if="imagePreview || initialData?.image"
                  :src="imagePreview || initialData?.image"
                  alt="Preview"
                  class="w-24 h-24 object-cover rounded max-md:w-20 max-md:h-20"
                />
              </div>
            </div>

            <!-- Titles -->
            <div class="grid grid-cols-1 gap-4 max-md:gap-3">
              <div>
                <div>
                  <MultiLangInput
                    v-model="formData"
                    :language-config="[
                      { code: 'en', name: 'English', field: 'title' },
                      { code: 'zh', name: '中文', field: 'titleCN' },
                      {
                        code: 'ms',
                        name: 'Melayu',
                        field: 'titleMS',
                      },
                    ]"
                    :label="$t(`title`)"
                    required
                    :placeholder="$t('blog_title_placeholder')"
                  />
                </div>
              </div>
            </div>

            <!-- Descriptions -->
            <div class="grid grid-cols-1 gap-4 max-md:gap-3">
              <div>
                <div>
                  <MultiLangInput
                    v-model="formData"
                    :language-config="[
                      { code: 'en', name: 'English', field: 'description' },
                      { code: 'zh', name: '中文', field: 'descriptionCN' },
                      {
                        code: 'ms',
                        name: 'Melayu',
                        field: 'titleMS',
                      },
                    ]"
                    :label="$t(`description`)"
                    required
                    :placeholder="$t('blog_description_placeholder')"
                  />
                </div>
              </div>
            </div>

            <!-- META -->
            <div class="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-3">
              <div>
                <MultiLangInput
                  v-model="formData"
                  :language-config="[
                    { code: 'en', name: 'English', field: 'metaTitle' },
                    { code: 'zh', name: '中文', field: 'metaTitleCN' },
                    {
                      code: 'ms',
                      name: 'Melayu',
                      field: 'metaDescriptionMS',
                    },
                  ]"
                  :label="$t(`meta_title`)"
                />
              </div>
              <div>
                <MultiLangInput
                  v-model="formData"
                  :language-config="[
                    { code: 'en', name: 'English', field: 'metaDescription' },
                    { code: 'zh', name: '中文', field: 'metaDescriptionCN' },
                    {
                      code: 'ms',
                      name: 'Melayu',
                      field: 'metaDescriptionMS',
                    },
                  ]"
                  :label="$t(`meta_description`)"
                />
              </div>
            </div>

            <!-- Content -->
            <div class="grid grid-cols-1 gap-4 max-md:gap-3">
              <div>
                <TiptapEditor
                  v-model="formData"
                  :language-config="[
                    { code: 'en', name: 'English', field: 'content' },
                    { code: 'zh', name: '中文', field: 'contentCN' },
                  ]"
                  :label="$t('content_label')"
                  :placeholder="$t('type_english_content')"
                  :upload-image="true"
                />
              </div>
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
  title: "",
  titleCN: "",
  description: "",
  descriptionCN: "",
  content: "",
  contentCN: "",
  metaTitle: "",
  metaTitleCN: "",
  metaDescription: "",
  metaDescriptionCN: "",
  isVisible: true,
});

const imageFile = ref(null);
const imagePreview = ref(null);

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const form = new FormData();
    if (imageFile.value) {
      form.append("image", imageFile.value);
    }
    Object.keys(formData.value).forEach((key) => {
      form.append(key, formData.value[key]);
    });
    const { data } = props.initialData?._id
      ? await put(`blogs/${props.initialData._id}`, form)
      : await post("blogs", form);
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
    isLoading.value = false;
  }
};

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        title: newData.title || "",
        titleCN: newData.titleCN || "",
        description: newData.description || "",
        descriptionCN: newData.descriptionCN || "",
        content: newData.content || "",
        contentCN: newData.contentCN || "",
        metaTitle: newData.metaTitle || "",
        metaTitleCN: newData.metaTitleCN || "",
        metaDescription: newData.metaDescription || "",
        metaDescriptionCN: newData.metaDescriptionCN || "",
        isVisible: newData.isVisible ?? true,
      };
      imagePreview.value = null;
      imageFile.value = null;
    } else {
      formData.value = {
        title: "",
        titleCN: "",
        description: "",
        descriptionCN: "",
        content: "",
        contentCN: "",
        metaTitle: "",
        metaTitleCN: "",
        metaDescription: "",
        metaDescriptionCN: "",
        isVisible: true,
      };
      imagePreview.value = null;
      imageFile.value = null;
    }
  },
  { immediate: true }
);
</script>
