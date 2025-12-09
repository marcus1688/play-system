<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[500px] max-w-full">
        <!-- Modal Header -->
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ modalTitle }}
            </h2>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 max-md:space-y-3"
          >
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ amountLabel }}
              </label>
              <input
                v-model.number="formData.amount"
                type="number"
                required
                min="0"
                step="0.01"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("transaction_date") }}
              </label>
              <TransactionDatePicker
                v-model="formData.transactionDate"
                :placeholder="$t('select_date')"
              />
              <p class="text-xs text-gray-500 mt-1">
                {{ $t("leave_empty_for_current_time") }}
              </p>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >{{ $t("remark") }}</label
              >
              <textarea
                v-model="formData.remark"
                rows="3"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              ></textarea>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div
          class="p-6 border-t flex justify-end gap-3 max-md:p-4 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            type="button"
            @click="$emit('update:show', false)"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isLoading"
            @click="handleSubmit"
            :class="[
              submitButtonClass,
              'max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full',
            ]"
          >
            {{ submitButtonText }}
          </LoadingButton>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "",
    validator(value) {
      return ["cashin", "cashout", "startingbalance"].includes(value);
    },
  },
  bankData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const { post, patch } = useApiEndpoint();
const isLoading = ref(false);

const formData = ref({
  amount: "",
  remark: "",
  transactionDate: null,
});

const modalTitle = computed(() => {
  switch (props.type) {
    case "cashin":
      return $t("cash_in");
    case "cashout":
      return $t("cash_out");
    case "startingbalance":
      return $t("adjust_starting_balance");
    default:
      return "";
  }
});

const amountLabel = computed(() => {
  switch (props.type) {
    case "cashin":
      return $t("cash_in_amount");
    case "cashout":
      return $t("cash_out_amount");
    case "startingbalance":
      return $t("starting_balance");
    default:
      return $t("amount");
  }
});

const submitButtonText = computed(() => {
  switch (props.type) {
    case "cashin":
      return $t("confirm_cash_in");
    case "cashout":
      return $t("confirm_cash_out");
    case "startingbalance":
      return $t("update_balance");
    default:
      return $t("submit");
  }
});

const submitButtonClass = computed(() => {
  const baseClasses = "px-4 py-2 text-white rounded-lg";
  switch (props.type) {
    case "cashin":
      return `${baseClasses} bg-blue-500 lg:hover:bg-blue-600`;
    case "cashout":
      return `${baseClasses} bg-orange-400 lg:hover:bg-orange-500`;
    case "startingbalance":
      return `${baseClasses} bg-indigo-600 lg:hover:bg-indigo-500`;
    default:
      return `${baseClasses} bg-gray-500 lg:hover:bg-gray-600`;
  }
});

const handleSubmit = async () => {
  if (!props.bankData?._id) {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Invalid bank data",
    });
    return;
  }

  try {
    isLoading.value = true;

    const endpoint = {
      cashin: "cashin",
      cashout: "cashout",
      startingbalance: "updatestartingbalance",
    }[props.type];

    const payload = {
      id: props.bankData._id,
      amount: formData.value.amount,
      remark: formData.value.remark || "-",
      transactionDate: formData.value.transactionDate || null,
    };

    if (props.type === "startingbalance") {
      payload.startingBalance = formData.value.amount;
      delete payload.amount;
    }

    const { data } =
      props.type === "startingbalance"
        ? await patch(endpoint, payload)
        : await post(endpoint, payload);

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("success");
      emit("update:show", false);
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      formData.value = {
        amount:
          props.type === "startingbalance"
            ? props.bankData?.startingbalance || 0
            : "",
        remark: "",
        transactionDate: "",
      };
    }
  }
);
</script>
