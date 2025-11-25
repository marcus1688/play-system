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
              {{ props.initialData._id ? $t("edit") : $t("create") }}
              {{ $t("popup") }}
            </h2>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-6 max-md:space-y-4"
          >
            <div class="grid grid-cols-1 gap-4 max-md:gap-3">
              <div>
                <TiptapEditor
                  v-model="formData"
                  :language-config="[
                    { code: 'en', name: 'English', field: 'titleEN' },
                    { code: 'zh', name: '中文', field: 'titleCN' },
                    { code: 'ms', name: 'Melayu', field: 'titleMS' },
                  ]"
                  :label="$t('title_label')"
                  :placeholder="$t('type_english_title')"
                />
              </div>

              <div>
                <TiptapEditor
                  v-model="formData"
                  :language-config="[
                    { code: 'en', name: 'English', field: 'contentEN' },
                    { code: 'zh', name: '中文', field: 'contentCN' },
                    { code: 'ms', name: 'Melayu', field: 'contentMS' },
                  ]"
                  :label="$t('content_label')"
                  :placeholder="$t('type_english_content')"
                  :upload-image="true"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                  >{{ $t("media") }}</label
                >
                <div
                  class="mb-3 max-md:mb-2"
                  v-if="mediaPreview || props.initialData.image"
                >
                  <video
                    v-if="isVideo(mediaPreview || props.initialData.image)"
                    :src="mediaPreview || props.initialData.image"
                    class="w-96 h-auto p-2 rounded max-md:w-full max-md:p-1"
                    controls
                    autoplay
                    muted
                    preload="auto"
                  />
                  <img
                    v-else
                    :src="mediaPreview || props.initialData.image"
                    alt="Popup Media Preview"
                    class="w-96 h-auto p-2 rounded object-contain max-md:w-full max-md:p-1"
                  />
                </div>

                <input
                  type="file"
                  @change="handleFileChange"
                  accept="image/*,video/*"
                  class="w-full max-md:text-sm"
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
            :loading="isButtonLoading"
            @click="handleSubmit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ props.initialData._id ? $t("save") : $t("create") }}
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
    required: true,
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const isButtonLoading = ref(false);
const { publicPut, publicPost } = useApiEndpoint();

const formData = ref({
  titleEN: "",
  titleCN: "",
  titleMS: "",
  contentEN: "",
  contentCN: "",
  contentMS: "",
  status: true,
  company: "",
});

const mediaPreview = ref(null);
const mediaType = ref(null);
const fileInput = ref(null);

const isVideo = (url) => {
  if (!url) return false;
  if (typeof url === "object" && url instanceof File) {
    return url.type.startsWith("video/");
  }
  if (url.startsWith("data:")) {
    return url.startsWith("data:video/");
  }
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
  return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    fileInput.value = file;
    mediaType.value = file.type;
    const reader = new FileReader();
    reader.onload = (e) => {
      mediaPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};
const handleSubmit = async () => {
  isButtonLoading.value = true;
  try {
    const form = new FormData();
    if (fileInput.value) {
      form.append("image", fileInput.value);
    }
    Object.keys(formData.value).forEach((key) => {
      if (formData.value[key] !== "") {
        form.append(key, formData.value[key]);
      }
    });
    const { data } = await (props.initialData._id
      ? publicPut(`popup/${props.initialData._id}`, form)
      : publicPost("popup", form));
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
        formData.value[key] = newData[key] || "";
      });
    }
  },
  { immediate: true }
);
</script>
