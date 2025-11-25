<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="relative bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden w-full"
      >
        <!-- Modal Header -->
        <div class="p-4 border-b flex justify-between items-center max-md:p-3">
          <h3 class="text-xl font-semibold text-gray-800 max-md:text-lg">
            {{ $t("image_preview") }}
          </h3>
        </div>

        <!-- Modal Body -->
        <div class="p-4 max-md:p-3">
          <div
            class="relative flex items-center justify-center rounded-lg"
            style="min-height: 300px"
          >
            <div
              v-if="isLoading"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div
                class="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent max-md:h-6 max-md:w-6 max-md:border-2"
              ></div>
            </div>
            <img
              :src="imageUrl"
              alt="Full size preview"
              class="max-w-full max-h-[70vh] object-contain"
              @load="isLoading = false"
              @error="handleImageError"
            />
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t max-md:p-3">
          <div class="flex justify-end gap-3 max-md:gap-2 max-md:flex-col">
            <button
              @click="$emit('update:show', false)"
              class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full max-md:order-2"
            >
              {{ $t("close") }}
            </button>
            <a
              v-if="imageUrl"
              :href="imageUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 flex items-center gap-2 justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full max-md:order-1"
            >
              <Icon
                icon="material-symbols:open-in-new"
                class="max-md:w-4 max-md:h-4"
              />
              {{ $t("open_original") }}
            </a>
          </div>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { ref } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:show"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const isLoading = ref(true);

const handleImageError = () => {
  isLoading.value = false;
  Swal.fire({
    icon: "error",
    title: "Error",
    text: "Failed to load image",
  });
};

watch(
  () => props.imageUrl,
  () => {
    isLoading.value = true;
  }
);
</script>
