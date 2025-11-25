<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[500px] p-6 max-w-full max-md:p-4">
        <div class="flex items-center justify-between mb-6 max-md:mb-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-base">
              {{ $t("update_sms_minimum_balance") }}
            </h2>
          </div>
        </div>
        <form @submit.prevent="handleSubmit" class="space-y-4 max-md:space-y-3">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("minimum_balance_threshold") }}
            </label>
            <input
              v-model="formData.minBalance"
              type="number"
              required
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              :placeholder="$t('enter_minimum_balance')"
            />
            <p class="text-sm text-gray-500 mt-1 max-md:text-xs max-md:mt-0.5">
              {{ $t("current_minimum_balance") }}: ${{
                formatAmount(currentMinBalance)
              }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600 max-md:text-xs">
              {{ $t("system_alert_notice") }}
            </p>
          </div>
          <div class="flex justify-end pt-4 max-md:pt-3">
            <LoadingButton
              :loading="isButtonLoading"
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              {{ $t("update_minimum_balance") }}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { formatAmount } from "~/utils/amountFormatter";

const props = defineProps({
  show: Boolean,
  currentMinBalance: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update:show", "submit"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const isButtonLoading = ref(false);
const formData = ref({
  minBalance: "",
});

const isValidInput = computed(() => {
  const amount = Number(formData.value.minBalance);
  return amount >= 0;
});

const handleSubmit = () => {
  if (!isValidInput.value) return;
  isButtonLoading.value = true;
  emit("submit", {
    minBalance: Number(formData.value.minBalance),
  });

  formData.value = {
    minBalance: "",
  };

  emit("update:show", false);
  isButtonLoading.value = false;
};
</script>
