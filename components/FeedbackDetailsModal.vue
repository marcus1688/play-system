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
        <!-- Modal Header -->
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ $t("feedback_details") }}
            </h2>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6 max-md:p-4 max-md:space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-1 max-md:text-xs">
              {{ $t("problem_type") }}
            </h3>
            <p class="text-gray-900 max-md:text-sm">
              {{ feedback?.problemType }}
            </p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-1 max-md:text-xs">
              {{ $t("description") }}
            </h3>
            <p class="text-gray-900 max-md:text-sm">
              {{ feedback?.description }}
            </p>
          </div>

          <div v-if="feedback?.images?.length">
            <h3
              class="text-sm font-medium text-gray-500 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("images") }}
            </h3>
            <div class="grid grid-cols-5 gap-4 max-md:grid-cols-3 max-md:gap-2">
              <a
                v-for="(image, idx) in feedback.images"
                :key="idx"
                :href="image"
                target="_blank"
                rel="noopener noreferrer"
                class="cursor-pointer"
              >
                <img
                  :src="image"
                  class="max-w-[100px] h-auto object-cover rounded-lg max-md:max-w-full"
                  alt="Feedback image"
                />
              </a>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-6 border-t flex justify-end max-md:p-4">
          <button
            @click="$emit('update:show', false)"
            class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg lg:hover:bg-gray-200 max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
          >
            {{ $t("close") }}
          </button>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
defineProps({
  show: Boolean,
  feedback: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:show"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
</script>
