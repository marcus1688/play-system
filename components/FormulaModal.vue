<template>
  <Teleport to="body"
    ><div
      v-if="show"
      class="fixed inset-0 !bg-black/40 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[600px] max-h-[80vh] overflow-y-auto max-w-full"
      >
        <!-- Modal Header -->
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 max-md:gap-3">
              <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
              <h2 class="text-xl font-semibold max-md:text-lg">
                {{ $t("formula_details") }}
              </h2>
            </div>
          </div>
        </div>

        <div class="p-6 max-md:p-4">
          <div
            class="text-gray-600 whitespace-pre-wrap break-words text-left max-md:text-sm"
            v-html="formula.replace(/\n/g, '<br>')"
          ></div>
        </div>

        <div class="p-6 border-t flex justify-end max-md:p-4">
          <button
            @click="$emit('update:show', false)"
            class="px-4 py-2 border rounded-lg bg-indigo-600 text-white lg:hover:bg-indigo-700 max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
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

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  formula: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:show"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
</script>
