<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center custom-modal z-[999] p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white p-4 rounded-lg max-w-lg w-full max-md:p-3">
        <div class="flex flex-col">
          <div
            v-if="hasImages && imageUrls.length > 1"
            class="flex justify-center mb-2 max-md:mb-1.5"
          >
            <span class="text-sm text-gray-600 max-md:text-xs">
              {{ currentImageIndex + 1 }}/{{ imageUrls.length }}
            </span>
          </div>

          <template v-if="hasImages">
            <div class="mb-4 relative max-md:mb-3">
              <div
                v-if="isImageLoading"
                class="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg max-md:h-[300px]"
              >
                <div class="flex flex-col items-center gap-4 max-md:gap-3">
                  <div
                    class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 max-md:h-8 max-md:w-8"
                  ></div>
                  <span class="text-gray-600 max-md:text-sm"
                    >{{ $t("loading") }}...</span
                  >
                </div>
              </div>
              <img
                v-show="!isImageLoading && !hasImageError"
                :src="currentImageUrl"
                alt="Receipt"
                class="w-full max-h-[700px] object-contain rounded-lg cursor-pointer max-md:max-h-[500px]"
                @load="handleImageLoad"
                @error="handleImageError"
                @click="openImageInNewTab"
              />
              <div
                v-if="hasImageError"
                class="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg max-md:h-[300px]"
              >
                <div
                  class="flex flex-col items-center gap-4 text-center max-md:gap-3"
                >
                  <Icon
                    icon="mdi:image-broken"
                    class="w-12 h-12 text-gray-400 max-md:w-8 max-md:h-8"
                  />
                  <span class="text-gray-600 max-md:text-sm">{{
                    $t("failed_to_load_image")
                  }}</span>
                </div>
              </div>
              <button
                v-if="imageUrls.length > 1 && currentImageIndex > 0"
                @click="previousImage"
                class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full lg:hover:bg-opacity-70 transition-all max-md:left-1 max-md:p-1.5"
              >
                <Icon
                  icon="mdi:chevron-left"
                  class="w-6 h-6 max-md:w-5 max-md:h-5"
                />
              </button>

              <button
                v-if="
                  imageUrls.length > 1 &&
                  currentImageIndex < imageUrls.length - 1
                "
                @click="nextImage"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full lg:hover:bg-opacity-70 transition-all max-md:right-1 max-md:p-1.5"
              >
                <Icon
                  icon="mdi:chevron-right"
                  class="w-6 h-6 max-md:w-5 max-md:h-5"
                />
              </button></div
          ></template>

          <template v-else>
            <div class="mb-4 max-md:mb-3">
              <div
                class="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg max-md:h-[300px]"
              >
                <div
                  class="flex flex-col items-center gap-4 text-center max-md:gap-3"
                >
                  <Icon
                    icon="mdi:image-off"
                    class="w-16 h-16 text-gray-400 max-md:w-12 max-md:h-12"
                  />
                  <span class="text-gray-600 text-lg max-md:text-base">{{
                    $t("no_upload_image")
                  }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Click to view instruction -->
          <div
            v-if="hasImages && !isImageLoading && !hasImageError"
            class="text-center mb-2 max-md:mb-1.5"
          >
            <span class="text-xs text-gray-500 max-md:text-[10px]">
              {{ $t("click_image_to_view_full_size") }}
            </span>
          </div>

          <div class="flex justify-center">
            <button
              @click="$emit('update:show', false)"
              class="w-[30%] px-4 py-2 bg-red-500 text-white rounded lg:hover:bg-red-600 transition-colors max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
            >
              {{ $t("close") }}
            </button>
          </div>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  imageUrls: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:show"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const isImageLoading = ref(true);
const hasImageError = ref(false);
const currentImageIndex = ref(0);

const imageUrls = computed(() => {
  if (props.imageUrls && props.imageUrls.length > 0) {
    return props.imageUrls;
  }
  if (props.imageUrl) {
    return [props.imageUrl];
  }
  return [];
});

const currentImageUrl = computed(() => {
  return imageUrls.value[currentImageIndex.value] || "";
});

const openImageInNewTab = () => {
  if (currentImageUrl.value) {
    window.open(currentImageUrl.value, "_blank");
  }
};

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

const nextImage = () => {
  if (currentImageIndex.value < imageUrls.value.length - 1) {
    currentImageIndex.value++;
  }
};

const handleImageLoad = () => {
  isImageLoading.value = false;
  hasImageError.value = false;
};

const handleImageError = () => {
  isImageLoading.value = false;
  hasImageError.value = true;
};

const resetState = () => {
  if (!hasImages.value) {
    return;
  }
  isImageLoading.value = true;
  hasImageError.value = false;
  currentImageIndex.value = 0;
};

const hasImages = computed(() => {
  return imageUrls.value.length > 0;
});

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      resetState();
    }
  }
);

watch(
  [() => props.imageUrl, () => props.imageUrls],
  () => {
    if (props.show) {
      resetState();
    }
  },
  { deep: true }
);

watch(currentImageIndex, () => {
  if (props.show) {
    isImageLoading.value = true;
    hasImageError.value = false;
  }
});
</script>
