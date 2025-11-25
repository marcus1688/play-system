<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div class="flex items-center justify-between p-4 border-b max-md:p-3">
          <h3 class="text-lg font-medium text-red-600 max-md:text-base">
            {{ getModalTitle() }}
          </h3>
          <button
            @click="$emit('update:modelValue', false)"
            class="text-gray-400 lg:hover:text-gray-600"
          >
            <Icon icon="mdi:close" class="w-6 h-6 max-md:w-5 max-md:h-5" />
          </button>
        </div>
        <div class="p-6 max-md:p-4">
          <div class="mb-4 max-md:mb-3">
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("rejection_reason") }} ({{ $t("optional") }})
            </label>
            <textarea
              ref="rejectReasonTextarea"
              v-model="additionalRemarks"
              rows="3"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none reject-reason-input max-md:px-2 max-md:py-1.5 max-md:text-sm"
              :placeholder="getPlaceholder()"
              maxlength="500"
              data-reject-reason="true"
              @input="handleTextareaInput"
              @focus="isTextareaFocused = true"
              @blur="isTextareaFocused = false"
            ></textarea>
          </div>
          <div
            v-if="validationError"
            class="text-red-500 text-sm mb-4 max-md:text-xs max-md:mb-3"
          >
            {{ validationError }}
          </div>
        </div>
        <div
          class="flex justify-end gap-2 px-6 py-4 bg-gray-50 rounded-b-lg max-md:px-4 max-md:py-3 max-md:flex-col-reverse"
        >
          <button
            @click="$emit('update:modelValue', false)"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isButtonLoading"
            @click="handleConfirm"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md lg:hover:bg-red-700 max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:w-full"
          >
            {{ $t("confirm_rejection") }}
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
  transactionData: {
    type: Object,
    default: () => ({}),
  },
  transactionType: {
    type: String, // 'withdraw', 'deposit', 'bonus'
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:modelValue", false);
});
const isButtonLoading = ref(false);
const additionalRemarks = ref("");
const validationError = ref("");
const rejectReasonTextarea = ref(null);
const isTextareaFocused = ref(false);

const getModalTitle = () => {
  const titleMap = {
    withdraw: $t("withdraw_rejection"),
    deposit: $t("deposit_rejection"),
    bonus: $t("bonus_rejection"),
  };
  return titleMap[props.transactionType] || $t("transaction_rejection");
};

const getPlaceholder = () => {
  const placeholderMap = {
    withdraw: $t("enter_withdraw_reject_reason"),
    deposit: $t("enter_deposit_reject_reason"),
    bonus: $t("enter_bonus_reject_reason"),
  };
  return (
    placeholderMap[props.transactionType] || $t("enter_additional_remarks")
  );
};

const getDefaultRemark = () => {
  const defaultMap = {
    withdraw: "Withdraw request rejected",
    deposit: "Deposit request rejected",
    bonus: "Bonus request rejected",
  };
  return defaultMap[props.transactionType] || "Transaction rejected";
};

const handleConfirm = async () => {
  isButtonLoading.value = true;
  validationError.value = "";

  try {
    const rejectRemark = additionalRemarks.value.trim() || getDefaultRemark();

    emit("confirm", {
      transactionId: props.transactionData._id,
      transactionType: props.transactionType,
      rejectRemark: rejectRemark,
    });

    additionalRemarks.value = "";
    emit("update:modelValue", false);
  } catch (error) {
    console.error("Error in rejection confirmation:", error);
    validationError.value = $t("general_error");
  } finally {
    isButtonLoading.value = false;
  }
};

const handleKeydown = (event) => {
  if (event.code === "Space" && props.modelValue && !isButtonLoading.value) {
    const activeElement = document.activeElement;
    const isInTextarea =
      activeElement && activeElement === rejectReasonTextarea.value;
    const hasContent = additionalRemarks.value.trim().length > 0;
    if (isInTextarea || hasContent || isTextareaFocused.value) {
      return;
    }
    event.preventDefault();
    handleConfirm();
  }
};

const handleTextareaInput = () => {
  isTextareaFocused.value = true;
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      additionalRemarks.value = "";
      validationError.value = "";
    }
  }
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>
