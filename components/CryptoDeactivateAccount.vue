<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg p-6 w-[500px] max-w-full max-md:p-4">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-4 max-md:mb-3">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              Deactivate Account
            </h2>
          </div>
          <button
            @click="$emit('update:show', false)"
            class="text-gray-500 lg:hover:text-gray-700"
          >
            <Icon
              icon="material-symbols:close"
              class="w-6 h-6 max-md:w-5 max-md:h-5"
            />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4 max-md:space-y-3">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >Account ID</label
            >
            <input
              type="text"
              v-model="accountId"
              placeholder="Enter account ID"
              required
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>

          <!-- Submit Button -->
          <div
            class="flex justify-end gap-3 pt-4 max-md:pt-3 max-md:gap-2 max-md:flex-col-reverse"
          >
            <button
              type="button"
              @click="$emit('update:show', false)"
              class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              Cancel
            </button>
            <LoadingButton
              :loading="isLoading"
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              Deactivate
            </LoadingButton>
          </div>
        </form>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  show: Boolean,
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:show", "submit"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const accountId = ref("");

const handleSubmit = () => {
  emit("submit", accountId.value);
  accountId.value = "";
};
</script>
