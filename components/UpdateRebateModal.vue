<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[500px] p-6 max-w-full max-md:p-4">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6 max-md:mb-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ $t("update_rebate") }}
            </h2>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4 max-md:space-y-3">
          <!-- Amount Field -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("rebate_amount") }}
            </label>
            <input
              v-model.number="amount"
              type="number"
              required
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              :placeholder="$t('enter_rebate_amount')"
            />
            <p class="text-sm text-gray-500 mt-1 max-md:text-xs max-md:mt-0.5">
              {{ $t("current_rebate") }}: {{ currency }}
              {{ formatAmount(currentRebate) }}
            </p>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end pt-4 max-md:pt-3">
            <LoadingButton
              :loading="isButtonLoading"
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              {{ $t("update_rebate_button") }}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatAmount } from "~/utils/amountFormatter";

const props = defineProps({
  show: Boolean,
  currentRebate: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update:show", "submit"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const isButtonLoading = ref(false);
const currency = useCurrency();
const amount = ref("");

const handleSubmit = () => {
  if (amount.value < 0) {
    Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("rebate_amount_negative"),
    });
    return;
  }
  isButtonLoading.value = true;
  emit("submit", amount.value);
  amount.value = "";
  emit("update:show", false);
  isButtonLoading.value = false;
};
</script>
