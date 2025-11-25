<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto max-md:p-4 max-md:mx-2 max-md:max-h-[85vh]"
      >
        <div class="flex justify-between items-center mb-4 max-md:mb-3">
          <h3 class="text-lg font-semibold max-md:text-base">
            {{ $t("calculation_formula") }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 lg:hover:text-gray-600 transition-colors"
          >
            <Icon
              icon="material-symbols:close"
              class="w-6 h-6 max-md:w-5 max-md:h-5"
            />
          </button>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg border max-md:p-3">
          <pre
            class="text-sm whitespace-pre-wrap font-mono text-gray-800 leading-relaxed max-md:text-xs max-md:leading-relaxed"
            >{{ content }}</pre
          >
        </div>
        <div class="flex justify-end mt-4 max-md:mt-3">
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-600 text-white rounded-md lg:hover:bg-gray-700 transition-colors max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
          >
            {{ $t("close") }}
          </button>
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
    default: false,
  },
  content: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  closeModal();
});
const closeModal = () => {
  emit("close");
};
</script>
