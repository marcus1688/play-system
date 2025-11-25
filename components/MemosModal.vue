<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-full max-w-2xl shadow-xl">
        <div class="flex items-center justify-between p-4 border-b max-md:p-3">
          <h3 class="text-lg font-medium max-md:text-base">
            {{ $t("create_new_memo") }}
          </h3>
        </div>
        <div class="p-6 space-y-4 max-md:p-4 max-md:space-y-3">
          <textarea
            v-model="memoText"
            rows="4"
            :placeholder="$t('enter_memo_text')"
            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-md:p-2 max-md:text-sm"
          ></textarea>

          <div
            v-if="previewUrls.length > 0"
            class="grid grid-cols-5 gap-4 max-md:grid-cols-3 max-md:gap-2"
          >
            <div
              v-for="(preview, index) in previewUrls"
              :key="index"
              class="relative"
            >
              <img
                :src="preview"
                alt="Preview"
                class="w-full h-24 object-cover rounded-lg border max-md:h-16"
              />
              <button
                @click="removeFile(index)"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 lg:hover:bg-red-600 max-md:-top-1 max-md:-right-1 max-md:p-0.5"
              >
                <Icon icon="mdi:close" class="w-4 h-4 max-md:w-3 max-md:h-3" />
              </button>
            </div>
          </div>

          <!-- Photo Upload Section -->
          <div
            class="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-2"
          >
            <input
              type="file"
              ref="fileInput"
              multiple
              accept="image/*"
              class="hidden"
              @change="handleFileSelect"
            />
            <button
              @click="$refs.fileInput.click()"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:w-full max-md:justify-center"
            >
              <Icon icon="mdi:camera" class="w-5 h-5 max-md:w-4 max-md:h-4" />
              {{ $t("add_photos") }}
            </button>
            <span class="text-sm text-gray-500 max-md:text-xs">{{
              $t("maximum_photos_allowed")
            }}</span>
          </div>
        </div>

        <div
          class="flex justify-end gap-2 px-6 py-4 bg-gray-50 rounded-b-lg max-md:px-4 max-md:py-3 max-md:flex-col-reverse"
        >
          <button
            @click="close"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isButtonLoading"
            @click="createMemo"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md lg:hover:bg-indigo-700 max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:w-full"
          >
            {{ $t("create") }}
          </LoadingButton>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue", "create", "close"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  close();
});
const isButtonLoading = ref(false);
const memoText = ref("");
const selectedFiles = ref([]);
const previewUrls = ref([]);
const fileInput = ref(null);

function close() {
  emit("close");
  memoText.value = "";
  selectedFiles.value = [];
  previewUrls.value = [];
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files);

  if (selectedFiles.value.length + files.length > 10) {
    Swal.fire({
      icon: "info",
      title: $t("info"),
      text: $t("max_photos_limit"),
    });
    event.target.value = "";
    return;
  }

  selectedFiles.value = [...selectedFiles.value, ...files];
  previewUrls.value = [
    ...previewUrls.value,
    ...files.map((file) => URL.createObjectURL(file)),
  ];
}

// function removeFile(index) {
//   selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
//   previewUrls.value = previewUrls.value.filter((_, i) => i !== index);
//   URL.revokeObjectURL(previewUrls.value[index]);
// }

function removeFile(index) {
  const removedUrl = previewUrls.value[index];
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
  previewUrls.value = previewUrls.value.filter((_, i) => i !== index);
  if (removedUrl) {
    URL.revokeObjectURL(removedUrl);
  }
}

const createMemo = () => {
  isButtonLoading.value = true;
  if (memoText.value.trim()) {
    emit("create", memoText.value, selectedFiles.value);
    close();
  }
  isButtonLoading.value = false;
};
</script>
