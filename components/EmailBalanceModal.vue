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
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ $t("update_email_balance") }}
            </h2>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 max-md:space-y-3">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("operation") }}
            </label>
            <CustomSelect v-model="formData.operation" required>
              <option value="add">{{ $t("add_balance") }}</option>
              <option value="subtract">{{ $t("subtract_balance") }}</option>
            </CustomSelect>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("amount") }}
            </label>
            <input
              v-model="formData.amount"
              type="number"
              required
              min="0"
              step="0.0001"
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              :placeholder="$t('enter_amount')"
            />
            <p class="text-sm text-gray-500 mt-1 max-md:text-xs max-md:mt-0.5">
              {{ $t("current_balance") }}: ${{ currentBalance }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-600 max-md:text-xs">
              {{ $t("new_balance_will_be") }}: ${{ calculateNewBalance }}
            </p>
          </div>

          <div class="flex justify-end pt-4 max-md:pt-3">
            <LoadingButton
              :loading="isButtonLoading"
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
            >
              {{ $t("update_balance") }}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div></Teleport
  >
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  currentBalance: {
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
  operation: "add",
  amount: "",
});

const calculateNewBalance = computed(() => {
  const amount = Number(formData.value.amount) || 0;
  return formData.value.operation === "add"
    ? props.currentBalance + amount
    : props.currentBalance - amount;
});

const isValidOperation = computed(() => {
  if (!formData.value.amount) return false;
  if (formData.value.operation === "subtract") {
    return calculateNewBalance.value >= 0;
  }
  return true;
});

const handleSubmit = () => {
  if (!isValidOperation.value) return;
  isButtonLoading.value = true;
  emit("submit", {
    operation: formData.value.operation,
    amount: Number(formData.value.amount),
  });

  formData.value = {
    operation: "add",
    amount: "",
  };

  emit("update:show", false);
  isButtonLoading.value = false;
};
</script>
