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
              {{ $t("adjust_gateway_balance") }}
            </h2>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 max-md:space-y-3">
          <div class="bg-gray-50 p-3 rounded-lg max-md:p-2">
            <p class="text-sm text-gray-600 max-md:text-xs">
              {{ $t("payment_gateway") }}
            </p>
            <p class="text-lg font-semibold max-md:text-base">
              {{ gateway?.name }}
            </p>
          </div>

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
              step="0.01"
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              :placeholder="$t('enter_amount')"
            />
            <p class="text-sm text-gray-500 mt-1 max-md:text-xs max-md:mt-0.5">
              {{ $t("current_balance") }}: {{ formatCurrency(currentBalance) }}
            </p>
          </div>

          <div
            class="bg-blue-50 p-3 rounded-lg max-md:p-2"
            :class="
              calculateNewBalance < 0
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50'
            "
          >
            <p class="text-sm text-gray-600 max-md:text-xs">
              {{ $t("new_balance_will_be") }}:
            </p>
            <p
              class="text-xl font-bold max-md:text-lg"
              :class="
                calculateNewBalance >= 0 ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ formatCurrency(calculateNewBalance) }}
            </p>
          </div>

          <div
            v-if="calculateNewBalance < 0"
            class="bg-red-50 border border-red-200 p-3 rounded-lg max-md:p-2"
          >
            <p class="text-sm text-red-600 max-md:text-xs">
              ⚠️ {{ $t("negative_balance_warning") }}
            </p>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("remark") }}
            </label>
            <textarea
              v-model="formData.remark"
              rows="3"
              required
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm resize-none"
              :placeholder="$t('enter_adjustment_reason')"
            ></textarea>
          </div>

          <div class="flex gap-3 pt-4 max-md:pt-3 max-md:flex-col">
            <button
              type="button"
              @click="handleCancel"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm"
            >
              {{ $t("cancel") }}
            </button>
            <LoadingButton
              :loading="isButtonLoading"
              type="submit"
              :disabled="!isValidOperation"
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed max-md:px-3 max-md:py-1.5 max-md:text-sm"
            >
              {{ $t("confirm_adjustment") }}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  gateway: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});

const { publicPatch } = useApiEndpoint();
const currency = useCurrency();
const isButtonLoading = ref(false);

const formData = ref({
  operation: "add",
  amount: "",
  remark: "",
});

const currentBalance = computed(() => props.gateway?.balance || 0);

const calculateNewBalance = computed(() => {
  const amount = Number(formData.value.amount) || 0;
  return formData.value.operation === "add"
    ? currentBalance.value + amount
    : currentBalance.value - amount;
});

const isValidOperation = computed(() => {
  if (!formData.value.amount || !formData.value.remark) return false;
  return true;
});

const formatCurrency = (value) => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.value,
  }).format(value || 0);
  return formatted.replace(/^(A?\$)/, "$1 ");
};

const handleSubmit = async () => {
  if (!isValidOperation.value) return;

  isButtonLoading.value = true;
  try {
    const { data } = await publicPatch(
      `payment-gateways/${props.gateway._id}/adjust-balance`,
      {
        operation: formData.value.operation,
        amount: Number(formData.value.amount),
        remark: formData.value.remark,
      }
    );

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
        showConfirmButton: false,
      });

      emit("success");
      emit("update:show", false);
      resetForm();
    }
  } catch (error) {
    console.error("Error adjusting balance:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value = false;
  }
};

const handleCancel = () => {
  emit("update:show", false);
  resetForm();
};

const resetForm = () => {
  formData.value = {
    operation: "add",
    amount: "",
    remark: "",
  };
};

watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      resetForm();
    }
  }
);
</script>
